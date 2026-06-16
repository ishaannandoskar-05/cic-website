import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";
import {
  generatePythonTemplate,
  generateJavaTemplate,
  generateCTemplate,
  generateCppTemplate,
} from "../compiler/templateGenerator.js";
import {
  executeCode,
  buildSource,
  normalise,
} from "../utils/dockerCompilerClient.js";
import Quest from "../models/Quest.js";
const router = express.Router();

// ─────────────────────────────────────────────────────────────
//  XP tiers (only awarded when ALL tests pass)
// ─────────────────────────────────────────────────────────────
const XP_TIERS = [
  { maxMs: 50, xp: 25, label: "Elite" },
  { maxMs: 100, xp: 18, label: "Excellent" },
  { maxMs: 150, xp: 15, label: "Great" },
  { maxMs: 200, xp: 12, label: "Very Good" },
  { maxMs: 300, xp: 10, label: "Good" },
  { maxMs: 500, xp: 8, label: "Above Average" },
  { maxMs: 750, xp: 6, label: "Average" },
  { maxMs: 1000, xp: 4, label: "Slow" },
  { maxMs: 1500, xp: 2, label: "Very Slow" },
  { maxMs: Infinity, xp: 1, label: "Passed" },
];

const tierForAvg = (ms) =>
  XP_TIERS.find((t) => ms <= t.maxMs) ?? XP_TIERS.at(-1);

// ─────────────────────────────────────────────────────────────
//  Starter templates shown in the editor.
//  The harness calling convention:
//    - Input  in DB: JSON array of args,  e.g.  [[2,7,11,15], 9]
//    - Output in DB: JSON value,          e.g.  [0,1]
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
//  Validate test case input: must be a JSON array of numbers
//  or arrays of numbers.
// ─────────────────────────────────────────────────────────────
const validateTestCase = (tc) => {
  try {
    const parsed = JSON.parse(tc.input);

    if (!Array.isArray(parsed)) {
      return "Input must be a JSON array of arguments";
    }

    return null;
  } catch (err) {
    return `Invalid JSON: ${err.message}`;
  }
};

// ─────────────────────────────────────────────────────────────
//  Run a single test case
// ─────────────────────────────────────────────────────────────
const runOne = async (
  language,
  userCode,
  argsJson,
  quest,
  timeoutMs = 8000,
) => {
  const source = buildSource(language, userCode, argsJson, quest);

  const result = await executeCode(language, source, "", timeoutMs);

  return result;
};

// ─────────────────────────────────────────────────────────────
//  Run all test cases
//  Each testcase.input must be a valid JSON array of arguments,
//  e.g.  [[2,7,11,15], 9]   ->  solve([2,7,11,15], 9)
// ─────────────────────────────────────────────────────────────
const runAll = async (language, userCode, testcases, quest) => {
  const results = [];
  const times = [];
  let allPassed = true;

  if (testcases.length === 0) {
    // Smoke-test with empty args
    const t0 = performance.now();
    const r = await runOne(language, userCode, "[]", quest, 8000);
    const ms = performance.now() - t0;
    results.push({
      id: 1,
      input: "(none)",
      expectedOutput: "(no test cases)",
      actualOutput: r.output,
      passed: !r.error,
      error: r.error || null,
      executionTime: ms,
      explanation: "",
    });
    times.push(ms);
    allPassed = !r.error;
  } else {
    for (let i = 0; i < testcases.length; i++) {
      const tc = testcases[i];
      const argsJson = tc.input; // stored as JSON array string in DB

      const t0 = performance.now();
      const r = await runOne(language, userCode, argsJson, quest, 8000);
      const ms = performance.now() - t0;

      // Compare normalised JSON output
      const passed =
        !r.error && normalise(r.output) === normalise(tc.expectedOutput ?? "");
      allPassed = allPassed && passed;
      times.push(ms);

      results.push({
        id: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: r.output,
        passed,
        error: r.error || null,
        executionTime: ms,
        explanation: tc.explanation || "",
      });
    }
  }

  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  const tier = tierForAvg(avgMs);
  return {
    results,
    allPassed,
    avgMs,
    tier,
    xpAwarded: allPassed ? tier.xp : 0,
  };
};

