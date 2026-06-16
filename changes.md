# Changes Log

## Date

June 2026

---

# Compiler System Improvements

## 1. Fixed Streak Calculation

### Previous Issue

The streak calculation used:

```js
Math.round(
  Math.abs(today - lastActiveDate) / 86400000
)
```

This could incorrectly increment streaks due to timezone differences and partial-day rounding.

### Solution

Changed to calendar-day comparison:

```js
const todayMidnight = new Date(today);
todayMidnight.setHours(0, 0, 0, 0);

const lastActive = new Date(user.lastActiveDate);
lastActive.setHours(0, 0, 0, 0);

const daysDifference =
  (todayMidnight - lastActive) / 86400000;
```

### Result

* Same day → streak unchanged
* Next day → streak incremented
* Missed days → streak reset

---

# 2. Added Hidden Test Cases

## Previous Issue

All test cases were visible to users.

Users could hardcode solutions based on visible inputs and outputs.

Example:

```python
def solve(nums, target):
    return [0,1]
```

would pass if only one test case existed.

## Solution

Added support for:

```js
hiddenTestcases
```

inside Quest documents.

### Quest Schema

```js
hiddenTestcases: {
  type: [testCaseSchema],
  default: [],
}
```

### Execution Flow

Compiler now executes:

```text
Visible Test Cases
+
Hidden Test Cases
```

but only returns visible results.

### Result

Users cannot see hidden validation cases.

---

# 3. Hidden Test Validation

## Previous Issue

Only visible test cases were validated.

Hidden test cases could contain malformed data.

## Solution

Changed:

```js
for (const tc of testcases)
```

to:

```js
for (const tc of allTestcases)
```

### Result

All executed tests are validated before running.

---

# 4. Hidden Test Result Protection

## Previous Issue

Hidden test results were returned to the frontend.

This exposed hidden inputs and expected outputs.

## Solution

Added:

```js
const publicResults =
  results.slice(0, testcases.length);
```

Response now returns:

```js
results: publicResults
```

instead of all results.

### Result

Hidden test cases remain private.

---

# 5. XP Farming Prevention

## Previous Issue

Users could repeatedly submit the same solved problem and gain unlimited XP.

## Solution

Added:

```js
solvedQuests
```

to User schema.

### User Schema

```js
solvedQuests: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quest",
  },
],
```

### XP Award Logic

Before awarding XP:

```js
const alreadySolved =
  (user.solvedQuests || []).some(
    q => q.toString() === questId
  );
```

XP is only awarded if:

```js
alreadySolved === false
```

### Result

Each quest grants XP only once per user.

---

# 6. Quest Tracking

Compiler now stores solved quest IDs:

```js
user.solvedQuests.push(questId);
```

This enables:

* XP farming prevention
* Future achievements
* Progress tracking
* Completion statistics

---

# 7. Quest ID Integration

Compiler endpoint now accepts:

```json
{
  "language": "Python",
  "code": "...",
  "testcases": [...],
  "questId": "..."
}
```

### Result

Compiler can:

* Load hidden tests
* Prevent duplicate rewards
* Track solved quests

---

# 8. Runtime Validation

Supported runtimes are now restricted to:

```js
[
  "Python",
  "Java",
  "C",
  "C++"
]
```

### Result

Frontend and backend runtime support remain consistent.

---

# 9. Dynamic Event Dashboard

Updated dashboard statistics to be dynamic.

### Changes

#### Events Count

Replaced hardcoded values with:

```js
calendarEvents.length
```

#### Registration Count

Calculated using:

```js
calendarEvents.reduce(...)
```

#### Current Month

Replaced hardcoded month labels with:

```js
new Date().toLocaleString(...)
```

### Result

Dashboard automatically updates based on current data.

---

# 10. Upcoming Events Month Fix

## Previous Issue

Upcoming events always displayed:

```text
Jan
```

because:

```js
date: `Jan ${event.day}`
```

was hardcoded.

## Solution

Changed to:

```js
const currentMonthShort =
  new Date().toLocaleString(
    "default",
    { month: "short" }
  );
```

and:

```js
date: `${currentMonthShort} ${event.day}`
```

### Result

Upcoming events display the correct month.

---

# 11. Compiler Verification

Verified that:

* User code is executed inside the compiler
* Test cases are actually run
* Outputs are compared against expected outputs
* XP is awarded only when all tests pass
* Hidden tests can be supported
* Runtime validation is enforced

---
# 12. Daily Quest Admin Panel Improvements

## Hidden Test Case Management

### Previous Issue

The admin panel only supported visible test cases:

```js
testcases
```

This meant all validation cases were exposed to students.

Even though the compiler backend supported:

```js
hiddenTestcases
```

there was no way for admins to create or edit them.

---

## Changes Required

### Form State

Added support for:

```js
hiddenTestcase1Input
hiddenTestcase1Output

hiddenTestcase2Input
hiddenTestcase2Output

hiddenTestcase3Input
hiddenTestcase3Output
```

---

### Quest Creation

Updated:

```js
publishQuestion()
```

to build:

```js
const hiddenTestcases = [];
```

and send:

```js
await api.quests.create({
  ...
  testcases,
  hiddenTestcases,
});
```

---

### Quest Updates

Updated:

```js
updateQuestion()
```

to send:

```js
await api.quests.update(
  selected.id,
  {
    ...
    testcases,
    hiddenTestcases,
  }
);
```

---

### Editing Existing Quests

When selecting a quest:

```js
setSelected(question);
```

the editor now loads:

```js
question.hiddenTestcases
```

into the form.

This allows administrators to:

* View hidden tests
* Edit hidden tests
* Maintain hidden validations

---

### UI Improvements

Added a dedicated:

```text
Hidden Test Cases
```

section in the Quest Editor.

Each hidden testcase contains:

* Input
* Expected Output

Hidden tests are never shown to students.

---

## Security Benefits

### Before

Students could potentially:

* Read every testcase
* Hardcode outputs
* Pass quests without solving them

### After

Students only see:

```js
testcases
```

while the backend also validates:

```js
hiddenTestcases
```

making hardcoded solutions much harder.

---

## Future Improvement

Replace hardcoded fields:

```js
testcase1
testcase2
testcase3
```

with dynamic arrays:

```js
testcases: []

hiddenTestcases: []
```

and render them using:

```js
.map()
```

This would allow:

* Unlimited test cases
* Unlimited hidden test cases
* Cleaner admin UI
* Easier maintenance

---

## Files Modified

### Frontend

* ManageDailyQuestPage.jsx

### Backend

* compiler.js
* Quest.js

### Result

✅ Hidden testcase creation

✅ Hidden testcase editing

✅ Hidden testcase persistence

✅ Better problem security

✅ Full compatibility with compiler hidden-test support


# Remaining Future Improvements

## Complexity Detection

Current XP tiers are based on execution time:

```js
tierForAvg(avgMs)
```

This is not true algorithmic complexity analysis.

Future improvement:

* Benchmark with varying input sizes
* Estimate complexity curves
* Award XP based on scalability rather than raw runtime

---

# Files Modified

### Backend

* routes/compiler.js
* models/User.js
* models/Quest.js

### Frontend

* Dashboard page
* Events page
* Daily Quest page

---

# Outcome

The platform now has:

✅ Hidden test cases

✅ XP farming prevention

✅ Correct streak tracking

✅ Dynamic dashboard statistics

✅ Dynamic month rendering

✅ Protected hidden test results

✅ Quest completion tracking

✅ Runtime validation

✅ More secure online judge behavior
