import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { executeCode, buildSource, normalise } from '../utils/onlineCompilerClient.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
//  XP tiers (only awarded when ALL tests pass)
// ─────────────────────────────────────────────────────────────
const XP_TIERS = [
  { maxMs: 30,       xp: 25, label: 'O(1) / O(log n)' },
  { maxMs: 100,      xp: 18, label: 'O(n)'            },
  { maxMs: 300,      xp: 10, label: 'O(n log n)'      },
  { maxMs: 800,      xp:  5, label: 'O(n²)'           },
  { maxMs: Infinity, xp:  3, label: 'Brute-force'     },
];
const tierForAvg = (ms) => XP_TIERS.find((t) => ms < t.maxMs) ?? XP_TIERS.at(-1);

// ─────────────────────────────────────────────────────────────
//  Starter templates shown in the editor
//  The student writes ONLY the solve() function body.
//  The harness calling convention:
//    - Input  in DB: JSON array of args,  e.g.  [[2,7,11,15], 9]
//    - Output in DB: JSON value,          e.g.  [0,1]
// ─────────────────────────────────────────────────────────────
export const STARTER_TEMPLATES = {

  Python: `# solve() receives the test-case arguments directly.
# The judge calls: solve(*args) for each test case.
# Return your answer — do NOT print/use stdin.
#
# Example: for input [[2,7,11,15], 9]  →  solve([2,7,11,15], 9)

def solve(nums, target):
    # Write your solution here
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
`,

  Java: `// Write your solution inside Solution class.
// main() receives a JSON-array string of arguments via args[0].
// Parse what you need, compute the answer, and print it.
//
// Example: for input [[2,7,11,15], 9]
//   args[0] = "[[2,7,11,15],9]"

public class Solution {
    public static int[] solve(int[] nums, int target) {
        // Write your solution here
        Map<Integer,Integer> seen = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (seen.containsKey(comp)) return new int[]{seen.get(comp), i};
            seen.put(nums[i], i);
        }
        return new int[]{};
    }

    public static void main(String[] args) throws Exception {
        // Parse args[0] as the test-case JSON array
        String[] parts = _Runner.splitJsonArray(args[0]);
        int[] nums   = _Runner.parseIntArray(parts[0]);
        int   target = _Runner.parseInt(parts[1]);

        int[] result = solve(nums, target);
        // Print result as JSON array
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(result[i]);
        }
        sb.append("]");
        System.out.println(sb);
    }
}
`,

  C: `/* solve() receives the test-case arguments directly via main().
   args[0] holds the JSON-array string of test-case inputs.
   Parse, compute, and printf the JSON result.

   Example: for input [[2,7,11,15], 9]  →  args[0] = "[[2,7,11,15],9]"
*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Simple int-array parser: fills arr[], returns count */
int parse_int_array(const char *s, int *arr, int max) {
    int count = 0;
    const char *p = s;
    while (*p && *p != '[') p++;
    if (*p == '[') p++;
    while (*p && *p != ']' && count < max) {
        while (*p == ' ' || *p == ',') p++;
        if (*p == ']' || !*p) break;
        arr[count++] = (int)strtol(p, (char**)&p, 10);
    }
    return count;
}

int parse_int(const char *s) { return (int)strtol(s, NULL, 10); }

int* solve(int* nums, int n, int target, int* resultSize) {
    /* Write your solution here */
    int *result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < n; i++)
        for (int j = i+1; j < n; j++)
            if (nums[i] + nums[j] == target) {
                result[0] = i; result[1] = j;
                *resultSize = 2;
                return result;
            }
    *resultSize = 0;
    return result;
}

int main(int argc, char *argv[]) {
    if (argc < 2) return 1;
    const char *argsJson = argv[1];

    /* Parse test-case JSON: [[2,7,11,15],9] */
    int nums[1024]; int n = parse_int_array(argsJson, nums, 1024);
    /* find target after the closing ] of the array */
    const char *p = argsJson;
    while (*p && *p != ']') p++;
    if (*p) p++;          /* skip ] */
    while (*p == ',' || *p == ' ') p++;
    int target = parse_int(p);

    int resultSize = 0;
    int *result = solve(nums, n, target, &resultSize);

    printf("[");
    for (int i = 0; i < resultSize; i++) {
        if (i > 0) printf(",");
        printf("%d", result[i]);
    }
    printf("]\\n");
    free(result);
    return 0;
}
`,

  'C++': `// solve() receives the test-case arguments as JSON.
// Return your answer as a JSON value.
//
// Example: for input [[2,7,11,15], 9]  →  solve passes the JSON array

#include <iostream>
#include <vector>
#include <unordered_map>
#include <string>
#include <nlohmann/json.hpp>
using json = nlohmann::json;

json solve(const json& args) {
    // Write your solution here
    // Example: Extract parameters from args
    // If args = [[2,7,11,15], 9], then:
    // args[0] = [2,7,11,15], args[1] = 9
    
    return json::array();
}
`,
};

