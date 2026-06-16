# Migration Guide: Test Case Schema Update

## Summary
Updated test case schema from simple strings to objects with `input`, `expectedOutput`, and optional `explanation`.

---

## What Changed

### Before
```javascript
// Quest in database
{
  _id: ObjectId(...),
  title: "Two Sum",
  testcases: [
    "nums = [2,7,11,15], target = 9",
    "nums = [3,2,4], target = 6"
  ]
}

// Creating quest
POST /api/quests
{
  "testcases": ["test1", "test2"]
}
```

### After
```javascript
// Quest in database
{
  _id: ObjectId(...),
  title: "Two Sum",
  testcases: [
    {
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
      explanation: "nums[0] + nums[1] == 9"
    },
    {
      input: "nums = [3,2,4], target = 6",
      expectedOutput: "[1,2]",
      explanation: "nums[1] + nums[2] == 6"
    }
  ]
}

// Creating quest
POST /api/quests
{
  "testcases": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "expectedOutput": "[0,1]",
      "explanation": "nums[0] + nums[1] == 9"
    }
  ]
}
```

---

## Migration Steps

### Step 1: Backup Existing Data
```bash
# If using MongoDB Atlas, create a backup collection
# Or download your data before proceeding
```

### Step 2: Update API Calls

If you were creating/updating quests, change:

**Old**:
```javascript
api.quests.create({
  testcases: ["test 1", "test 2"]
})
```

**New**:
```javascript
api.quests.create({
  testcases: [
    { input: "test 1", expectedOutput: "expected 1" },
    { input: "test 2", expectedOutput: "expected 2" }
  ]
})
```

### Step 3: Verify Data

After deployment, verify that:
1. New quests are created with proper structure
2. Seeded quest "Clone Graph" has expected output format
3. Frontend displays test cases correctly

---

## Breaking Changes

⚠️ **For Quest Admin Panel**:

If you have an admin interface for creating quests, update it to:
1. Accept `input` field
2. Accept `expectedOutput` field
3. Accept optional `explanation` field
4. Validate both `input` and `expectedOutput` are provided

---

## Backward Compatibility

❌ **No automatic migration for old data**

If you have existing quests with string testcases:
- They won't automatically convert
- Create new quests with proper format
- Or manually update via MongoDB

### Manual Update Example (MongoDB):
```javascript
db.quests.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      testcases: [
        {
          input: "old test string",
          expectedOutput: "your expected output here",
          explanation: "optional explanation"
        }
      ]
    }
  }
)
```

---

## API Changes

All endpoints work the same, but request/response bodies now include test case objects:

### GET /api/quests/daily
```json
{
  "testcases": [
    {
      "input": "...",
      "expectedOutput": "...",
      "explanation": "..."
    }
  ]
}
```

### POST /api/quests
```json
{
  "testcases": [
    {
      "input": "required",
      "expectedOutput": "required",
      "explanation": "optional"
    }
  ]
}
```

### PUT /api/quests/:id
Same as POST

---

## Frontend Impact

✅ **Automatic**: The DailyQuestPage now displays:
- Input
- Expected Output
- Actual Output (after running code)
- Explanation (if provided)

No changes needed - it reads from the updated schema.

---

## Troubleshooting

### Q: Old quests showing as empty testcases?
**A**: They are strings, not objects. You need to manually update or create new quests.

### Q: Getting validation errors when creating quests?
**A**: Ensure both `input` and `expectedOutput` are provided in each test case.

### Q: How do I see expected output in the UI?
**A**: Run code and check the test results panel. It now shows:
- Expected Output (from schema)
- Actual Output (from code execution)

---

## Rollback (if needed)

If you need to revert:
1. Restore from backup
2. Revert the code to previous version
3. Restart server

---

## Questions?

Refer to: `/files/TEST_CASE_SCHEMA.md` for detailed documentation.
