# Requirements

## 1. Fixed Dark Mode

The application must provide a stable dark mode across all student and admin pages.

- Dark mode must persist across page reloads using the existing theme storage mechanism.
- All major surfaces, cards, forms, buttons, modals, tables, charts, and navigation elements must remain readable in dark mode.
- Tailwind arbitrary-value selectors in `src/index.css` must be valid CSS and must not produce Vite build warnings.
- Text contrast must be sufficient for headings, body text, placeholders, disabled controls, and error/success messages.
- Dark mode must not break uploaded images, gallery cards, resource cards, calendar events, admin forms, or the code editor.

## 2. Working Daily Quiz Compiler

The daily quiz compiler must execute user-submitted code against the daily quest test cases and return accurate per-test results.

- `backend/routes/compiler.js` must contain only one valid compiler route implementation.
- `node --check backend/routes/compiler.js` must pass.
- `/api/compiler/execute` must accept:
  - `language`
  - `code`
  - `testcases`
- Each test case must include:
  - `input`
  - `expectedOutput`
  - optional `explanation`
- The compiler must pass test-case inputs as function parameters, not as raw strings.
- Test-case inputs must support arrays/lists of numbers and individual numbers.
- If the quest author does not specify a type, the compiler must infer numeric parameter types from valid JSON values.
- String parameters must not be assumed unless explicitly supported by the quest schema later.
- The compiled output must be normalized and compared with the expected output.
- Each result must include:
  - input
  - expected output
  - actual output
  - pass/fail status
  - execution time
  - error message, if any

## 3. Test Case Parameter Rules

Daily quest test cases must use JSON-compatible parameter input.

Accepted examples:

```json
{ "input": "[[2,7,11,15], 9]", "expectedOutput": "[0,1]" }
{ "input": "[5]", "expectedOutput": "120" }
{ "input": "[[1,2,3,4]]", "expectedOutput": "10" }
```

Rejected examples:

```json
{ "input": "nums = [2,7,11,15], target = 9", "expectedOutput": "[0,1]" }
{ "input": "hello world", "expectedOutput": "true" }
```

Validation requirements:

- `input` must parse as a JSON array.
- Each parameter inside the array must be either:
  - a number
  - an array/list of numbers
- `expectedOutput` must parse as JSON or be comparable after numeric/string normalization.
- Invalid test cases must return a clear validation error before code execution.

## 4. Compiler Output Comparison

The compiler must compare submitted code output against `expectedOutput`.

- Output comparison must ignore harmless whitespace differences.
- JSON arrays and numbers must be compared structurally where possible.
- Numeric output such as `5` and `"5"` may be normalized to the same value only when the expected output is numeric.
- Array output such as `[0,1]` must match the expected array after JSON normalization.
- Failed tests must show both expected and actual output.

## 5. XP Assignment by Time Complexity

XP must be awarded only when all test cases pass.

- XP must be calculated from average execution time across all test cases.
- Faster average runtimes should receive higher XP.
- Slower but correct solutions should receive lower XP.
- Failed or partially passing submissions must receive `0` XP.
- The API response must include:
  - `xpAwarded`
  - `averageTime`
  - `timeComplexityLabel`
  - `passedCount`
  - `totalCount`

Suggested XP tiers:

- `<= 30ms`: 25 XP, label `O(1) / O(log n)`
- `<= 100ms`: 18 XP, label `O(n)`
- `<= 300ms`: 10 XP, label `O(n log n)`
- `<= 800ms`: 5 XP, label `O(n^2)`
- `> 800ms`: 3 XP, label `Brute-force`

## 6. Automatic MongoDB XP Update

When a user passes all daily quest test cases, XP and activity fields must update automatically in MongoDB.

- The authenticated user's `xp` must increase by `xpAwarded`.
- The authenticated user's `solvedCount` must increase after a successful solve.
- The authenticated user's `lastActiveDate` must update to the current date.
- The authenticated user's `streak` must update based on consecutive active days.
- XP updates must happen server-side only after verified compiler success.
- The frontend must not be trusted to calculate or assign XP.
- The updated XP should be reflected in leaderboard and analytics responses.

Relevant schema fields in `backend/models/User.js`:

- `xp`
- `streak`
- `solvedCount`
- `lastActiveDate`

## 7. Dynamic Monthly Calendar Page

The calendar page must render dynamically based on event data from the backend.

- The page must display the current month by default.
- Users must be able to navigate to previous and next months.
- The calendar grid must adjust to the selected month and year.
- Events must be placed on their correct dates.
- Empty calendar cells must be handled cleanly.
- Calendar data must come from `/api/events`, not hardcoded arrays.
- Admin-created, updated, or deleted events must be reflected on reload.

## 8. Dynamic Event Count on Calendar Page

The calendar page must display the number of events dynamically.

- Total event count must be calculated from loaded event data.
- Monthly event count must update when the selected month changes.
- Category/type counts should update from the same event list.
- Counts must update after admin changes are saved and the calendar data is refreshed.
- Hardcoded event totals are not allowed.

## 9. Dynamic Registration Count on Calendar Page

The calendar page must show dynamic registration counts for events.

- Each event must support a registration count field or derived registration relationship.
- Calendar event cards/details must display the current number of registrations.
- Total registrations for the selected month must be calculated dynamically.
- Registration counts must update after a user registers or unregisters.
- Registration counts must be stored or derived from MongoDB, not maintained only in frontend state.

Suggested backend support:

- Add registration tracking to the event model, such as:
  - `registrations: [{ type: ObjectId, ref: 'User' }]`
  - or `registrationCount: Number` if only counts are needed.
- Add authenticated endpoints for:
  - registering for an event
  - unregistering from an event
  - fetching event registration counts

## 10. Admin Event Management

Admin calendar management must support dynamic event data.

- Admins must be able to create, edit, and delete events.
- Event data should include:
  - title
  - type/category
  - date
  - venue
  - optional description
  - optional registration settings
- The backend event schema should use a full date field instead of day-only storage so events can support any month and year.
- Existing day-only events should be migrated or normalized.

## 11. Verification Requirements

The following checks must pass before the feature set is considered complete:

- `npm run build` completes without dark-mode CSS warnings.
- `npm run lint` completes without scanning generated or dependency folders.
- `node --check backend/routes/compiler.js` passes.
- Daily quest compiler executes all test cases.
- Compiler rejects invalid string-style inputs with a clear error.
- Compiler passes numeric arrays and numeric parameters into the submitted function.
- Compiler compares actual output with expected output correctly.
- XP is updated in MongoDB only after all tests pass.
- Calendar renders the selected month dynamically.
- Calendar event count updates from backend data.
- Calendar registration count updates from backend data.

