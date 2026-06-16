const JAVA_TYPES = {
  int: "int",
  "int[]": "int[]",
  "int[][]": "int[][]",
  string: "String",
  "string[]": "String[]",
};

const C_TYPES = {
  int: "int",
  "int[]": "int*",
  "int[][]": "int**",
};

export const generateJavaTemplate = (quest) => {

  const params = quest.parameters
    .map(
      p => `${JAVA_TYPES[p.type]} ${p.name}`
    )
    .join(", ");

  return `class Solution {

    public static ${
      JAVA_TYPES[quest.returnType]
    } ${quest.functionName}(
      ${params}
    ) {

        // Write your solution here

    }
}`;
};

export const generatePythonTemplate = (
  quest
) => {

  const params = quest.parameters
    .map(p => p.name)
    .join(", ");

  return `def ${
    quest.functionName
  }(${params}):

    # Write your solution here

    pass`;
};

export const generateCTemplate = (quest) => {

  const params = quest.parameters
    .map(
      p => `${C_TYPES[p.type]} ${p.name}`
    )
    .join(", ");

  return `${C_TYPES[quest.returnType]}
${quest.functionName}(
    ${params}
) {

    // Write your solution here

}`;
};

export const generateCppTemplate = (
  quest
) => {

  const params = quest.parameters
    .map(p => {
      switch (p.type) {
        case "int":
          return `int ${p.name}`;

        case "int[]":
          return `vector<int>& ${p.name}`;

        case "int[][]":
          return `vector<vector<int>>& ${p.name}`;

        default:
          return `auto ${p.name}`;
      }
    })
    .join(", ");

  return `#include <vector>
using namespace std;

auto ${quest.functionName}(
    ${params}
) {

    // Write your solution here

}`;
};