import mongoose from "mongoose";

const parameterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false },
);

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const questSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  examples: {
    type: [String],
    default: [],
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  statement: {
    type: String,
    required: true,
  },
  hints: {
    type: [String],
    default: [],
  },
  testcases: {
    type: [testCaseSchema],
    default: [],
  },
  hiddenTestcases: {
    type: [testCaseSchema],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  functionName: {
    type: String,
    default: "solve",
  },

  parameters: {
    type: [parameterSchema],
    default: [],
  },

  returnType: {
    type: String,
    default: "int",
  },
});

const Quest = mongoose.model("Quest", questSchema);

export default Quest;