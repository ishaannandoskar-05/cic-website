import express from "express";
import Event from "../models/Event.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Resolve an event date from the request body.
 * Accepts either:
 *   { date: <ISO string> }             — preferred, full date
 *   { day: <number>, month: <1-12>, year: <number> }  — explicit parts
 *   { day: <number> }                  — legacy: uses current month/year
 */
const resolveDate = ({ date, day, month, year }) => {
  if (date) return new Date(date);
  if (day) {
    const d = new Date();
    return new Date(
      year || d.getFullYear(),
      month ? month - 1 : d.getMonth(),
      Number(day),
    );
  }
  return null;
};

// ─────────────────────────────────────────────────────────────
//  CRUD
// ─────────────────────────────────────────────────────────────

// @desc    Get all events
// @route   GET /api/events
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  const { title, type, venue, description, color, link } = req.body;

  const date = resolveDate(req.body);
  if (!date || isNaN(date.getTime())) {
    return res.status(400).json({
      message: "A valid date is required (use date, or day/month/year fields).",
    });
  }

  try {
    const event = new Event({
      title,
      type,
      date,
      venue,
      link: link || "",
      description: description || "",
      color: color || "",
    });
    const created = await event.save();
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid event data" });
  }
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  const { title, type, venue, description, color, link } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (title) event.title = title;
    if (type) event.type = type;
    if (venue) event.venue = venue;
    if (description !== undefined) event.description = description;
    if (color) event.color = color;
    if (link !== undefined) {
      event.link = link;
    }

    const newDate = resolveDate(req.body);
    if (newDate && !isNaN(newDate.getTime())) event.date = newDate;

    const updated = await event.save();
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    await event.deleteOne();
    res.json({ message: "Event removed" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────
//  Registration endpoints
// ─────────────────────────────────────────────────────────────

// @desc    Register the current user for an event
// @route   POST /api/events/:id/register
// @access  Private
router.post("/:id/register", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user._id;
    const alreadyRegistered = event.registrations.some((r) => r.equals(userId));
    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ message: "You are already registered for this event." });
    }

    event.registrations.push(userId);
    await event.save();

    res.json({
      message: "Registered successfully.",
      registrationCount: event.registrationCount,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Unregister the current user from an event
// @route   DELETE /api/events/:id/register
// @access  Private
router.delete("/:id/register", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user._id;
    event.registrations = event.registrations.filter((r) => !r.equals(userId));
    await event.save();

    res.json({
      message: "Unregistered successfully.",
      registrationCount: event.registrationCount,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
