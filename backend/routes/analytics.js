import express from "express";
import User from "../models/User.js";
import Quest from "../models/Quest.js";
import Submission from "../models/Submission.js";
import Announcement from "../models/Announcement.js";
import Event from "../models/Event.js";
import Resource from "../models/Resource.js";
import Gallery from "../models/Gallery.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// IST is UTC+5:30. Convert any Date to a YYYY-MM-DD string in IST.


// @desc    Temporary debug route — REMOVE BEFORE PRODUCTION
// @route   GET /api/analytics/debug
// @access  Private
router.get("/debug", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalSubmissions = await Submission.countDocuments({});
    const mySubmissions = await Submission.countDocuments({ student: userId });
    const sampleSubmission = await Submission.findOne({}).lean();
    const mySubmissionSample = await Submission.findOne({
      student: userId,
    }).lean();
    const totalQuests = await Quest.countDocuments({});
    const sampleQuest = await Quest.findOne({}).lean();

    res.json({
      currentUserId: userId,
      currentUserIdType: typeof userId.toString(),
      totalSubmissionsInDB: totalSubmissions,
      submissionsMatchingThisUser: mySubmissions,
      sampleSubmissionFromDB: sampleSubmission,
      mySubmissionSample,
      totalQuestsInDB: totalQuests,
      sampleQuest,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get student personal analytics
// @route   GET /api/analytics/student
// @access  Private
router.get("/student", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Calculate Rank
    const students = await User.find({ role: "student" }).sort({ xp: -1 });
    const rankIndex = students.findIndex(
      (s) => s._id.toString() === userId.toString(),
    );
    const rank = rankIndex !== -1 ? rankIndex + 1 : students.length;

    // 2. Fetch User Stats
    const user = await User.findById(userId);

    // 3. Problem Distribution (Pie Chart)
    const allSubmissions = await Submission.find({ student: userId })
      .populate({ path: "quest", select: "title difficulty" })
      .lean();

    console.log(
      "RAW SUBMISSIONS:",
      allSubmissions.map((s) => ({
        questTitle: s.quest?.title,
        difficulty: s.quest?.difficulty,
        questNull: s.quest === null,
      })),
    );

    // Deduplicate: one quest counts once regardless of re-submissions
    const uniqueQuests = new Map();
    allSubmissions.forEach((sub) => {
      if (sub.quest?._id) {
        uniqueQuests.set(sub.quest._id.toString(), sub.quest);
      }
    });

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    Array.from(uniqueQuests.values()).forEach((quest) => {
      switch (quest.difficulty) {
        case "Easy":
          easyCount++;
          break;
        case "Medium":
          mediumCount++;
          break;
        case "Hard":
          hardCount++;
          break;
      }
    });

    const totalSolved = easyCount + mediumCount + hardCount;
    const pieData = [
      {
        name: "Easy",
        value:
          totalSolved > 0 ? Math.round((easyCount / totalSolved) * 100) : 0,
        count: easyCount,
      },
      {
        name: "Medium",
        value:
          totalSolved > 0 ? Math.round((mediumCount / totalSolved) * 100) : 0,
        count: mediumCount,
      },
      {
        name: "Hard",
        value:
          totalSolved > 0 ? Math.round((hardCount / totalSolved) * 100) : 0,
        count: hardCount,
      },
    ];

    // 4. Activity Heatmap (Last 31 days)
    const today = new Date();

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    const subsThisMonth = await Submission.find({
      student: userId,
      createdAt: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      },
    }).lean();

    const activityMap = {};

    subsThisMonth.forEach((sub) => {
      const day = new Date(sub.createdAt).getDate();
      activityMap[day] = (activityMap[day] || 0) + 1;
    });

    const contributionData = [];

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const count = activityMap[day] || 0;

      let level = 0;
      if (count >= 1) level = 1;
      if (count >= 2) level = 2;
      if (count >= 3) level = 3;
      if (count >= 4) level = 4;

      const dateObj = new Date(today.getFullYear(), today.getMonth(), day);

      contributionData.push({
        day,
        count,
        level,
        dayOfWeek: dateObj.getDay(),
      });
    }

    // Build a date → count map using IST dates to match the frontend's heatmap expectations

    // 5. Growth Chart — last 7 days grouped by day-of-week
    // Map JS Sunday-Saturday (0-6) to chart labels
    const jsDayToLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Group submissions of the last 7 days by day-of-week
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const subsLast7Days = await Submission.find({
      student: userId,
      createdAt: { $gte: sevenDaysAgo },
    })
      .populate("quest")
      .lean();

    const weeklyChartData = jsDayToLabel.map((dayLabel) => {
      const daySubs = subsLast7Days.filter((sub) => {
        const dayName = jsDayToLabel[new Date(sub.createdAt).getDay()];
        return dayName === dayLabel;
      });

      const dayXp = daySubs.reduce((sum, sub) => {
        let xpVal = 50;
        if (sub.quest) {
          if (sub.quest.difficulty === "Medium") xpVal = 100;
          if (sub.quest.difficulty === "Hard") xpVal = 150;
        }
        return sum + xpVal;
      }, 0);

      return {
        day: dayLabel,
        xp: dayXp,
        solved: daySubs.length,
      };
    });

    // Sort to make sure today is the last index if we want, or keep it Mon-Sun order
    // Mon-Sun standard order:
    const monToSunOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const growthData = monToSunOrder.map((dayLabel) => {
      return (
        weeklyChartData.find((d) => d.day === dayLabel) || {
          day: dayLabel,
          xp: 0,
          solved: 0,
        }
      );
    });

    console.log("Pie Data:", pieData);
    console.log("Contribution Data:", contributionData);
    console.log("Growth Data:", growthData);

    res.json({
      name: user.name,
      xp: user.xp,
      streak: user.streak,
      solvedCount: user.solvedCount,
      rank,
      pieData,
      contributionData,
      growthData,
    });
  } catch (error) {
    console.error("Student Analytics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get admin portal analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
router.get("/admin", protect, admin, async (req, res) => {
  try {
    const eventsCount = await Event.countDocuments({});
    const announcementsCount = await Announcement.countDocuments({});
    const resourcesCount = await Resource.countDocuments({});
    const galleryCount = await Gallery.countDocuments({});
    const membersCount = await User.countDocuments({});
    const questsCount = await Quest.countDocuments({});
    const submissionsCount = await Submission.countDocuments({});

    // Combine recent updates to form the Recent Activity Feed
    const recentEvents = await Event.find({}).sort({ createdAt: -1 }).limit(3);
    const recentResources = await Resource.find({})
      .sort({ createdAt: -1 })
      .limit(3);
    const recentAnnouncements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .limit(3);
    const recentSubmissions = await Submission.find({})
      .populate("student", "name")
      .populate("quest", "title")
      .sort({ createdAt: -1 })
      .limit(3);

    const activities = [];

    recentEvents.forEach((e) => {
      activities.push({
        text: `New event "${e.title}" (${e.type}) created at ${e.venue}`,
        date: e.createdAt,
      });
    });

    recentResources.forEach((r) => {
      activities.push({
        text: `New resource "${r.title}" added in ${r.category}`,
        date: r.createdAt,
      });
    });

    recentAnnouncements.forEach((a) => {
      activities.push({
        text: `Announcement "${a.title}" published`,
        date: a.createdAt,
      });
    });

    recentSubmissions.forEach((s) => {
      const studentName = s.student ? s.student.name : "A student";
      const questTitle = s.quest ? s.quest.title : "a quest";
      activities.push({
        text: `${studentName} submitted solution for "${questTitle}" (${s.status})`,
        date: s.createdAt,
      });
    });

    // Sort combined activities by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Slice to top 6 activities
    const recentActivityFeed = activities.slice(0, 6).map((a) => a.text);

    // Fallbacks if empty
    if (recentActivityFeed.length === 0) {
      recentActivityFeed.push(
        "System initialized.",
        "Welcome to the admin control panel.",
      );
    }

    res.json({
      stats: [
        { title: "Events", value: String(eventsCount) },
        { title: "Announcements", value: String(announcementsCount) },
        { title: "Resources", value: String(resourcesCount) },
        { title: "Gallery Images", value: String(galleryCount) },
        { title: "Total Members", value: String(membersCount) },
        { title: "Active Quests", value: String(questsCount) },
        { title: "Quest Submissions", value: String(submissionsCount) },
      ],
      recentActivity: recentActivityFeed,
    });
  } catch (error) {
    console.error("Admin Analytics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