// ─────────────────────────────────────────────────────────────
//  Run a single test case
// ─────────────────────────────────────────────────────────────
const runOne = async (language, userCode, argsJson, timeoutMs = 8000) => {
  const source = buildSource(language, userCode, argsJson);
  const result = await executeCode(language, source, '', timeoutMs);
  return result;
};

// ─────────────────────────────────────────────────────────────
//  Run all test cases
//  Each testcase.input must be a valid JSON array of arguments,
//  e.g.  [[2,7,11,15], 9]   →  solve([2,7,11,15], 9)
// ─────────────────────────────────────────────────────────────
const runAll = async (language, userCode, testcases) => {
  const results   = [];
  const times     = [];
  let   allPassed = true;

  if (testcases.length === 0) {
    // Smoke-test with empty args
    const t0 = performance.now();
    const r  = await runOne(language, userCode, '[]', 8000);
    const ms = performance.now() - t0;
    results.push({
      id: 1, input: '(none)', expectedOutput: '(no test cases)',
      actualOutput: r.output, passed: !r.error,
      error: r.error || null, executionTime: ms, explanation: '',
    });
    times.push(ms);
    allPassed = !r.error;

  } else {
    for (let i = 0; i < testcases.length; i++) {
      const tc       = testcases[i];
      const argsJson = tc.input;   // stored as JSON array string in DB

      const t0 = performance.now();
      const r  = await runOne(language, userCode, argsJson, 8000);
      const ms = performance.now() - t0;

      // Compare normalised JSON output
      const passed = !r.error && normalise(r.output) === normalise(tc.expectedOutput ?? '');
      allPassed    = allPassed && passed;
      times.push(ms);

      results.push({
        id:             i + 1,
        input:          tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput:   r.output,
        passed,
        error:          r.error || null,
        executionTime:  ms,
        explanation:    tc.explanation || '',
      });
    }
  }

  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  const tier  = tierForAvg(avgMs);
  return { results, allPassed, avgMs, tier, xpAwarded: allPassed ? tier.xp : 0 };
};

// ─────────────────────────────────────────────────────────────
//  XP persistence
// ─────────────────────────────────────────────────────────────
const awardXP = async (userId, xp) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    user.xp         = (user.xp         || 0) + xp;
    user.solvedCount = (user.solvedCount || 0) + 1;
    const today = new Date();
    if (user.lastActiveDate) {
      const days = Math.round(Math.abs(today - new Date(user.lastActiveDate)) / 86_400_000);
      if (days === 1)    user.streak = (user.streak || 0) + 1;
      else if (days > 1) user.streak = 1;
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = today;
    await user.save();
  } catch (err) {
    console.error('XP award error:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/compiler/execute
 * Body: { language, code, testcases }
 *   testcases[].input        — JSON array string of solve() arguments
 *   testcases[].expectedOutput — JSON string of expected return value
 */
router.post('/execute', protect, async (req, res) => {
  const { language, code, testcases = [] } = req.body;

  if (!language || !code)
    return res.status(400).json({ success: false, error: 'language and code are required.' });

  const SUPPORTED = ['Python', 'Java', 'C', 'C++'];
  if (!SUPPORTED.includes(language))
    return res.status(400).json({ success: false, error: `"${language}" not supported. Use: ${SUPPORTED.join(', ')}.` });

  try {
    const { results, allPassed, avgMs, tier, xpAwarded } = await runAll(language, code, testcases);

    if (allPassed && xpAwarded > 0 && req.user?._id)
      await awardXP(req.user._id, xpAwarded);

    res.json({
      success:             allPassed,
      allTestsPassed:      allPassed,
      results,
      averageTime:         avgMs,
      timeComplexityLabel: tier.label,
      xpAwarded,
      passedCount:         results.filter((r) => r.passed).length,
      totalCount:          results.length,
    });
  } catch (err) {
    console.error('Compiler error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/** POST /api/compiler/compile — smoke test, no test cases */
router.post('/compile', protect, async (req, res) => {
  const { language, code } = req.body;
  if (!language || !code)
    return res.status(400).json({ success: false, error: 'language and code are required.' });

  const SUPPORTED = ['Python', 'Java', 'C', 'C++'];
  if (!SUPPORTED.includes(language))
    return res.status(400).json({ success: false, error: `"${language}" not supported.` });

  try {
    const r = await runOne(language, code, '[]', 8000);
    res.json({ success: !r.error, output: r.output, error: r.error });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/compiler/runtimes */
router.get('/runtimes', protect, (req, res) => {
  // All supported languages are available via the API
  res.json({
    Python: true,
    Java:   true,
    C:      true,
    'C++':  true,
  });
});

/** GET /api/compiler/templates */
router.get('/templates', protect, (req, res) => {
  res.json(STARTER_TEMPLATES);
});

export default router;
