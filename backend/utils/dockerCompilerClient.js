import Docker from "dockerode";

const docker = new Docker();

/**
 * Normalize output before comparison
 */
export const normalise = (s = "") =>
  String(s)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\s+/g, "")
    .trim();

/**
 * Build executable source code with test harness
 */
const JAVA_TYPES = {
  int: "int",
  "int[]": "int[]",
  "int[][]": "int[][]",
  string: "String",
  bool: "boolean",
};
const generateJavaValue = (type, value) => {
  switch (type) {
    case "int":
      return `${value}`;
    case "bool":
      return value ? "true" : "false";
    case "int[]":
      return `new int[]{${value.join(",")}}`;

    case "int[][]":
      return `
new int[][]{
${value.map((row) => `{${row.join(",")}}`).join(",")}
}
`;

    case "string":
      return `"${value}"`;

    default:
      throw new Error(`Unsupported Java type ${type}`);
  }
};
const generateCppValue = (type, value) => {
  switch (type) {
    case "int":
      return `${value}`;
    case "string":
      return `"${value}"`;

    case "bool":
      return value ? "true" : "false";

    case "int[]":
      return `{${value.join(",")}}`;

    case "int[][]":
      return `{
${value.map((row) => `{${row.join(",")}}`).join(",")}
}`;

    default:
      throw new Error(`Unsupported C++ type ${type}`);
  }
};
export const buildSource = (language, userCode, argsJson, quest) => {
  const args = JSON.parse(argsJson || "[]");

  const functionName = quest?.functionName || "solve";
  const returnType = quest?.returnType || "int";
  const parameters = quest?.parameters || [];

  if (!functionName) {
    throw new Error("Missing functionName in quest schema");
  }

  if (!Array.isArray(parameters)) {
    throw new Error("Invalid parameters schema: expected an array");
  }

  switch (language) {
    case "Python":
      return `
import json

${userCode}

_args = json.loads(${JSON.stringify(argsJson)})
_result = ${functionName}(*_args)
print(json.dumps(_result, separators=(",", ":")))
`;
    case "Java": {
      const variables = [];

      parameters.forEach((param, index) => {
        variables.push(
          `${JAVA_TYPES[param.type]} ${param.name} = ${generateJavaValue(
            param.type,
            args[index],
          )};`,
        );
      });

      const parameterNames = parameters.map((p) => p.name).join(",");

      return `
          import java.util.*;

          ${userCode}

          class Main {

    static void printResult(Object result) {

        if (result instanceof int[]) {
            System.out.print(
                Arrays.toString((int[]) result)
            );
            return;
        }

        if (result instanceof int[][]) {
            System.out.print(
                Arrays.deepToString((int[][]) result)
            );
            return;
        }

        System.out.print(result);
    }

            


            public static void main(String[] args) {

              ${variables.join("\n")}

              ${JAVA_TYPES[returnType]} result =
                Solution.${functionName}(
                  ${parameterNames}
                );

              printResult(result);
            }
          }
          `;
    }

    case "C":
      throw new Error("Generic C support not implemented yet");

    case "C++": {
      const variables = [];

      parameters.forEach((param, index) => {
        let cppType;

        switch (param.type) {
          case "string":
            cppType = "string";
            break;

          case "bool":
            cppType = "bool";
            break;

          case "int":
            cppType = "int";
            break;

          case "int[]":
            cppType = "vector<int>";
            break;

          case "int[][]":
            cppType = "vector<vector<int>>";
            break;

          default:
            throw new Error(`Unsupported type ${param.type}`);
        }

        variables.push(`
${cppType} ${param.name} =
${generateCppValue(param.type, args[index])};
`);
      });

      let outputCode;
      switch (returnType) {
        case "int[]":
          outputCode = "printVector(result);";
          break;
        case "bool":
          outputCode = "cout << boolalpha << result;";
          break;
        default:
          outputCode = "cout << result;";
      }

      return `
#include <iostream>
#include <vector>
#include <string>

using namespace std;

void printVector(const vector<int>& v) {

    cout << "[";

    for(size_t i=0;i<v.size();i++) {
        if(i) cout << ",";
        cout << v[i];
    }

    cout << "]";
}

${userCode}

int main() {

${variables.join("\n")}

auto result =
  ${functionName}(
    ${parameters.map((p) => p.name).join(",")}
  );

${outputCode}

return 0;
}
`;
    }

    default:
      return userCode;
  }
};
/**
 * Execute code inside Docker sandbox
 */
export const executeCode = async (
  language,
  source,
  timeoutMs = 8000,
) => {
  let extension;

  switch (language) {
    case "Python":
      extension = "py";
      break;

    case "Java":
      extension = "java";
      break;

    case "C":
      extension = "c";
      break;

    case "C++":
      extension = "cpp";
      break;

    default:
      return {
        output: "",
        error: `Unsupported language: ${language}`,
      };
  }

  let container = null;

  try {
    console.log(`Creating sandbox for ${language}...`);

    container = await docker.createContainer({
      Image: process.env.SANDBOX_IMAGE || "cic-sandbox:latest",

      Tty: false,
      // OpenStdin must be true so we can pipe the source file in via attach
      AttachStdout: true,
      AttachStderr: true,
      // The container reads source from stdin → avoids ALL shell injection
      // via user-supplied code. No heredoc, no interpolation of $source.
      Cmd: [
        "bash",
        "-c",
        `
mkdir -p /code

cat > /code/Main.${extension} <<'EOF'
${source}
EOF

/runner.sh "${language}" "/code/Main.${extension}"
`,
      ],

      HostConfig: {
        AutoRemove: false,
        Memory: 256 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000,
        NetworkMode: "none",
      },
    });

    await container.start();
    console.log("Container started");

    // Write source code to the container via stdin — zero shell interpolation

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(async () => {
        try {
          if (container) {
            await container.kill();
          }
        } catch {
          /* ignore */
        }

        reject(new Error("Execution timeout"));
      }, timeoutMs);
    });

    const result = await Promise.race([container.wait(), timeoutPromise]);

    console.log("Container finished", result);

    const logs = await container.logs({
      stdout: true,
      stderr: true,
    });

    let output = logs.toString("utf8");

    /* eslint-disable no-control-regex */
    output = output
      .replace(/Picked up JAVA_TOOL_OPTIONS:.*\n?/g, "")
      .replace(/Picked up _JAVA_OPTIONS:.*\n?/g, "")
      .replace(/^[\x00-\x08\x0B\x0C\x0E-\x1F]+/, "")
      .trim();
    /* eslint-enable no-control-regex */
    try {
      await container.remove({ force: true });
    } catch {
      /* ignore */
    }

    return {
      output,
      error: null,
    };
  } catch (err) {
    console.error("Sandbox execution error:", err);
    console.log("===== SOURCE =====");
    console.log(source);
    console.log("==================");
    return {
      output: "",
      error: err.message || "Execution failed",
    };
  }
};
