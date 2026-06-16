import mongoose from "mongoose";

const toValidDate = (value) => {
  if (!value) return value;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
};

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      set: toValidDate,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    color: {
      type: String,
      default: "",
      trim: true,
    },
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

eventSchema.virtual("day").get(function () {
  return this.date ? this.date.getDate() : null;
});

eventSchema.virtual("month").get(function () {
  return this.date ? this.date.getMonth() + 1 : null;
});

eventSchema.virtual("year").get(function () {
  return this.date ? this.date.getFullYear() : null;
});

eventSchema.virtual("registrationCount").get(function () {
  return Array.isArray(this.registrations) ? this.registrations.length : 0;
});

eventSchema.pre("save", function (next) {
  if (Array.isArray(this.registrations) && this.registrations.length > 1) {
    const seen = new Set();
    this.registrations = this.registrations.filter((id) => {
      const value = id.toString();
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  next();
});

eventSchema.index({ date: 1 });
eventSchema.index({ type: 1, date: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
