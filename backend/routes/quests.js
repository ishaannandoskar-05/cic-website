import express from "express";
import Quest from "../models/Quest.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

const processTestcases = (testcases) =>
  Array.isArray(testcases)
    ? testcases.filter((tc) => tc && tc.input && tc.expectedOutput)
    : [];

// @desc    Get all quests
// @route   GET /api/quests
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const quests = await Quest.find({}).sort({ createdAt: -1 });
    res.json(quests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get current daily quest (latest quest)
// @route   GET /api/quests/daily
// @access  Private
router.get("/daily", protect, async (req, res) => {
  try {
    const dailyQuest = await Quest.findOne({}).sort({ createdAt: -1 });
    if (!dailyQuest) {
      return res.status(404).json({ message: "No quests published yet" });
    }
    const quest = dailyQuest.toObject();
    delete quest.hiddenTestcases;
    res.json(quest);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Create a quest
// @route   POST /api/quests
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  const {
    title,
    difficulty,
    statement,
    functionName,
    parameters,
    returnType,
    hints,
    testcases,
    hiddenTestcases,
    tags,
    examples,
  } = req.body;

  try {
    const parsedParameters = typeof parameters === "string"
      ? JSON.parse(parameters)
      : Array.isArray(parameters) ? parameters : [];

    const quest = new Quest({
      title,
      difficulty,
      statement,
      functionName: functionName || "solve",
      parameters: parsedParameters,
      returnType: returnType || "int",
      hints: Array.isArray(hints) ? hints.filter(Boolean) : [],
      testcases: processTestcases(testcases),
      hiddenTestcases: processTestcases(hiddenTestcases),
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      examples: Array.isArray(examples) ? examples.filter(Boolean) : [],
    });

    const createdQuest = await quest.save();
    res.status(201).json(createdQuest);
  } catch (error) {
    console.error("Error creating quest:", error);
    res.status(400).json({ message: "Invalid quest data" });
  }
});

// @desc    Update a quest
// @route   PUT /api/quests/:id
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  const {
    title,
    difficulty,
    statement,
    functionName,
    parameters,
    returnType,
    hints,
    testcases,
    hiddenTestcases,
    tags,
    examples,
  } = req.body;

  try {
    const quest = await Quest.findById(req.params.id);

    if (quest) {
      quest.title = title || quest.title;
      quest.difficulty = difficulty || quest.difficulty;
      quest.statement = statement || quest.statement;
      if (functionName !== undefined && functionName !== "") {
        quest.functionName = functionName;
      }

      if (parameters !== undefined) {
        quest.parameters = typeof parameters === "string"
          ? JSON.parse(parameters)
          : Array.isArray(parameters) ? parameters : quest.parameters;
      }

      if (returnType !== undefined && returnType !== "") {
        quest.returnType = returnType;
      }
      if (hints !== undefined) {
        quest.hints = Array.isArray(hints) ? hints.filter(Boolean) : [];
      }
      if (tags !== undefined) {
        quest.tags = Array.isArray(tags) ? tags.filter(Boolean) : [];
      }
      if (examples !== undefined) {
        quest.examples = Array.isArray(examples)
          ? examples.filter(Boolean)
          : [];
      }
      if (testcases !== undefined) {
        quest.testcases = processTestcases(testcases);
      }
      if (hiddenTestcases !== undefined) {
        quest.hiddenTestcases = processTestcases(hiddenTestcases);
      }

      const updatedQuest = await quest.save();
      res.json(updatedQuest);
    } else {
      res.status(404).json({ message: "Quest not found" });
    }
  } catch (error) {
    console.error("[PUT /quests] error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});

// @desc    Delete a quest
// @route   DELETE /api/quests/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (quest) {
      await quest.deleteOne();
      res.json({ message: "Quest removed" });
    } else {
      res.status(404).json({ message: "Quest not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;