// ─────────────────────────────────────────────────────────────
//  XP persistence — only called server-side after verified pass
// ─────────────────────────────────────────────────────────────
const awardXP = async (userId, xp) => {
  try {
    const user = await User.findById(userId);

    if (!user) return;

    // Award XP
    user.xp = (user.xp || 0) + xp;
    user.solvedCount = (user.solvedCount || 0) + 1;

    // Streak calculation based on calendar days
    const today = new Date();
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const daysDifference = (todayMidnight - lastActive) / 86400000;

      if (daysDifference === 1) {
        // Consecutive day
        user.streak = (user.streak || 0) + 1;
      } else if (daysDifference > 1) {
        // Missed one or more days
        user.streak = 1;
      }
      // daysDifference === 0
      // same day -> keep streak unchanged
    } else {
      // First ever activity
      user.streak = 1;
    }

    user.lastActiveDate = today;
    await user.save();
    return {
      xp: user.xp,
      streak: user.streak,
      solvedCount: user.solvedCount,
    };
  } catch (err) {
    console.error("XP award error:", err);
  }
};

// ─────────────────────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/compiler/execute
 * Body: { language, code, testcases }
 *   testcases[].input          -- JSON array string of solve() arguments
 *   testcases[].expectedOutput -- JSON string of expected return value
 *   testcases[].explanation    -- optional explanation string
 */
router.post("/execute", protect, async (req, res) => {
  const { language, code, testcases = [] } = req.body;
  const { questId } = req.body;
  let allTestcases = [...testcases];
  let quest = null;

  if (questId) {
    quest = await Quest.findById(questId);

    if (quest?.hiddenTestcases?.length) {
      allTestcases = [...testcases, ...quest.hiddenTestcases];
    }
  }
  if (!language || !code)
    return res
      .status(400)
      .json({ success: false, error: "language and code are required." });

  const SUPPORTED = ["Python", "Java", "C", "C++"];
  if (!SUPPORTED.includes(language))
    return res.status(400).json({
      success: false,
      error: `"${language}" not supported. Use: ${SUPPORTED.join(", ")}.`,
    });

  // Validate test case inputs before execution
  for (const tc of allTestcases) {
    const validationError = validateTestCase(tc);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: `Invalid test case: ${validationError}`,
      });
    }
  }

  try {
    const { results, allPassed, avgMs, tier, xpAwarded } = await runAll(
      language,
      code,
      allTestcases,
      quest,
    );

    const publicResults = results.slice(0, testcases.length);
    let effectiveXp = xpAwarded;

    if (allPassed && xpAwarded > 0 && req.user?._id && req.body.questId) {
      const user = await User.findById(req.user._id);

      if (user) {
        const alreadySolved = (user.solvedQuests || []).some(
          (q) => q.toString() === req.body.questId,
        );

        if (!alreadySolved) {
          await awardXP(req.user._id, xpAwarded);

          await User.findByIdAndUpdate(user._id, {
            $addToSet: {
              solvedQuests: req.body.questId,
            },
          });
        } else {
          effectiveXp = 0;
        }
      }
    }

    res.json({
      success: allPassed,
      allTestsPassed: allPassed,
      results: publicResults,
      averageTime: avgMs,
      performanceLabel: tier.label,
      xpAwarded: effectiveXp,
      passedCount: publicResults.filter((r) => r.passed).length,
      totalCount: publicResults.length,
    });
  } catch (err) {
    console.error("Compiler error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** POST /api/compiler/compile -- smoke test, no test cases */
router.post("/compile", protect, async (req, res) => {
  const { language, code } = req.body;
  if (!language || !code)
    return res
      .status(400)
      .json({ success: false, error: "language and code are required." });

  const SUPPORTED = ["Python", "Java", "C", "C++"];
  if (!SUPPORTED.includes(language))
    return res
      .status(400)
      .json({ success: false, error: `"${language}" not supported.` });

  try {
    const dummyQuest = {
      functionName: "solve",
      returnType: "int",
      parameters: [],
    };
    const r = await runOne(language, code, "[]", dummyQuest, 8000);
    res.json({ success: !r.error, output: r.output, error: r.error });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/compiler/runtimes */
router.get("/runtimes", protect, (req, res) => {
  res.json({
    Python: true,
    Java: true,
    C: true,
    "C++": true,
  });
});

/** GET /api/compiler/templates */
router.get(
  "/templates/:questId",
  protect,
  async (req, res) => {

    const quest =
      await Quest.findById(
        req.params.questId
      );

    if (!quest) {
      return res
        .status(404)
        .json({
          error: "Quest not found"
        });
    }

    res.json({
      Python:
        generatePythonTemplate(
          quest
        ),

      Java:
        generateJavaTemplate(
          quest
        ),

      C:
        generateCTemplate(
          quest
        ),

      "C++":
        generateCppTemplate(
          quest
        ),
    });
  }
);

export default router;