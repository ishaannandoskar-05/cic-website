import { useState, useEffect, createContext, useContext } from "react";
import { api } from "./services/api";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  Bell,
  Calendar,
  BookOpen,
  Image,
  Flame,
  Activity,
  ArrowRight,
  Sun,
  Moon,
  ChevronLeft,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
// ========================================
// THEME CONTEXT
// ========================================

const ThemeContext = createContext({ dark: false, toggleDark: () => {} });
const useTheme = () => useContext(ThemeContext);

export const AuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
  refreshUser: async () => {},
});
const useAuth = () => useContext(AuthContext);
export { useAuth };

// Convenience wrapper so every page gets the right bg automatically
function PageBg({ children, className = "" }) {
  const { dark } = useTheme();
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#171717] text-[#ededed]" : "bg-[#f2f2f4] text-[#0f1012]"} ${className}`}
    >
      {children}
    </div>
  );
}

// ========================================
// DATA
// ========================================

const growthData = [
  { day: "Mon", xp: 20, solved: 3 },
  { day: "Tue", xp: 45, solved: 5 },
  { day: "Wed", xp: 38, solved: 4 },
  { day: "Thu", xp: 70, solved: 8 },
  { day: "Fri", xp: 66, solved: 7 },
  { day: "Sat", xp: 90, solved: 10 },
  { day: "Sun", xp: 120, solved: 12 },
];

const leaderboard = [
  { rank: 1, name: "Aarav Mehta", xp: 9280 },
  { rank: 2, name: "Ishita Rao", xp: 9012 },
  { rank: 3, name: "Kabir Shah", xp: 8890 },
  { rank: 4, name: "Ananya Nair", xp: 8012 },
  { rank: 5, name: "Rohan Verma", xp: 7791 },
  { rank: 6, name: "Sanya Kapoor", xp: 7600 },
  { rank: 7, name: "Dev Patel", xp: 7421 },
  { rank: 8, name: "Arjun Kulkarni", xp: 7011 },
  { rank: 9, name: "Mehul Jain", xp: 6880 },
  { rank: 10, name: "Priya Desai", xp: 6701 },
];

const currentUser = {
  rank: 14,
  name: "Ishaan Nandoskar",
  xp: 5100,
};

// ========================================
// LAYOUT
// ========================================

function Layout() {
  const navigate = useNavigate();
  const { dark, toggleDark } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Prevent flicker before redirect
  }

  const bg = dark ? "bg-[#171717]" : "bg-[#f2f2f4]";
  const text = dark ? "text-[#ededed]" : "text-[#0f1012]";
  const headerBg = dark ? "bg-[#171717]/90" : "bg-[#f2f2f4]/90";
  const border = dark ? "border-white/5" : "border-black/5";
  const navBtn = dark
    ? "bg-white/[0.06] text-[#ededed] hover:bg-[#da0037] hover:text-white"
    : "bg-black/[0.04] text-[#0f1012] hover:bg-[#da0037] hover:text-white";
  const subText = dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]";
  const footerBtn = dark
    ? "bg-white/[0.06] text-[#ededed] hover:bg-[#da0037] hover:text-white"
    : "bg-black/[0.04] hover:bg-[#da0037] hover:text-white";

  const navItems = [
    { name: "Announcements", route: "/announcements", icon: Bell },
    { name: "Calendar", route: "/calendar", icon: Calendar },
    { name: "Resources", route: "/resources", icon: BookOpen },
    { name: "Gallery", route: "/gallery", icon: Image },
  ];

  if (user.role === "admin") {
    navItems.push({ name: "Admin Dashboard", route: "/admin", icon: Activity });
  }

  return (
    <div
      className={`min-h-screen ${bg} ${text} font-[Inter] transition-colors duration-300`}
    >
      {/* NAVBAR */}
      <header
        className={`sticky top-0 z-50 ${headerBg} backdrop-blur-xl border-b ${border}`}
      >
        <div className="max-w-[1500px] mx-auto px-6 lg:px-10 h-[76px] flex items-center justify-between">
          {/* BACK + LOGO */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all ${navBtn}`}
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </button>

            <div onClick={() => navigate("/home")} className="cursor-pointer">
              <h1 className="text-[16px] tracking-[-0.02em] font-medium">
                Coding & Innovation Club
              </h1>
              <p className={`text-[12px] ${subText} mt-[2px]`}>
                Future Builders Platform
              </p>
            </div>
          </div>

          {/* NAVIGATION + THEME TOGGLE */}
          <div className="hidden lg:flex items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.route)}
                  className={`h-[38px] px-4 rounded-[10px] text-[13px] flex items-center gap-2 transition-all ${navBtn}`}
                >
                  <Icon size={14} />
                  {item.name}
                </button>
              );
            })}

            {/* DARK MODE TOGGLE */}
            <button
              onClick={toggleDark}
              className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all ${navBtn}`}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* SIGN OUT */}
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className={`h-[38px] px-4 rounded-[10px] text-[13px] font-medium transition-all ${navBtn}`}
            >
              Sign Out
            </button>
          </div>

          {/* MOBILE: theme toggle and sign out */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleDark}
              className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all ${navBtn}`}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className={`h-[38px] px-3 rounded-[10px] text-[12px] font-medium transition-all ${navBtn}`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <Outlet />

      {/* FOOTER */}
      <footer className={`border-t ${border} mt-[94px]`}>
        <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h3 className="text-[18px] tracking-[-0.03em]">About Us</h3>
            <p
              className={`mt-3 text-[14px] ${subText} max-w-[420px] leading-[1.5]`}
            >
              Coding & Innovation Club is a collaborative platform focused on
              innovation, coding culture, hackathons and technical growth.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:adsa@nhitm.ac.in"
              className={`px-4 h-[38px] rounded-[10px] text-[13px] transition-all flex items-center ${footerBtn}`}
            >
              adsa@nhitm.ac.in
            </a>

            <a
              href="https://www.linkedin.com/company/ai-data-science-student-association/"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 h-[38px] rounded-[10px] text-[13px] transition-all flex items-center ${footerBtn}`}
            >
              LinkedIn
            </a>

            <a
              href="https://discord.gg/7T4QhW9x"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 h-[38px] rounded-[10px] text-[13px] transition-all flex items-center ${footerBtn}`}
            >
              Discord
            </a>

            <a
              href="https://www.instagram.com/adsa_nhitm?igsh=MTUzbW1uMDAxOXI5eQ=="
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 h-[38px] rounded-[10px] text-[13px] transition-all flex items-center ${footerBtn}`}
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ========================================
// AUTH PAGE
// ========================================

function AuthPage() {
  const { dark } = useTheme();
  const [tab, setTab] = useState("student");
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [ien, setIen] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    }
  }, [user, navigate]);

  const handleAuth = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (isSignup) {
      // Validations
      if (!name || !ien || !email || !password || !confirmPassword) {
        setError("All fields are required");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (tab === "student" && !email.toLowerCase().endsWith("@nhitm.ac.in")) {
        setError("Student emails must end with @nhitm.ac.in");
        return;
      }

      if (tab === "admin" && !adminSecretKey) {
        setError("Admin Security Key is required for administrator signup");
        return;
      }

      try {
        const res = await register({
          name,
          ien,
          email,
          password,
          role: tab,
          adminSecretKey: tab === "admin" ? adminSecretKey : undefined,
        });

        if (res.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } catch (err) {
        setError(err.message || "Registration failed");
      }
    } else {
      // Login
      if (!email || !password) {
        setError("Email and Password are required");
        return;
      }

      try {
        const res = await login(email, password);
        if (res.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } catch (err) {
        setError(err.message || "Invalid credentials");
      }
    }
  };

  return (
    <div
      className={`min-h-screen ${dark ? "bg-[#171717]" : "bg-[#e9e9f2]"} overflow-hidden flex items-center justify-center p-3 sm:p-5 font-[Inter]`}
    >
      <div
        className={`relative w-full max-w-[1450px] min-h-[760px] rounded-[24px] overflow-hidden ${dark ? "bg-[#1f1f1f]" : "bg-[#eef0f7]"} shadow-[0_25px_80px_rgba(0,0,0,0.08)]`}
      >
        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ececf5] via-[#e7e7f2] to-[#d9dbef]" />

        {/* GLOBE */}
        <motion.div
          animate={{ rotate: [0, 1.5, 0] }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            absolute
            -bottom-[65vw]
            -left-[35vw]
            w-[95vw]
            h-[95vw]
            max-w-[1100px]
            max-h-[1100px]
            rounded-full
            bg-gradient-to-b
            from-white
            to-[#d8d9ee]
          "
        />

        <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between min-h-screen px-6 sm:px-10 lg:px-16 gap-10">
          {/* LEFT */}
          <div className="flex-1 max-w-[700px]">
            <h2
              className={`text-[42px] sm:text-[56px] lg:text-[72px] leading-[0.95] font-semibold tracking-[-0.06em] ${dark ? "text-[#ededed]" : "text-[#0b1334]"}`}
            >
              Welcome to
              <br />
              <span className="text-[#4152ff]">
                Coding &
                <br />
                Innovation Club
              </span>
            </h2>

            <p
              className={`mt-5 text-[15px] sm:text-[16px] ${dark ? "text-[#aaa]" : "text-[#646983]"} max-w-[420px] leading-relaxed`}
            >
              Where builders, innovators and creators shape the future together
              through code, collaboration and creativity.
            </p>
          </div>

          {/* AUTH CARD */}
          <div className="w-full max-w-[390px] rounded-[24px] bg-white/92 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            {/* TOGGLE */}
            <div
              className={`flex ${dark ? "bg-[#2a2a2a]" : "bg-[#f4f4f9]"} rounded-[16px] p-[4px] mb-8`}
            >
              <button
                onClick={() => setTab("student")}
                className={`flex-1 h-[46px] rounded-[12px] text-[14px] font-medium transition-all duration-300 ${
                  tab === "student"
                    ? "bg-white shadow-sm text-[#2140ff]"
                    : "text-[#555]"
                }`}
              >
                Student
              </button>

              <button
                onClick={() => setTab("admin")}
                className={`flex-1 h-[46px] rounded-[12px] text-[14px] font-medium transition-all duration-300 ${
                  tab === "admin" ? "bg-[#111] text-white" : "text-[#555]"
                }`}
              >
                Admin
              </button>
            </div>

            {/* TITLE */}
            <h3
              className={`text-[22px] font-semibold tracking-[-0.03em] ${dark ? "text-[#ededed]" : "text-[#111]"}`}
            >
              {isSignup
                ? tab === "student"
                  ? "Student Signup"
                  : "Admin Signup"
                : tab === "student"
                  ? "Sign in to CIC"
                  : "Admin dashboard access"}
            </h3>

            <p
              className={`text-[14px] ${dark ? "text-[#aaa]" : "text-[#70738a]"} mt-2 mb-7`}
            >
              {isSignup
                ? "Join the Coding & Innovation Club."
                : tab === "student"
                  ? "Access your member portal."
                  : "Restricted administrative access."}
            </p>

            {/* ERROR ALERT */}
            {error && (
              <div className="mb-4 p-3 rounded-[10px] bg-red-100 border border-red-200 text-red-700 text-[13px] leading-snug">
                {error}
              </div>
            )}

            {/* INPUTS AND BUTTON IN A FORM */}
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignup ? (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full h-[52px] rounded-[13px] border border-[#d9dceb] ${dark ? "bg-[#1e1e1e]" : "bg-white"} px-4 text-[14px] outline-none`}
                  />

                  <input
                    type="text"
                    placeholder="IEN Number"
                    autoComplete="username"
                    value={ien}
                    onChange={(e) => setIen(e.target.value)}
                    className={`w-full h-[52px] rounded-[13px] border border-[#d9dceb] ${dark ? "bg-[#1e1e1e]" : "bg-white"} px-4 text-[14px] outline-none`}
                  />

                  <input
                    type="email"
                    placeholder={
                      tab === "student"
                        ? "Institute / College email (@nhitm.ac.in)"
                        : "Admin Email"
                    }
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full h-[52px] rounded-[13px] border border-[#d9dceb] ${dark ? "bg-[#1e1e1e]" : "bg-white"} px-4 text-[14px] outline-none`}
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full h-[52px] rounded-[13px] border border-[#d9dceb] ${dark ? "bg-[#1e1e1e]" : "bg-white"} px-4 text-[14px] outline-none`}
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-[52px] rounded-[13px] border border-[#d9dceb] ${dark ? "bg-[#1e1e1e]" : "bg-white"} px-4 text-[14px] outline-none`}
                  />

                  {tab === "admin" && (
                    <input
                      type="password"
                      placeholder="Admin Security Key"
                      autoComplete="new-password"
                      value={adminSecretKey}
                      onChange={(e) => setAdminSecretKey(e.target.value)}
                      className={`w-full h-[52px] rounded-[13px] border border-[#d9dceb] ${dark ? "bg-[#1e1e1e]" : "bg-white"} px-4 text-[14px] outline-none`}
                    />
                  )}
                </>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder={
                      tab === "student" ? "Student email" : "Admin email"
                    }
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full h-[52px] rounded-[13px] border border-[#d9dceb] ${dark ? "bg-[#1e1e1e]" : "bg-white"} px-4 text-[14px] outline-none`}
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full h-[52px] rounded-[13px] border border-[#d9dceb] ${dark ? "bg-[#1e1e1e]" : "bg-white"} px-4 text-[14px] outline-none`}
                  />
                </>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className={`
                  w-full
                  h-[52px]
                  rounded-[14px]
                  text-[15px]
                  font-medium
                  text-white
                  transition-all
                  duration-300
                  mt-6
                  ${
                    tab === "student"
                      ? "bg-[#2140ff] hover:bg-[#1837f2]"
                      : "bg-[#111] hover:bg-black"
                  }
                `}
              >
                {isSignup
                  ? "Create Account"
                  : tab === "student"
                    ? "Sign In"
                    : "Access Dashboard"}
              </button>
            </form>

            {/* FOOTER */}
            <p
              className={`text-center text-[13px] ${dark ? "text-[#aaa]" : "text-[#777]"} mt-7`}
            >
              {isSignup ? "Already have an account?" : "New here?"}

              <button
                onClick={() => {
                  setError("");
                  setIsSignup(!isSignup);
                }}
                className="text-[#2140ff] ml-2 font-medium"
              >
                {isSignup ? "Sign In" : "Join the club"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// HOME PAGE
// ========================================

function HomePage() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [dailyQuest, setDailyQuest] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [analyticsData, leaderboardResult, questData] = await Promise.all(
          [
            api.analytics.getStudent().catch(() => ({})),
            api.leaderboard.get().catch(() => []),
            api.quests.getDaily().catch(() => null),
          ],
        );
        console.log("Analytics Data:", analyticsData);
        setAnalytics(analyticsData);
        setLeaderboardData(leaderboardResult);
        setDailyQuest(questData);
      } catch (err) {
        console.error("Fetch data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const growthData = (() => {
    // Backend returns 'growthData' from analytics endpoint
    if (
      analytics?.growthData &&
      Array.isArray(analytics.growthData) &&
      analytics.growthData.length > 0
    ) {
      return analytics.growthData.map((item) => ({
        day: item.day || item.label || "",
        xp: parseInt(item.xp) || 0,
        solved: parseInt(item.solved) || 0,
      }));
    }
    // Fallback data if API doesn't return growth data
    return [
      { day: "Mon", xp: 20, solved: 3 },
      { day: "Tue", xp: 45, solved: 5 },
      { day: "Wed", xp: 38, solved: 4 },
      { day: "Thu", xp: 70, solved: 8 },
      { day: "Fri", xp: 66, solved: 7 },
      { day: "Sat", xp: 90, solved: 10 },
      { day: "Sun", xp: 120, solved: 12 },
    ];
  })();

  const topThree = leaderboardData.slice(0, 3);
  const currentUserRank = leaderboardData.find((u) => u._id === user?._id) || {
    rank: "-",
    name: user?.name || "You",
    xp: user?.xp || 0,
  };
  const remainingLeaderboard = leaderboardData.slice(3);

  return (
    <>
      <section className="max-w-[1500px] mx-auto px-6 lg:px-10 pt-[70px]">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div>
            <p
              className={`text-[13px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} uppercase tracking-wide`}
            >
              Coding & Innovation Platform
            </p>

            <h1 className="mt-4 text-[44px] lg:text-[72px] leading-[0.95] tracking-[-0.05em] font-medium">
              Beyond
              <br />
              student clubs.
            </h1>

            <p
              className={`mt-8 max-w-[520px] text-[16px] leading-[1.5] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              A centralized ecosystem for coding growth, daily quests,
              competitions, innovation and collaborative learning.
            </p>
          </div>

          <button
            onClick={() => navigate("/platform")}
            className="
              h-[44px]
              px-5
              rounded-[12px]
              bg-[#0071e3]
              text-white
              text-[14px]
            "
          >
            Explore Platform
          </button>
        </div>
      </section>

      {/* SUBSECTIONS */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-10 pt-[60px] pb-[100px]">
        <div className="flex flex-col gap-6">
          {/* DASHBOARD */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => navigate("/dashboard")}
            className={`w-full rounded-[30px] ${dark ? "bg-[#1e1e1e]" : "bg-white"} p-8 border ${dark ? "border-white/10" : "border-black/5"} cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-[13px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Dashboard Analytics
                </p>

                <h2 className="mt-3 text-[34px]">Performance Overview</h2>
              </div>

              <div className="w-[52px] h-[52px] rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                <Activity size={22} color="#0071e3" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              {[
                { title: "XP", value: `${analytics?.xp ?? user?.xp ?? 0}` },
                {
                  title: "Solved",
                  value: `${analytics?.solvedCount ?? user?.solvedCount ?? 0}`,
                },
                {
                  title: "Streak",
                  value: `${analytics?.streak ?? user?.streak ?? 0}d`,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`rounded-[18px] ${dark ? "bg-white/[0.05]" : "bg-black/[0.03]"} p-5`}
                >
                  <p
                    className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                  >
                    {item.title}
                  </p>

                  <h3 className="mt-3 text-[26px]">{item.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
              <div
                className={`h-[220px] rounded-[22px] ${dark ? "bg-white/[0.05]" : "bg-black/[0.03]"} p-5`}
              >
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} uppercase tracking-wide mb-2`}
                >
                  Weekly XP Growth
                </p>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        stroke="#8f8f8f"
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => [value, "XP"]}
                      />

                      <Area
                        type="monotone"
                        dataKey="xp"
                        stroke="#0071e3"
                        fill="#0071e3"
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div
                className={`h-[220px] rounded-[22px] ${dark ? "bg-white/[0.05]" : "bg-black/[0.03]"} p-5`}
              >
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} uppercase tracking-wide mb-2`}
                >
                  Problems Solved
                </p>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        stroke="#8f8f8f"
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => [value, "Solved"]}
                      />

                      <Line
                        type="monotone"
                        dataKey="solved"
                        stroke="#0071e3"
                        strokeWidth={3}
                        dot={{ fill: "#0071e3", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>

          {/* LEADERBOARD */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => navigate("/leaderboard")}
            className="w-full rounded-[30px] bg-[#0f1012] text-white p-8 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[34px]">Leaderboard</h2>

              <div className="px-4 py-2 rounded-[14px] bg-white/10">
                <p className="text-[11px] uppercase tracking-wide text-white/60">
                  Your Rank
                </p>

                <h3 className="text-[20px] mt-1">#{currentUserRank.rank}</h3>
              </div>
            </div>

            {/* PODIUM */}
            <div className="flex items-end justify-center gap-3 mt-12">
              <div className="w-[95px] h-[140px] rounded-t-[20px] bg-white/8 flex flex-col items-center justify-center">
                <span className="text-[28px]">🥈</span>
                <span className="mt-2 text-center text-[12px]">
                  {topThree[1]?.name || "Empty"}
                </span>
              </div>

              <div className="w-[110px] h-[190px] rounded-t-[24px] bg-[#0071e3] flex flex-col items-center justify-center">
                <span className="text-[34px]">🥇</span>
                <span className="mt-2 text-center text-[12px]">
                  {topThree[0]?.name || "Empty"}
                </span>
              </div>

              <div className="w-[95px] h-[120px] rounded-t-[20px] bg-white/8 flex flex-col items-center justify-center">
                <span className="text-[28px]">🥉</span>
                <span className="mt-2 text-center text-[12px]">
                  {topThree[2]?.name || "Empty"}
                </span>
              </div>
            </div>

            {/* TOP 10 */}
            <div className="mt-10 space-y-2">
              {remainingLeaderboard.map((userData) => (
                <div
                  key={userData._id || userData.rank}
                  className="h-[52px] rounded-[14px] px-4 flex items-center justify-between bg-white/[0.04]"
                >
                  <span>
                    #{userData.rank} {userData.name}
                  </span>

                  <span>{userData.xp}</span>
                </div>
              ))}

              {/* CURRENT USER */}
              <div className="h-[56px] rounded-[16px] px-4 flex items-center justify-between bg-[#0071e3] mt-4">
                <span className="font-medium">
                  #{currentUserRank.rank} {currentUserRank.name}
                </span>

                <span>{currentUserRank.xp} XP</span>
              </div>
            </div>
          </motion.div>

          {/* DAILY QUEST */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => navigate("/quests")}
            className={`w-full rounded-[30px] ${dark ? "bg-[#1e1e1e]" : "bg-white"} border ${dark ? "border-white/10" : "border-black/5"} p-8 cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-[13px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  LeetCode Problem of the Day
                </p>

                <h2 className="mt-3 text-[34px]">Daily Quest</h2>
              </div>

              <div className="w-[52px] h-[52px] rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                <Flame size={22} color="#0071e3" />
              </div>
            </div>

            <div
              className={`mt-10 rounded-[24px] border ${dark ? "border-white/10" : "border-black/5"} p-6 ${dark ? "bg-white/[0.04]" : "bg-black/[0.02]"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-[12px] uppercase tracking-wide ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                  >
                    LeetCode #{dailyQuest?.number || "133"}
                  </p>

                  <h3 className="text-[28px] mt-2">
                    {dailyQuest?.title || "Clone Graph"}
                  </h3>
                </div>

                <div className="px-4 h-[36px] rounded-full bg-[#0071e3] text-white text-[13px] flex items-center">
                  {dailyQuest?.difficulty || "Medium"}
                </div>
              </div>

              <p
                className={`mt-6 text-[14px] leading-[1.7] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} max-w-[700px]`}
              >
                {dailyQuest?.description ||
                  "Given a reference of a node in a connected undirected graph, return a deep copy of the graph. Each node contains a value and a list of neighbors."}
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                {(dailyQuest?.tags || ["Graph", "DFS", "BFS", "HashMap"]).map(
                  (tag) => (
                    <div
                      key={tag}
                      className={`px-3 h-[32px] rounded-full ${dark ? "bg-white/[0.07]" : "bg-black/[0.05]"} text-[12px] flex items-center`}
                    >
                      {tag}
                    </div>
                  ),
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button className="h-[42px] px-5 rounded-[12px] bg-[#0071e3] text-white">
                  Solve Challenge
                </button>

                <button
                  className={`h-[42px] px-5 rounded-[12px] border ${dark ? "border-white/10" : "border-black/10"}`}
                >
                  View Solutions
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

// ========================================
// PLATFORM PAGE
// ========================================
function AdminDashboard() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    api.analytics
      .getAdmin()
      .then((data) => {
        setStats(data.stats || []);
        setRecentActivity(data.recentActivity || []);
      })
      .catch((err) => console.error("Admin analytics error:", err));
  }, []);

  const sections = [
    {
      title: "Manage Calendar",
      route: "/admin/calendar",
      description: "Add and manage events",
    },
    {
      title: "Manage Announcements",
      route: "/admin/announcements",
      description: "Publish club updates",
    },
    {
      title: "Manage Daily Quest",
      route: "/admin/dailyquest",
      description: "Update coding challenges",
    },
    {
      title: "Manage Gallery",
      route: "/admin/gallery",
      description: "Upload event photos",
    },
    {
      title: "Manage Resources",
      route: "/admin/resources",
      description: "Add learning materials",
    },
    {
      title: "Manage Members",
      route: "/admin/members",
      description: "View club participants",
    },
  ];

  return (
    <PageBg>
      <div className="max-w-[1700px] mx-auto px-6 lg:px-10 py-[60px]">
        {/* HERO */}
        <div>
          <p
            className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Admin Portal
          </p>

          <h1
            className="
              mt-4
              text-[52px]
              lg:text-[92px]
              leading-[0.88]
              tracking-[-0.08em]
              font-medium
            "
          >
            Dashboard.
          </h1>

          <p
            className={`mt-6 max-w-[650px] ${dark ? "text-[#aaa]" : "text-[#666]"} leading-[1.8]`}
          >
            Manage events, announcements, resources, gallery uploads and daily
            coding quests from a single control center.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {stats.map((item) => (
            <div
              key={item.title}
              className={`
                rounded-[30px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-8
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <p
                className={`text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                {item.title}
              </p>

              <h2
                className="
                  mt-4
                  text-[48px]
                  tracking-[-0.05em]
                  font-medium
                "
              >
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* MANAGEMENT SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-16">
          {sections.map((section) => (
            <div
              key={section.title}
              onClick={() => navigate(section.route)}
              className={`
                cursor-pointer
                rounded-[32px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-8
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
                transition-all
                duration-300
                hover:-translate-y-2
              `}
            >
              <h3
                className="
                  text-[32px]
                  tracking-[-0.05em]
                  font-medium
                "
              >
                {section.title}
              </h3>

              <p
                className={`mt-4 ${dark ? "text-[#aaa]" : "text-[#666]"} leading-[1.8]`}
              >
                {section.description}
              </p>

              <div
                className="
                  mt-8
                  w-[52px]
                  h-[52px]
                  rounded-full
                  bg-[#0071e3]
                  flex
                  items-center
                  justify-center
                  text-white
                  text-[22px]
                "
              >
                →
              </div>
            </div>
          ))}
        </div>

        {/* ACTIVITY */}
        <div
          className={`
            mt-16
            rounded-[32px]
            ${dark ? "bg-[#1e1e1e]" : "bg-white"}
            border
            ${dark ? "border-white/10" : "border-black/5"}
            p-8
            ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
          `}
        >
          <p
            className={`text-[13px] uppercase tracking-[0.18em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Recent Activity
          </p>

          <div className="mt-8 space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <div
                  key={index}
                  className={`
                  flex
                  items-center
                  gap-4
                  rounded-[18px]
                  ${dark ? "bg-[#2a2a2a]" : "bg-[#fafafa]"}
                  p-4
                `}
                >
                  <div className="w-[10px] h-[10px] rounded-full bg-[#0071e3]" />

                  <span>{item}</span>
                </div>
              ))
            ) : (
              <p
                className={`${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} text-[14px]`}
              >
                No recent activity yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageBg>
  );
}

function ManageCalendarPage() {
  const { dark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("All");
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    type: "Hackathon",
    day: "",
    venue: "",
    link: "",
  });

  const filters = [
    "All",
    "Hackathons",
    "Workshops",
    "Competitions",
    "Meetings",
  ];

  const getColor = (type) => {
    if (type === "Hackathon") return "bg-[#0071e3]";
    if (type === "Workshop") return "bg-[#7b61ff]";
    if (type === "Competition") return "bg-[#ff9f0a]";
    return "bg-[#111111]";
  };

  const loadEvents = async () => {
    try {
      const data = await api.events.getAll();
      const mapped = data.map((e) => ({
        ...e,
        id: e._id,
        day: e.day || 1,
        color: getColor(e.type),
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const publishEvent = async () => {
    if (!form.title || !form.day) return;
    try {
      await api.events.create({ ...form, day: Number(form.day) });
      setForm({
        title: "",
        type: "Hackathon",
        day: "",
        venue: "",
        link: "",
      });
      loadEvents();
    } catch (err) {
      console.error("Create event error:", err);
    }
  };

  const updateEvent = async () => {
    if (!selected) return;
    try {
      await api.events.update(selected.id, { ...form, day: Number(form.day) });
      setSelected(null);
      setForm({
        title: "",
        type: "Hackathon",
        day: "",
        venue: "",
        link: "",
      });
      loadEvents();
    } catch (err) {
      console.error("Update event error:", err);
    }
  };

  const deleteEvent = async () => {
    if (!selected) return;
    try {
      await api.events.delete(selected.id);
      setSelected(null);
      setForm({
        title: "",
        type: "Hackathon",
        day: "",
        venue: "",
        link: "",
      });
      loadEvents();
    } catch (err) {
      console.error("Delete event error:", err);
    }
  };

  const filteredEvents =
    activeFilter === "All"
      ? events
      : events.filter((event) => event.type === activeFilter.slice(0, -1));

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px]">
        <p
          className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
        >
          Admin Portal
        </p>

        <h1 className="mt-4 text-[92px] leading-[0.88] tracking-[-0.08em] font-medium">
          Manage Calendar.
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-14">
          {/* EDITOR */}
          <div className="xl:col-span-3">
            <div
              className={`rounded-[30px] ${dark ? "bg-[#1e1e1e]" : "bg-white"} border ${dark ? "border-white/10" : "border-black/5"} p-6 ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}`}
            >
              <h2 className="text-[30px] tracking-[-0.05em] font-medium">
                Event Editor
              </h2>

              <div className="space-y-4 mt-8">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Event Title"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />

                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                >
                  <option>Hackathon</option>
                  <option>Workshop</option>
                  <option>Competition</option>
                  <option>Meeting</option>
                </select>

                <input
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  placeholder="Day (1-31)"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />

                <input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Venue"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="Google Form Link"
                  className={`w-full h-[52px] rounded-[14px] border ${
                    dark ? "border-white/10" : "border-black/10"
                  } px-4`}
                />
              </div>

              {!selected ? (
                <button
                  onClick={publishEvent}
                  className="mt-6 w-full h-[52px] rounded-[14px] bg-[#0071e3] text-white"
                >
                  Publish Event
                </button>
              ) : (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={updateEvent}
                    className="flex-1 h-[52px] rounded-[14px] bg-[#0071e3] text-white"
                  >
                    Update
                  </button>

                  <button
                    onClick={deleteEvent}
                    className="flex-1 h-[52px] rounded-[14px] bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CALENDAR */}
          <div
            className={`xl:col-span-9 rounded-[32px] ${dark ? "bg-[#1e1e1e]" : "bg-white"} border ${dark ? "border-white/10" : "border-black/5"} p-6 ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}`}
          >
            <div className="grid grid-cols-7 gap-3">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className={`h-[54px] rounded-[18px] ${dark ? "bg-white/[0.05]" : "bg-black/[0.03]"} flex items-center justify-center`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3 mt-3">
              {Array.from({ length: 31 }, (_, i) => {
                const currentDay = i + 1;

                const event = filteredEvents.find((e) => e.day === currentDay);

                return (
                  <div
                    key={currentDay}
                    onClick={() => {
                      if (!event) return;

                      setSelected(event);

                      setForm({
                        title: event.title,
                        type: event.type,
                        day: event.day,
                        venue: event.venue || "",
                        link: event.link || "",
                      });
                    }}
                    className={`
                    h-[115px]
                    rounded-[20px]
                    border
                    ${dark ? "border-white/10" : "border-black/5"}
                    ${dark ? "bg-[#2a2a2a]" : "bg-[#fafafa]"}
                    p-3
                    ${event ? "cursor-pointer" : ""}
                  `}
                  >
                    <h3 className="font-medium">{currentDay}</h3>

                    {event && (
                      <div
                        className={`
                          mt-3
                          rounded-[14px]
                          p-3
                          text-white
                          ${event.color}
                        `}
                      >
                        <p className="text-[10px]">{event.type}</p>

                        <h4 className="mt-2 text-[13px]">{event.title}</h4>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageBg>
  );
}
function ManageMembersPage() {
  const { dark } = useTheme();
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  // xpModal: { memberId, name, currentXp } | null
  const [xpModal, setXpModal] = useState(null);
  const [xpInput, setXpInput] = useState("");
  const [xpMode, setXpMode] = useState("add"); // 'set' | 'add' | 'subtract'
  const [xpSaving, setXpSaving] = useState(false);

  const loadMembers = async () => {
    try {
      const data = await api.members.getAll();
      setMembers(data.map((m) => ({ ...m, id: m._id })));
    } catch (err) {
      console.error("Load members error:", err);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const deleteMember = async (id) => {
    if (!window.confirm("Remove this member? This cannot be undone.")) return;
    try {
      await api.members.delete(id);
      loadMembers();
    } catch (err) {
      console.error("Delete member error:", err);
    }
  };

  const openXpModal = (member) => {
    setXpModal({
      memberId: member.id,
      name: member.name,
      currentXp: member.xp || 0,
    });
    setXpInput("");
    setXpMode("add");
  };

  const closeXpModal = () => {
    setXpModal(null);
    setXpInput("");
  };

  const saveXp = async () => {
    const val = Number(xpInput);
    if (isNaN(val) || xpInput.trim() === "") {
      alert("Please enter a valid number.");
      return;
    }
    setXpSaving(true);
    try {
      await api.members.updateXp(xpModal.memberId, val, xpMode);
      await loadMembers();
      closeXpModal();
    } catch (err) {
      alert("Failed to update XP: " + err.message);
    } finally {
      setXpSaving(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.ien.toLowerCase().includes(search.toLowerCase()),
  );

  // Preview what the XP will become
  const previewXp = () => {
    if (!xpModal || xpInput.trim() === "") return xpModal?.currentXp ?? 0;
    const val = Number(xpInput);
    if (isNaN(val)) return xpModal.currentXp;
    if (xpMode === "add") return Math.max(0, xpModal.currentXp + val);
    if (xpMode === "subtract") return Math.max(0, xpModal.currentXp - val);
    return Math.max(0, val);
  };

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px]">
        {/* HERO */}
        <div>
          <p
            className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Admin Portal
          </p>
          <h1 className="mt-4 text-[48px] sm:text-[68px] lg:text-[92px] leading-[0.88] tracking-[-0.08em] font-medium">
            Manage Members.
          </h1>
          <p
            className={`mt-6 max-w-[760px] text-[15px] sm:text-[17px] leading-[1.8] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            View, search, manage members and manually assign XP.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { label: "Total Members", value: members.length },
            {
              label: "Admins",
              value: members.filter((m) => m.role === "admin").length,
            },
            {
              label: "Total XP Distributed",
              value: members
                .reduce((s, m) => s + (m.xp || 0), 0)
                .toLocaleString(),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[30px] border p-8 ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"} ${dark ? "bg-[#1e1e1e] border-white/10" : "bg-white border-black/5"}`}
            >
              <p
                className={`${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} text-[13px]`}
              >
                {stat.label}
              </p>
              <h2 className="mt-3 text-[52px] tracking-[-0.05em] font-medium">
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div
          className={`mt-10 rounded-[30px] border p-6 ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"} ${dark ? "bg-[#1e1e1e] border-white/10" : "bg-white border-black/5"}`}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name or IEN Number…"
            className={`w-full h-[56px] rounded-[16px] border px-5 text-[15px] outline-none
              ${dark ? "bg-[#2a2a2a] border-white/10 text-white placeholder-white/30" : "border-black/10"}`}
          />
        </div>

        {/* MEMBERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`rounded-[32px] border p-8 ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"} ${dark ? "bg-[#1e1e1e] border-white/10" : "bg-white border-black/5"}`}
            >
              {/* Avatar + actions */}
              <div className="flex items-start justify-between">
                <div className="w-[70px] h-[70px] rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[24px] font-medium shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openXpModal(member)}
                    className="px-4 h-[38px] rounded-full bg-[#0071e3] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
                  >
                    ⚡ XP
                  </button>
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="px-4 h-[38px] rounded-full bg-red-500 text-white text-[13px] hover:opacity-90 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Name */}
              <h3 className="mt-6 text-[30px] tracking-[-0.05em] font-medium">
                {member.name}
              </h3>

              {/* Fields */}
              <div className="mt-6 space-y-3">
                {[
                  { label: "IEN Number", value: member.ien },
                  { label: "Email", value: member.email, extra: "break-all" },
                  { label: "Role", value: member.role },
                  {
                    label: "Solved",
                    value: `${member.solvedCount || 0} problems`,
                  },
                  { label: "Streak", value: `${member.streak || 0} days` },
                  {
                    label: "Joined",
                    value: member.joined
                      ? new Date(member.joined).toLocaleDateString()
                      : "—",
                  },
                ].map((f) => (
                  <div key={f.label}>
                    <p
                      className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} uppercase`}
                    >
                      {f.label}
                    </p>
                    <p className={`mt-1 ${f.extra || ""}`}>{f.value}</p>
                  </div>
                ))}

                {/* XP highlighted */}
                <div
                  className={`mt-2 rounded-[16px] p-4 flex items-center justify-between ${dark ? "bg-[#2a2a2a]" : "bg-[#f5f5f7]"}`}
                >
                  <div>
                    <p
                      className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} uppercase`}
                    >
                      XP
                    </p>
                    <p className="text-[28px] font-bold tracking-[-0.04em] text-[#0071e3]">
                      {(member.xp || 0).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => openXpModal(member)}
                    className="text-[12px] text-[#0071e3] hover:underline"
                  >
                    Edit →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── XP MODAL ─────────────────────────────────────────── */}
      {xpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeXpModal}
          />

          {/* Panel */}
          <div
            className={`relative w-full max-w-[420px] rounded-[32px] p-8 shadow-2xl z-10
            ${dark ? "bg-[#1e1e1e] border border-white/10" : "bg-white border border-black/5"}`}
          >
            <h2 className="text-[28px] font-medium tracking-[-0.04em]">
              Assign XP
            </h2>
            <p
              className={`mt-1 text-[14px] ${dark ? "text-[#aaa]" : "text-[#666]"}`}
            >
              {xpModal.name}
            </p>

            {/* Current XP */}
            <div
              className={`mt-6 rounded-[18px] p-4 ${dark ? "bg-[#2a2a2a]" : "bg-[#f5f5f7]"}`}
            >
              <p
                className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} uppercase`}
              >
                Current XP
              </p>
              <p className="text-[36px] font-bold tracking-[-0.05em] text-[#0071e3] mt-1">
                {xpModal.currentXp.toLocaleString()}
              </p>
            </div>

            {/* Mode selector */}
            <div className="mt-6">
              <p
                className={`text-[13px] font-medium mb-3 ${dark ? "text-[#ddd]" : "text-[#333]"}`}
              >
                Operation
              </p>
              <div className="flex gap-2">
                {[
                  { value: "add", label: "+ Add" },
                  { value: "subtract", label: "− Subtract" },
                  { value: "set", label: "= Set to" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setXpMode(opt.value)}
                    className={`flex-1 h-[42px] rounded-[12px] text-[13px] font-medium transition-all
                      ${
                        xpMode === opt.value
                          ? "bg-[#0071e3] text-white"
                          : dark
                            ? "bg-white/10 text-white/70 hover:bg-white/15"
                            : "bg-black/5 text-[#555] hover:bg-black/10"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div className="mt-5">
              <label
                className={`text-[13px] font-medium block mb-2 ${dark ? "text-[#ddd]" : "text-[#333]"}`}
              >
                XP Amount
              </label>
              <input
                type="number"
                min="0"
                value={xpInput}
                onChange={(e) => setXpInput(e.target.value)}
                placeholder="e.g. 50"
                className={`w-full h-[52px] rounded-[14px] border px-5 text-[16px] outline-none
                  ${dark ? "bg-[#2a2a2a] border-white/10 text-white placeholder-white/30" : "border-black/10"}`}
              />
            </div>

            {/* Preview */}
            {xpInput.trim() !== "" && !isNaN(Number(xpInput)) && (
              <div
                className={`mt-4 rounded-[14px] p-3 flex items-center justify-between
                ${dark ? "bg-[#2a2a2a]" : "bg-[#f0f7ff]"}`}
              >
                <span
                  className={`text-[13px] ${dark ? "text-[#aaa]" : "text-[#555]"}`}
                >
                  New XP will be
                </span>
                <span className="text-[20px] font-bold text-[#0071e3]">
                  {previewXp().toLocaleString()}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={closeXpModal}
                className={`flex-1 h-[50px] rounded-[14px] text-[15px] font-medium
                  ${dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-black/5 text-[#333] hover:bg-black/10"}`}
              >
                Cancel
              </button>
              <button
                onClick={saveXp}
                disabled={xpSaving || xpInput.trim() === ""}
                className="flex-1 h-[50px] rounded-[14px] bg-[#0071e3] text-white text-[15px] font-medium
                  hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {xpSaving ? "Saving…" : "Save XP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageBg>
  );
}
function ManageAnnouncementsPage() {
  const { dark } = useTheme();
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "General",
    content: "",
    date: "",
  });

  const loadArticles = async () => {
    try {
      const data = await api.announcements.getAll();
      setArticles(data.map((a) => ({ ...a, id: a._id })));
    } catch (err) {
      console.error("Load announcements error:", err);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const publishArticle = async () => {
    if (!form.title || !form.content) return;
    try {
      await api.announcements.create(form);
      setForm({ title: "", category: "General", content: "", date: "" });
      loadArticles();
    } catch (err) {
      console.error("Create announcement error:", err);
    }
  };

  const updateArticle = async () => {
    if (!selected) return;
    try {
      await api.announcements.update(selected.id, form);
      setSelected(null);
      setForm({ title: "", category: "General", content: "", date: "" });
      loadArticles();
    } catch (err) {
      console.error("Update announcement error:", err);
    }
  };

  const deleteArticle = async () => {
    if (!selected) return;
    try {
      await api.announcements.delete(selected.id);
      setSelected(null);
      setForm({ title: "", category: "General", content: "", date: "" });
      loadArticles();
    } catch (err) {
      console.error("Delete announcement error:", err);
    }
  };

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px]">
        {/* HERO */}
        <div className="text-center">
          <p
            className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Admin Portal
          </p>

          <h1
            className="
              mt-4
              text-[48px]
              sm:text-[68px]
              lg:text-[92px]
              leading-[0.88]
              tracking-[-0.08em]
              font-medium
            "
          >
            THE COMPILE TIMES
          </h1>

          <p
            className={`
              mt-6
              text-[16px]
              ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
            `}
          >
            Create, edit and publish announcements.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-16">
          {/* EDITOR */}
          <div className="xl:col-span-4">
            <div
              className={`
                rounded-[32px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-8
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <h2
                className="
                  text-[32px]
                  tracking-[-0.05em]
                  font-medium
                "
              >
                Article Editor
              </h2>

              <div className="space-y-4 mt-8">
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Headline"
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                />

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                >
                  <option>General</option>
                  <option>Hackathon</option>
                  <option>Workshop</option>
                  <option>Competition</option>
                  <option>Announcement</option>
                </select>

                <input
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  placeholder="Publication Date"
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                />

                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      content: e.target.value,
                    })
                  }
                  placeholder="Article Content"
                  className={`
                    w-full
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    p-4
                    resize-none
                  `}
                />
              </div>

              {!selected ? (
                <button
                  onClick={publishArticle}
                  className="
                    mt-6
                    w-full
                    h-[52px]
                    rounded-[14px]
                    bg-[#0071e3]
                    text-white
                  "
                >
                  Publish Article
                </button>
              ) : (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={updateArticle}
                    className="
                      flex-1
                      h-[52px]
                      rounded-[14px]
                      bg-[#0071e3]
                      text-white
                    "
                  >
                    Update
                  </button>

                  <button
                    onClick={deleteArticle}
                    className="
                      flex-1
                      h-[52px]
                      rounded-[14px]
                      bg-red-500
                      text-white
                    "
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* NEWSPAPER PREVIEW */}
          <div className="xl:col-span-8">
            <div
              className={`
                rounded-[32px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-10
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <h2
                className="
                  text-center
                  text-[54px]
                  tracking-[-0.06em]
                  font-medium
                  border-b
                  pb-6
                "
              >
                THE COMPILE TIMES
              </h2>

              <div className="mt-10 space-y-8">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => {
                      setSelected(article);

                      setForm({
                        title: article.title,
                        category: article.category,
                        content: article.content,
                        date: article.date,
                      });
                    }}
                    className="
                      cursor-pointer
                      border-b
                      pb-8
                      hover:opacity-70
                      transition-all
                    "
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="
                          px-3
                          py-1
                          rounded-full
                          bg-[#0071e3]/10
                          text-[#0071e3]
                          text-[11px]
                        "
                      >
                        {article.category}
                      </span>

                      <span
                        className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                      >
                        {article.date}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-4
                        text-[34px]
                        leading-[1]
                        tracking-[-0.05em]
                        font-medium
                      "
                    >
                      {article.title}
                    </h3>

                    <p
                      className={`
                        mt-4
                        text-[15px]
                        leading-[1.9]
                        ${dark ? "text-[#aaa]" : "text-[#666]"}
                      `}
                    >
                      {article.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBg>
  );
}

function ManageDailyQuestPage() {
  const { dark } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: "",
    difficulty: "Easy",
    statement: "",
    hint1: "",
    hint2: "",
    example1: "",
    example2: "",
    functionName: "solve",
    returnType: "int",
    parametersJson: "[]",
    tag1: "",
    tag2: "",
    tag3: "",
    tag4: "",
    testcase1Input: "",
    testcase1Output: "",
    testcase1Explanation: "",
    testcase2Input: "",
    testcase2Output: "",
    testcase2Explanation: "",
    testcase3Input: "",
    testcase3Output: "",
    testcase3Explanation: "",
    hiddenTestcase1Input: "",
    hiddenTestcase1Output: "",
    hiddenTestcase2Input: "",
    hiddenTestcase2Output: "",
    hiddenTestcase3Input: "",
    hiddenTestcase3Output: "",
  });

  const loadQuests = async () => {
    try {
      const data = await api.quests.getAll();
      setQuestions(data.map((q) => ({ ...q, id: q._id })));
    } catch (err) {
      console.error("Load quests error:", err);
    }
  };

  useEffect(() => {
    loadQuests();
  }, []);

  const publishQuestion = async () => {
    if (!form.title || !form.statement) return;
    try {
      // Build testcases array with input and expectedOutput
      const testcases = [];
      if (form.testcase1Input && form.testcase1Output) {
        testcases.push({
          input: form.testcase1Input,
          expectedOutput: form.testcase1Output,
          explanation: form.testcase1Explanation || "",
        });
      }
      if (form.testcase2Input && form.testcase2Output) {
        testcases.push({
          input: form.testcase2Input,
          expectedOutput: form.testcase2Output,
          explanation: form.testcase2Explanation || "",
        });
      }
      if (form.testcase3Input && form.testcase3Output) {
        testcases.push({
          input: form.testcase3Input,
          expectedOutput: form.testcase3Output,
          explanation: form.testcase3Explanation || "",
        });
      }
      if (!form.functionName.trim()) {
        alert("Function name is required");
        return;
      }

      if (!form.returnType.trim()) {
        alert("Return type is required");
        return;
      }

      const hiddenTestcases = [];
      if (form.hiddenTestcase1Input && form.hiddenTestcase1Output) {
        hiddenTestcases.push({
          input: form.hiddenTestcase1Input,
          expectedOutput: form.hiddenTestcase1Output,
        });
      }
      if (form.hiddenTestcase2Input && form.hiddenTestcase2Output) {
        hiddenTestcases.push({
          input: form.hiddenTestcase2Input,
          expectedOutput: form.hiddenTestcase2Output,
        });
      }
      if (form.hiddenTestcase3Input && form.hiddenTestcase3Output) {
        hiddenTestcases.push({
          input: form.hiddenTestcase3Input,
          expectedOutput: form.hiddenTestcase3Output,
        });
      }
      let parameters = [];

      try {
        parameters = JSON.parse(form.parametersJson || "[]");
      } catch (err) {
        alert(`Invalid Parameters JSON\n\n${err.message}`);
        return;
      }
      const hints = [form.hint1, form.hint2].filter(Boolean);

      const tags = [form.tag1, form.tag2, form.tag3, form.tag4].filter(Boolean);

      const examples = [form.example1, form.example2].filter(Boolean);
      await api.quests.create({
        title: form.title,
        difficulty: form.difficulty,
        statement: form.statement,

        functionName: form.functionName,
        returnType: form.returnType,
        parameters,

        hints,
        tags,
        examples,
        testcases,
        hiddenTestcases,
      });

      setForm({
        title: "",
        difficulty: "Easy",
        functionName: "solve",
        returnType: "int",
        parametersJson: "[]",
        statement: "",
        example1: "",
        example2: "",
        hint1: "",
        hint2: "",
        tag1: "",
        tag2: "",
        tag3: "",
        tag4: "",
        testcase1Input: "",
        testcase1Output: "",
        testcase1Explanation: "",
        testcase2Input: "",
        testcase2Output: "",
        testcase2Explanation: "",
        testcase3Input: "",
        testcase3Output: "",
        testcase3Explanation: "",
        hiddenTestcase1Input: "",
        hiddenTestcase1Output: "",
        hiddenTestcase2Input: "",
        hiddenTestcase2Output: "",
        hiddenTestcase3Input: "",
        hiddenTestcase3Output: "",
      });
      loadQuests();
      alert("Quest published successfully!");
    } catch (err) {
      console.error("Create quest error:", err);
      alert("Failed to publish quest: " + err.message);
    }
  };

  const updateQuestion = async () => {
    if (!selected) return;
    try {
      // Build testcases array with input and expectedOutput
      const testcases = [];
      if (form.testcase1Input && form.testcase1Output) {
        testcases.push({
          input: form.testcase1Input,
          expectedOutput: form.testcase1Output,
          explanation: form.testcase1Explanation || "",
        });
      }
      if (form.testcase2Input && form.testcase2Output) {
        testcases.push({
          input: form.testcase2Input,
          expectedOutput: form.testcase2Output,
          explanation: form.testcase2Explanation || "",
        });
      }
      if (form.testcase3Input && form.testcase3Output) {
        testcases.push({
          input: form.testcase3Input,
          expectedOutput: form.testcase3Output,
          explanation: form.testcase3Explanation || "",
        });
      }
      if (!form.functionName.trim()) {
        alert("Function name is required");
        return;
      }

      if (!form.returnType.trim()) {
        alert("Return type is required");
        return;
      }
      const hiddenTestcases = [];
      if (form.hiddenTestcase1Input && form.hiddenTestcase1Output) {
        hiddenTestcases.push({
          input: form.hiddenTestcase1Input,
          expectedOutput: form.hiddenTestcase1Output,
        });
      }
      if (form.hiddenTestcase2Input && form.hiddenTestcase2Output) {
        hiddenTestcases.push({
          input: form.hiddenTestcase2Input,
          expectedOutput: form.hiddenTestcase2Output,
        });
      }
      if (form.hiddenTestcase3Input && form.hiddenTestcase3Output) {
        hiddenTestcases.push({
          input: form.hiddenTestcase3Input,
          expectedOutput: form.hiddenTestcase3Output,
        });
      }
      let parameters = [];

      try {
        parameters = JSON.parse(form.parametersJson || "[]");
      } catch (err) {
        alert(`Invalid Parameters JSON\n\n${err.message}`);
        return;
      }

      const hints = [form.hint1, form.hint2].filter(Boolean);

      const tags = [form.tag1, form.tag2, form.tag3, form.tag4].filter(Boolean);

      const examples = [form.example1, form.example2].filter(Boolean);
      await api.quests.update(selected.id, {
        title: form.title,
        difficulty: form.difficulty,
        statement: form.statement,

        functionName: form.functionName,
        returnType: form.returnType,
        parameters,

        hints,
        tags,
        examples,

        testcases,
        hiddenTestcases,
      });

      setSelected(null);
      setForm({
        title: "",
        difficulty: "Easy",

        functionName: "solve",
        returnType: "int",
        parametersJson: "[]",

        statement: "",
        example1: "",
        example2: "",
        hint1: "",
        hint2: "",
        tag1: "",
        tag2: "",
        tag3: "",
        tag4: "",

        testcase1Input: "",
        testcase1Output: "",
        testcase1Explanation: "",

        testcase2Input: "",
        testcase2Output: "",
        testcase2Explanation: "",

        testcase3Input: "",
        testcase3Output: "",
        testcase3Explanation: "",

        hiddenTestcase1Input: "",
        hiddenTestcase1Output: "",

        hiddenTestcase2Input: "",
        hiddenTestcase2Output: "",

        hiddenTestcase3Input: "",
        hiddenTestcase3Output: "",
      });
      loadQuests();
      alert("Quest updated successfully!");
    } catch (err) {
      console.error("Update quest error:", err);
      alert("Failed to update quest: " + err.message);
    }
  };

  const deleteQuestion = async () => {
    if (!selected) return;
    try {
      await api.quests.delete(selected.id);
      setSelected(null);
      loadQuests();
    } catch (err) {
      console.error("Delete quest error:", err);
    }
  };

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px]">
        {/* HERO */}
        <div>
          <p
            className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Admin Portal
          </p>

          <h1
            className="
              mt-4
              text-[48px]
              sm:text-[68px]
              lg:text-[92px]
              leading-[0.88]
              tracking-[-0.08em]
              font-medium
            "
          >
            Manage Daily Quest.
          </h1>

          <p
            className={`
              mt-6
              max-w-[760px]
              text-[15px]
              sm:text-[17px]
              leading-[1.8]
              ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
            `}
          >
            Create, edit and publish coding challenges for club members.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-14">
          {/* LEFT EDITOR */}
          <div className="xl:col-span-4">
            <div
              className={`
                rounded-[32px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-8
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <h2
                className="
                  text-[30px]
                  tracking-[-0.05em]
                  font-medium
                "
              >
                Quest Editor
              </h2>

              <div className="space-y-4 mt-8">
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Problem Name"
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                />

                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      difficulty: e.target.value,
                    })
                  }
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <input
                  value={form.functionName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      functionName: e.target.value,
                    })
                  }
                  placeholder="Function Name (solve)"
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                />

                <input
                  value={form.returnType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      returnType: e.target.value,
                    })
                  }
                  placeholder="Return Type (int[])"
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                />

                <textarea
                  rows={4}
                  value={form.parametersJson}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      parametersJson: e.target.value,
                    })
                  }
                  placeholder={`[
                    { "name":"nums","type":"int[]" },
                    { "name":"target","type":"int" }
                  ]`}
                  className={`
                    w-full
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    p-4
                  `}
                />
                <textarea
                  rows={5}
                  value={form.statement}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      statement: e.target.value,
                    })
                  }
                  placeholder="Problem Statement"
                  className={`
                    w-full
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    p-4
                  `}
                />
                <textarea
                  rows={5}
                  value={form.example1}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      example1: e.target.value,
                    })
                  }
                  placeholder="Example 1"
                  className={`
                    w-full
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    p-4
                  `}
                />
                <textarea
                  rows={5}
                  value={form.example2}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      example2: e.target.value,
                    })
                  }
                  placeholder="Example 2"
                  className={`
                    w-full
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    p-4
                  `}
                />
                <input
                  value={form.hint1}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hint1: e.target.value,
                    })
                  }
                  placeholder="Hint 1"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />

                <input
                  value={form.hint2}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hint2: e.target.value,
                    })
                  }
                  placeholder="Hint 2"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />
                <input
                  value={form.tag1}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tag1: e.target.value,
                    })
                  }
                  placeholder="Tag 1"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />
                <input
                  value={form.tag2}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tag2: e.target.value,
                    })
                  }
                  placeholder="Tag 2"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />
                <input
                  value={form.tag3}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tag3: e.target.value,
                    })
                  }
                  placeholder="Tag 3"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />
                <input
                  value={form.tag4}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tag4: e.target.value,
                    })
                  }
                  placeholder="Tag 4"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />

                {/* TEST CASE 1 */}
                <div className="bg-blue-50 p-4 rounded-[14px] border border-blue-200 space-y-3">
                  <label className="text-[14px] font-medium text-blue-900">
                    Test Case 1
                  </label>
                  <input
                    value={form.testcase1Input}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase1Input: e.target.value,
                      })
                    }
                    placeholder="Input as JSON args array, e.g. [[2,7,11,15], 9]"
                    className={`w-full h-[52px] rounded-[10px] border border-blue-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.testcase1Output}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase1Output: e.target.value,
                      })
                    }
                    placeholder="Expected output as JSON, e.g. [0,1]"
                    className={`w-full h-[52px] rounded-[10px] border border-blue-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.testcase1Explanation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase1Explanation: e.target.value,
                      })
                    }
                    placeholder="Explanation (optional)"
                    className={`w-full h-[52px] rounded-[10px] border border-blue-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                </div>

                {/* TEST CASE 2 */}
                <div className="bg-green-50 p-4 rounded-[14px] border border-green-200 space-y-3">
                  <label className="text-[14px] font-medium text-green-900">
                    Test Case 2
                  </label>
                  <input
                    value={form.testcase2Input}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase2Input: e.target.value,
                      })
                    }
                    placeholder="Input as JSON args array, e.g. [3, [1,2,4]]"
                    className={`w-full h-[52px] rounded-[10px] border border-green-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.testcase2Output}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase2Output: e.target.value,
                      })
                    }
                    placeholder="Expected output as JSON, e.g. [1,2]"
                    className={`w-full h-[52px] rounded-[10px] border border-green-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.testcase2Explanation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase2Explanation: e.target.value,
                      })
                    }
                    placeholder="Explanation (optional)"
                    className={`w-full h-[52px] rounded-[10px] border border-green-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                </div>

                {/* TEST CASE 3 */}
                <div className="bg-purple-50 p-4 rounded-[14px] border border-purple-200 space-y-3">
                  <label className="text-[14px] font-medium text-purple-900">
                    Test Case 3
                  </label>
                  <input
                    value={form.testcase3Input}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase3Input: e.target.value,
                      })
                    }
                    placeholder="Input as JSON args array, e.g. [[], 0]"
                    className={`w-full h-[52px] rounded-[10px] border border-purple-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.testcase3Output}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase3Output: e.target.value,
                      })
                    }
                    placeholder="Expected output as JSON, e.g. []"
                    className={`w-full h-[52px] rounded-[10px] border border-purple-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.testcase3Explanation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        testcase3Explanation: e.target.value,
                      })
                    }
                    placeholder="Explanation (optional)"
                    className={`w-full h-[52px] rounded-[10px] border border-purple-300 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                </div>

                <p
                  className={`text-[13px] uppercase tracking-[0.16em] pt-2 ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Hidden Test Cases
                </p>
                <p
                  className={`text-[12px] ${dark ? "text-[#888]" : "text-[#666]"}`}
                >
                  Not shown to students — used for backend validation only.
                </p>

                {/* HIDDEN TEST CASE 1 */}
                <div className="bg-gray-100 p-4 rounded-[14px] border border-gray-300 space-y-3">
                  <label className="text-[14px] font-medium text-gray-800">
                    Hidden Test Case 1
                  </label>
                  <input
                    value={form.hiddenTestcase1Input}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hiddenTestcase1Input: e.target.value,
                      })
                    }
                    placeholder="Input as JSON args array"
                    className={`w-full h-[52px] rounded-[10px] border border-gray-400 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.hiddenTestcase1Output}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hiddenTestcase1Output: e.target.value,
                      })
                    }
                    placeholder="Expected output as JSON"
                    className={`w-full h-[52px] rounded-[10px] border border-gray-400 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                </div>

                {/* HIDDEN TEST CASE 2 */}
                <div className="bg-gray-100 p-4 rounded-[14px] border border-gray-300 space-y-3">
                  <label className="text-[14px] font-medium text-gray-800">
                    Hidden Test Case 2
                  </label>
                  <input
                    value={form.hiddenTestcase2Input}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hiddenTestcase2Input: e.target.value,
                      })
                    }
                    placeholder="Input as JSON args array"
                    className={`w-full h-[52px] rounded-[10px] border border-gray-400 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.hiddenTestcase2Output}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hiddenTestcase2Output: e.target.value,
                      })
                    }
                    placeholder="Expected output as JSON"
                    className={`w-full h-[52px] rounded-[10px] border border-gray-400 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                </div>

                {/* HIDDEN TEST CASE 3 */}
                <div className="bg-gray-100 p-4 rounded-[14px] border border-gray-300 space-y-3">
                  <label className="text-[14px] font-medium text-gray-800">
                    Hidden Test Case 3
                  </label>
                  <input
                    value={form.hiddenTestcase3Input}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hiddenTestcase3Input: e.target.value,
                      })
                    }
                    placeholder="Input as JSON args array"
                    className={`w-full h-[52px] rounded-[10px] border border-gray-400 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                  <input
                    value={form.hiddenTestcase3Output}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hiddenTestcase3Output: e.target.value,
                      })
                    }
                    placeholder="Expected output as JSON"
                    className={`w-full h-[52px] rounded-[10px] border border-gray-400 px-4 ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
                  />
                </div>
              </div>

              {!selected ? (
                <button
                  onClick={publishQuestion}
                  className="
                    mt-6
                    w-full
                    h-[52px]
                    rounded-[14px]
                    bg-[#0071e3]
                    text-white
                  "
                >
                  Publish Quest
                </button>
              ) : (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={updateQuestion}
                    className="
                      flex-1
                      h-[52px]
                      rounded-[14px]
                      bg-[#0071e3]
                      text-white
                    "
                  >
                    Update
                  </button>

                  <button
                    onClick={deleteQuestion}
                    className="
                      flex-1
                      h-[52px]
                      rounded-[14px]
                      bg-red-500
                      text-white
                    "
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="xl:col-span-8">
            <div
              className={`
                rounded-[32px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
                overflow-hidden
              `}
            >
              {questions.map((question) => (
                <div
                  key={question.id}
                  onClick={() => {
                    setSelected(question);

                    setForm({
                      title: question.title,
                      difficulty: question.difficulty,
                      functionName: question.functionName || "solve",

                      returnType: question.returnType || "int",

                      parametersJson: JSON.stringify(
                        question.parameters || [],
                        null,
                        2,
                      ),

                      statement: question.statement,
                      example1: question.examples?.[0] || "",
                      example2: question.examples?.[1] || "",
                      hint1: question.hints?.[0] || "",
                      hint2: question.hints?.[1] || "",
                      tag1: question.tags?.[0] || "",
                      tag2: question.tags?.[1] || "",
                      tag3: question.tags?.[2] || "",
                      tag4: question.tags?.[3] || "",
                      testcase1Input: question.testcases?.[0]?.input || "",
                      testcase1Output:
                        question.testcases?.[0]?.expectedOutput || "",
                      testcase1Explanation:
                        question.testcases?.[0]?.explanation || "",
                      testcase2Input: question.testcases?.[1]?.input || "",
                      testcase2Output:
                        question.testcases?.[1]?.expectedOutput || "",
                      testcase2Explanation:
                        question.testcases?.[1]?.explanation || "",
                      testcase3Input: question.testcases?.[2]?.input || "",
                      testcase3Output:
                        question.testcases?.[2]?.expectedOutput || "",
                      testcase3Explanation:
                        question.testcases?.[2]?.explanation || "",
                      hiddenTestcase1Input:
                        question.hiddenTestcases?.[0]?.input || "",
                      hiddenTestcase1Output:
                        question.hiddenTestcases?.[0]?.expectedOutput || "",
                      hiddenTestcase2Input:
                        question.hiddenTestcases?.[1]?.input || "",
                      hiddenTestcase2Output:
                        question.hiddenTestcases?.[1]?.expectedOutput || "",
                      hiddenTestcase3Input:
                        question.hiddenTestcases?.[2]?.input || "",
                      hiddenTestcase3Output:
                        question.hiddenTestcases?.[2]?.expectedOutput || "",
                    });
                  }}
                  className={`
                    p-10
                    border-b
                    cursor-pointer
                    ${dark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.02]"}
                    transition-all
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-[11px]
                        ${
                          question.difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : question.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  <h2
                    className="
                      mt-5
                      text-[42px]
                      tracking-[-0.05em]
                      font-medium
                    "
                  >
                    {question.title}
                  </h2>

                  <p
                    className={`
                      mt-5
                      text-[15px]
                      leading-[1.9]
                      ${dark ? "text-[#aaa]" : "text-[#666]"}
                    `}
                  >
                    {question.statement}
                  </p>

                  <div className="mt-6 flex gap-3 flex-wrap">
                    {question.hints?.map((hint) => (
                      <div
                        key={hint}
                        className={`
                          px-4
                          py-2
                          rounded-full
                          ${dark ? "bg-white/[0.06]" : "bg-black/[0.04]"}
                          text-[13px]
                        `}
                      >
                        {hint}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageBg>
  );
}

function ManageGalleryPage() {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Hackathons", "Workshops", "Events"];
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "Hackathons",
    imageUrl: "",
  });

  const loadImages = async () => {
    try {
      const data = await api.gallery.getAll();
      setImages(
        data.map((img) => ({
          ...img,
          id: img._id,
          image: img.imageUrl || img.image,
        })),
      );
    } catch (err) {
      console.error("Load gallery error:", err);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const publishImage = async () => {
    if (!form.title || !form.imageUrl) {
      alert("Please fill in title and image URL");
      return;
    }
    try {
      await api.gallery.create({
        title: form.title,
        category: form.category,
        image: form.imageUrl,
      });
      setForm({ title: "", category: "Hackathons", imageUrl: "" });
      loadImages();
      alert("Image published successfully!");
    } catch (err) {
      console.error("Create gallery error:", err);
      alert("Failed to publish image: " + err.message);
    }
  };

  const updateImage = async () => {
    if (!selected) return;
    try {
      await api.gallery.update(selected.id, {
        title: form.title,
        category: form.category,
        imageUrl: form.imageUrl,
      });
      setSelected(null);
      setForm({ title: "", category: "Hackathons", imageUrl: "" });
      loadImages();
    } catch (err) {
      console.error("Update gallery error:", err);
    }
  };

  const deleteImage = async () => {
    if (!selected) return;
    try {
      await api.gallery.delete(selected.id);
      setSelected(null);
      setForm({ title: "", category: "Hackathons", imageUrl: "" });
      loadImages();
    } catch (err) {
      console.error("Delete gallery error:", err);
    }
  };

  const filteredImages =
    activeTab === "All"
      ? images
      : images.filter((img) => img.category === activeTab);

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px]">
        {/* HERO */}
        <div>
          <p
            className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Admin Portal
          </p>

          <h1
            className="
              mt-4
              text-[48px]
              sm:text-[68px]
              lg:text-[92px]
              leading-[0.88]
              tracking-[-0.08em]
              font-medium
            "
          >
            Manage Gallery.
          </h1>

          <p
            className={`
              mt-6
              max-w-[720px]
              text-[15px]
              sm:text-[17px]
              leading-[1.8]
              ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
            `}
          >
            Upload, edit and manage gallery images across hackathons, workshops
            and club events.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-14">
          {/* LEFT PANEL */}
          <div className="xl:col-span-4">
            <div
              className={`
                rounded-[32px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-8
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <h2
                className="
                  text-[30px]
                  tracking-[-0.05em]
                  font-medium
                "
              >
                Image Editor
              </h2>

              <div className="space-y-4 mt-8">
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Image Title"
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                />

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                >
                  <option>Hackathons</option>
                  <option>Workshops</option>
                  <option>Events</option>
                </select>

                <input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="Image URL"
                  className={`
                    w-full
                    h-[52px]
                    rounded-[14px]
                    border
                    ${dark ? "border-white/10" : "border-black/10"}
                    px-4
                  `}
                />

                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="
                      w-full
                      h-[220px]
                      rounded-[20px]
                      object-cover
                    "
                  />
                )}
              </div>

              {!selected ? (
                <button
                  onClick={publishImage}
                  className="
                    mt-6
                    w-full
                    h-[52px]
                    rounded-[14px]
                    bg-[#0071e3]
                    text-white
                  "
                >
                  Publish Image
                </button>
              ) : (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={updateImage}
                    className="
                      flex-1
                      h-[52px]
                      rounded-[14px]
                      bg-[#0071e3]
                      text-white
                    "
                  >
                    Update
                  </button>

                  <button
                    onClick={deleteImage}
                    className="
                      flex-1
                      h-[52px]
                      rounded-[14px]
                      bg-red-500
                      text-white
                    "
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* GALLERY SIDE */}
          <div className="xl:col-span-8">
            {/* FILTERS */}
            <div className="flex justify-center mb-8">
              <div
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-[24px]
                  ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                  border
                  ${dark ? "border-white/10" : "border-black/5"}
                  p-3
                  ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
                `}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-6
                      h-[46px]
                      rounded-[14px]
                      text-[14px]
                      transition-all
                      ${
                        activeTab === tab
                          ? "bg-[#0071e3] text-white"
                          : "hover:bg-black/[0.04]"
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* IMAGE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => {
                    setSelected(image);

                    setForm({
                      title: image.title,
                      category: image.category,
                      imageUrl: image.imageUrl || image.image,
                    });
                  }}
                  className={`
                    overflow-hidden
                    rounded-[30px]
                    ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                    border
                    ${dark ? "border-white/10" : "border-black/5"}
                    ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
                    cursor-pointer
                    hover:-translate-y-1
                    transition-all
                  `}
                >
                  <div className="h-[280px]">
                    <img
                      src={image.image}
                      alt=""
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  </div>

                  <div className="p-6">
                    <p
                      className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} uppercase tracking-[0.16em]`}
                    >
                      {image.category}
                    </p>

                    <h3
                      className="
                        mt-3
                        text-[28px]
                        leading-[0.95]
                        tracking-[-0.05em]
                        font-medium
                      "
                    >
                      {image.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageBg>
  );
}

function ManageResourcesPage() {
  const { dark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = [
    "All",
    "AI & ML Enthusiasts",
    "Project Builders",
    "WebApp Developers",
    "DSA Coders",
  ];
  const [resources, setResources] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "AI & ML Enthusiasts",
    description: "",
    tag: "Recently Added",
    link: "",
    image: "",
  });

  const loadResources = async () => {
    try {
      const data = await api.resources.getAll();
      setResources(data.map((r) => ({ ...r, id: r._id })));
    } catch (err) {
      console.error("Load resources error:", err);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const publishResource = async () => {
    if (!form.title || !form.description) return;
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      await api.resources.create(formData);
      setForm({
        title: "",
        category: "AI & ML Enthusiasts",
        description: "",
        tag: "Recently Added",
        link: "",
        image: "",
      });
      loadResources();
    } catch (err) {
      console.error("Create resource error:", err);
    }
  };

  const updateResource = async () => {
    if (!selected) return;
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      await api.resources.update(selected.id, formData);
      setSelected(null);
      setForm({
        title: "",
        category: "AI & ML Enthusiasts",
        description: "",
        tag: "Recently Added",
        link: "",
        image: "",
      });
      loadResources();
    } catch (err) {
      console.error("Update resource error:", err);
    }
  };

  const deleteResource = async () => {
    if (!selected) return;
    try {
      await api.resources.delete(selected.id);
      setSelected(null);
      setForm({
        title: "",
        category: "AI & ML Enthusiasts",
        description: "",
        tag: "Recently Added",
        link: "",
        image: "",
      });
      loadResources();
    } catch (err) {
      console.error("Delete resource error:", err);
    }
  };

  const filteredResources =
    activeFilter === "All"
      ? resources
      : resources.filter((resource) => resource.category === activeFilter);

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px]">
        {/* HERO */}
        <div>
          <p
            className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Admin Portal
          </p>

          <h1
            className="
              mt-4
              text-[48px]
              sm:text-[68px]
              lg:text-[92px]
              leading-[0.88]
              tracking-[-0.08em]
              font-medium
            "
          >
            Manage Resources.
          </h1>

          <p
            className={`
              mt-6
              max-w-[760px]
              text-[15px]
              sm:text-[17px]
              leading-[1.8]
              ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
            `}
          >
            Create, edit and organize learning resources for club members.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-14">
          {/* EDITOR */}
          <div className="xl:col-span-4">
            <div
              className={`
                rounded-[32px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-8
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <h2
                className="
                  text-[30px]
                  tracking-[-0.05em]
                  font-medium
                "
              >
                Resource Editor
              </h2>

              <div className="space-y-4 mt-8">
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Resource Title"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                >
                  <option>AI & ML Enthusiasts</option>
                  <option>Project Builders</option>
                  <option>WebApp Developers</option>
                  <option>DSA Coders</option>
                </select>

                <select
                  value={form.tag}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tag: e.target.value,
                    })
                  }
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                >
                  <option>Recently Added</option>
                  <option>Trending</option>
                  <option>Popular</option>
                  <option>Research</option>
                </select>

                <input
                  value={form.link}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      link: e.target.value,
                    })
                  }
                  placeholder="Resource Link"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />

                <input
                  value={form.image}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value,
                    })
                  }
                  placeholder="Image URL"
                  className={`w-full h-[52px] rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} px-4`}
                />

                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Resource Description"
                  className={`w-full rounded-[14px] border ${dark ? "border-white/10" : "border-black/10"} p-4 resize-none`}
                />

                {form.image && (
                  <img
                    src={form.image}
                    alt=""
                    className="
                      w-full
                      h-[220px]
                      rounded-[20px]
                      object-cover
                    "
                  />
                )}
              </div>

              {!selected ? (
                <button
                  onClick={publishResource}
                  className="
                    mt-6
                    w-full
                    h-[52px]
                    rounded-[14px]
                    bg-[#0071e3]
                    text-white
                  "
                >
                  Publish Resource
                </button>
              ) : (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={updateResource}
                    className="
                      flex-1
                      h-[52px]
                      rounded-[14px]
                      bg-[#0071e3]
                      text-white
                    "
                  >
                    Update
                  </button>

                  <button
                    onClick={deleteResource}
                    className="
                      flex-1
                      h-[52px]
                      rounded-[14px]
                      bg-red-500
                      text-white
                    "
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RESOURCES */}
          <div className="xl:col-span-8">
            {/* FILTERS */}
            <div className="flex justify-center mb-8">
              <div
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-[24px]
                  ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                  border
                  ${dark ? "border-white/10" : "border-black/5"}
                  p-3
                  ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
                  overflow-x-auto
                `}
              >
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`
                      px-6
                      h-[46px]
                      rounded-[14px]
                      text-[14px]
                      whitespace-nowrap
                      transition-all
                      ${
                        activeFilter === filter
                          ? "bg-[#0071e3] text-white"
                          : "hover:bg-black/[0.04]"
                      }
                    `}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* RESOURCE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => {
                    setSelected(resource);

                    setForm({
                      title: resource.title,
                      category: resource.category,
                      description: resource.description,
                      tag: resource.tag,
                      link: resource.link,
                      image: resource.image,
                    });
                  }}
                  className={`
                    overflow-hidden
                    rounded-[32px]
                    ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                    border
                    ${dark ? "border-white/10" : "border-black/5"}
                    ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
                    cursor-pointer
                    hover:-translate-y-1
                    transition-all
                  `}
                >
                  <div className="relative h-[240px]">
                    <img
                      src={resource.image}
                      alt=""
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/70
                        via-black/10
                        to-transparent
                      "
                    />

                    <div className="absolute top-5 left-5">
                      <div
                        className="
                          px-4
                          h-[34px]
                          rounded-full
                          bg-white/15
                          backdrop-blur-xl
                          text-white
                          text-[12px]
                          flex
                          items-center
                        "
                      >
                        {resource.tag}
                      </div>
                    </div>

                    <div className="absolute bottom-5 left-5 text-white">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">
                        {resource.category}
                      </p>

                      <h3
                        className="
                          mt-3
                          text-[28px]
                          leading-[1]
                          tracking-[-0.05em]
                          font-medium
                          max-w-[280px]
                        "
                      >
                        {resource.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-7">
                    <p
                      className={`text-[15px] leading-[1.8] ${dark ? "text-[#aaa]" : "text-[#666]"}`}
                    >
                      {resource.description}
                    </p>

                    <button
                      className="
                        mt-6
                        px-5
                        h-[42px]
                        rounded-full
                        bg-[#0071e3]
                        text-white
                        text-[13px]
                      "
                    >
                      Open Resource
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageBg>
  );
}

function PlatformPage() {
  const { dark } = useTheme();
  const navigate = useNavigate();

  const slides = [
    {
      title: "Announcements",
      subtitle: "Latest Updates",
      route: "/announcements",
      image:
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1400&auto=format&fit=crop",
    },
    {
      title: "Calendar",
      subtitle: "Upcoming Events",
      route: "/calendar",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1400&auto=format&fit=crop",
    },
    {
      title: "Resources",
      subtitle: "Learning Hub",
      route: "/resources",
      image:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1400&auto=format&fit=crop",
    },
    {
      title: "Gallery",
      subtitle: "Club Moments",
      route: "/gallery",
      image:
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1400&auto=format&fit=crop",
    },
  ];

  return (
    <section className="min-h-screen overflow-hidden bg-[#f2f2f4] relative">
      {/* TINTS */}
      <div className="absolute top-[-300px] right-[-250px] w-[800px] h-[800px] rounded-full bg-[#0071e3]/10 blur-3xl pointer-events-none" />

      <div className="absolute bottom-[-400px] left-[-300px] w-[900px] h-[900px] rounded-full bg-[#4152ff]/10 blur-3xl pointer-events-none" />

      {/* HERO */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 pt-[80px] relative z-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div>
            <p
              className={`text-[13px] uppercase tracking-wide ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Explore The Ecosystem
            </p>

            <h1 className="mt-4 text-[44px] lg:text-[72px] leading-[0.92] tracking-[-0.05em] font-medium">
              Discover the
              <br />
              club platform.
            </h1>
          </div>
        </div>
      </div>

      {/* SLIDER */}
      <div className="relative mt-[90px] overflow-hidden">
        <motion.div
          className="flex gap-8 w-max px-6 lg:px-10"
          animate={{
            x: [0, -2200],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...slides, ...slides].map((slide, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -12,
                scale: 1.02,
              }}
              onClick={() => navigate(slide.route)}
              className="
                relative
                w-[360px]
                lg:w-[420px]
                h-[620px]
                rounded-[38px]
                overflow-hidden
                cursor-pointer
                bg-white/80
                backdrop-blur-xl
                border
                border-white/60
                shadow-[0_20px_70px_rgba(0,0,0,0.08)]
                shrink-0
                flex
                flex-col
              "
            >
              <div className="absolute top-[-120px] right-[-120px] w-[280px] h-[280px] rounded-full bg-[#0071e3]/10 blur-3xl" />

              {/* IMAGE SECTION */}
              <div className="relative h-[260px] overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="
                    w-full
                    h-full
                    object-cover
                    transition-all
                    duration-700
                    hover:scale-110
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/50
                    via-black/10
                    to-transparent
                  "
                />
              </div>

              {/* CONTENT */}
              <div className="relative z-20 flex-1 flex flex-col justify-between p-8">
                <div>
                  <p
                    className={`text-[13px] uppercase tracking-wide ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                  >
                    {slide.subtitle}
                  </p>

                  <h2 className="mt-5 text-[42px] lg:text-[52px] leading-[0.9] tracking-[-0.06em] font-medium">
                    {slide.title}
                  </h2>
                </div>

                <div className="flex items-center justify-between mt-10">
                  <div className="w-[62px] h-[62px] rounded-full bg-[#0071e3] flex items-center justify-center shadow-lg">
                    <ArrowRight size={24} color="white" />
                  </div>

                  <p
                    className={`text-[13px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                  >
                    Click to Explore
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ========================================
// PLACEHOLDER PAGES
// ========================================

function DashboardPage() {
  const { dark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.analytics.getStudent();
        setAnalytics(data);
      } catch (err) {
        console.error("Fetch student analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    console.log("Analytics:", analytics);
    console.log("Pie Data:", analytics?.pieData);
    console.log("Contribution Data:", analytics?.contributionData);
    console.log("Growth Data:", analytics?.growthData);
  }, [analytics]);

  // FIX 1: contributionData correctly falls back to 31 zero-level days while loading
  const contributionData =
    analytics?.contributionData ||
    Array.from({ length: 31 }, () => ({ level: 0 }));

  // FIX 2: pieData sourced directly from analytics — no more stale local variable
  const pieData = analytics?.pieData || [
    { name: "Easy", value: 0, count: 0 },
    { name: "Medium", value: 0, count: 0 },
    { name: "Hard", value: 0, count: 0 },
  ];

  const weeklyStats = [
    {
      title: "Problems Solved",
      value: String(analytics?.solvedCount ?? user?.solvedCount ?? 0),
    },
    {
      title: "Contest Rating",
      value: String(analytics?.contestRating ?? user?.contestRating ?? 0),
    },
    {
      title: "Current Streak",
      value: `${analytics?.streak ?? user?.streak ?? 0} Days`,
    },
    {
      title: "Projects Built",
      value: String(analytics?.projectBuilt ?? user?.projectBuilt ?? 0),
    },
  ];

  // FIX 7: pad the start of the grid with empty cells so day 1 lands
  // in the correct weekday column, based on dayOfWeek from the backend
  const firstDay =
    contributionData.length > 0 ? contributionData[0].dayOfWeek : 0;

  const paddedData = [...Array(firstDay).fill(null), ...contributionData];

  return (
    <PageBg>
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px] lg:py-[70px]">
        {/* HERO */}
        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-10">
          <div>
            <p
              className={`text-[14px] uppercase tracking-wide ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Personal Analytics
            </p>

            <h1
              className="
                mt-4
                text-[46px]
                sm:text-[62px]
                lg:text-[82px]
                leading-[0.9]
                tracking-[-0.06em]
                font-medium
              "
            >
              Your coding
              <br />
              journey.
            </h1>

            <p
              className={`mt-8 max-w-[620px] text-[16px] leading-[1.8] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Track coding consistency, streaks, growth, rankings and
              achievements through interactive visualizations inspired by modern
              developer dashboards.
            </p>
          </div>

          {/* PROFILE CARD */}
          <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            className={`
              w-full
              xl:w-[360px]
              rounded-[36px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-8
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
            `}
          >
            <div className="flex items-center gap-5">
              <div className="w-[82px] h-[82px] rounded-full bg-[#0071e3] flex items-center justify-center text-white text-[32px] font-semibold">
                {(analytics?.name || user?.name || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-[30px] font-medium">
                  {analytics?.name || user?.name || "User"}
                </h3>

                <p
                  className={`text-[15px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"} mt-1`}
                >
                  Full Stack Developer
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div>
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Rank
                </p>
                <h3 className="text-[30px] mt-1">#{analytics?.rank || "-"}</h3>
              </div>

              <div>
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  XP
                </p>
                <h3 className="text-[30px] mt-1">
                  {analytics?.xp ?? user?.xp ?? 0}
                </h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-[70px]">
          {weeklyStats.map((item) => (
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              key={item.title}
              className={`
                rounded-[30px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-8
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <p
                className={`text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                {item.title}
              </p>
              <h2 className="mt-5 text-[46px] tracking-[-0.06em] font-medium">
                {item.value}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          {/* HEATMAP */}
          <motion.div
            whileHover={{ y: -4 }}
            className={`
              xl:col-span-8
              rounded-[38px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-8
              lg:p-10
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              overflow-hidden
            `}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p
                  className={`text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Consistency
                </p>
                <h2
                  className="
                    mt-3
                    text-[42px]
                    sm:text-[56px]
                    lg:text-[64px]
                    leading-[0.92]
                    tracking-[-0.06em]
                    font-medium
                  "
                >
                  Activity Heatmap
                </h2>
              </div>

              {/* FIX 3: Contributions badge uses solvedCount from analytics */}
              <div className="px-6 h-[52px] rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[16px] flex items-center font-medium w-fit">
                {analytics?.solvedCount ?? user?.solvedCount ?? 0} Contributions
              </div>
            </div>

            {/* HEATMAP GRID — chronological, weekday-aligned via paddedData */}
            <div className="mt-16">
              <div className="grid grid-cols-7 gap-[14px]">
                {paddedData.map((item, index) => {
                  if (!item) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="w-full aspect-square"
                      />
                    );
                  }

                  return (
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      key={item.date ?? index}
                      title={`Day ${item.day}: ${item.count} submissions`}
                      className={`
                        w-full
                        aspect-square
                        rounded-[14px]
                        cursor-pointer
                        transition-all
                        duration-300
                        ${
                          item.level === 0
                            ? "bg-[#ebedf0]"
                            : item.level === 1
                              ? "bg-[#b7d7ff]"
                              : item.level === 2
                                ? "bg-[#78b5ff]"
                                : item.level === 3
                                  ? "bg-[#3c8dff]"
                                  : "bg-[#0071e3]"
                        }
                      `}
                    />
                  );
                })}
              </div>
            </div>

            {/* LEGEND */}
            <div className="flex items-center justify-end gap-3 mt-12">
              <span
                className={`text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                Less
              </span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`
                    w-[20px]
                    h-[20px]
                    rounded-[6px]
                    ${
                      i === 0
                        ? "bg-[#ebedf0]"
                        : i === 1
                          ? "bg-[#b7d7ff]"
                          : i === 2
                            ? "bg-[#78b5ff]"
                            : i === 3
                              ? "bg-[#3c8dff]"
                              : "bg-[#0071e3]"
                    }
                  `}
                />
              ))}
              <span
                className={`text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                More
              </span>
            </div>
          </motion.div>

          {/* PIE CHART */}
          <motion.div
            whileHover={{ y: -4 }}
            className={`
              xl:col-span-4
              rounded-[38px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-10
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
            `}
          >
            <div>
              <p
                className={`text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                Problem Distribution
              </p>
              <h2
                className="
                  mt-3
                  text-[42px]
                  leading-[0.92]
                  tracking-[-0.06em]
                  font-medium
                "
              >
                Coding Split
              </h2>
            </div>

            {/* FIX 5: Pie uses analytics?.pieData directly, dataKey="count" for real counts */}
            <div className="h-[320px] mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.pieData || pieData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={6}
                  >
                    <Cell fill="#0071e3" />
                    <Cell fill="#5aa2ff" />
                    <Cell fill="#b7d7ff" />
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} quest${value !== 1 ? "s" : ""}`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* FIX 6: Labels read from pieData array — not projectBuilt/contestRating */}
            <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-[14px] h-[14px] rounded-full bg-[#0071e3]" />
                <span
                  className={`text-[14px] ${dark ? "text-[#aaa]" : "text-[#555]"}`}
                >
                  Easy — {pieData[0]?.value ?? 0}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-[14px] h-[14px] rounded-full bg-[#5aa2ff]" />
                <span
                  className={`text-[14px] ${dark ? "text-[#aaa]" : "text-[#555]"}`}
                >
                  Medium — {pieData[1]?.value ?? 0}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-[14px] h-[14px] rounded-full bg-[#b7d7ff]" />
                <span
                  className={`text-[14px] ${dark ? "text-[#aaa]" : "text-[#555]"}`}
                >
                  Hard — {pieData[2]?.value ?? 0}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageBg>
  );
}

function LeaderboardPage() {
  const { dark } = useTheme();
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.leaderboard.get();
        setLeaderboardData(data);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const podium = [
    leaderboardData[0] || { rank: 1, name: "Empty", xp: 0 },
    leaderboardData[1] || { rank: 2, name: "Empty", xp: 0 },
    leaderboardData[2] || { rank: 3, name: "Empty", xp: 0 },
  ];
  const others = leaderboardData.slice(3);

  const myRankInfo = leaderboardData.find((s) => s._id === user?._id) || {
    rank: "-",
    xp: user?.xp ?? 0,
    streak: user?.streak ?? 0,
  };

  return (
    <PageBg className="overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px] lg:py-[70px]">
        {/* HERO */}
        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-10">
          <div className="w-full">
            <p
              className={`text-[12px] sm:text-[14px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Competitive Rankings
            </p>

            <h1
              className="
                mt-4
                text-[42px]
                sm:text-[56px]
                lg:text-[72px]
                leading-[0.88]
                tracking-[-0.07em]
                font-medium
              "
            >
              Club
              <br />
              Leaderboard.
            </h1>

            <p
              className={`
                mt-6
                max-w-[720px]
                text-[15px]
                sm:text-[17px]
                leading-[1.8]
                ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
              `}
            >
              Compete with the brightest coders in the Coding & Innovation Club
              through contests, hackathons, projects and daily coding streaks.
            </p>
          </div>

          {/* USER CARD */}
          <motion.div
            whileHover={{
              y: -6,
              scale: 1.01,
            }}
            className={`
              w-full
              xl:w-[380px]
              rounded-[32px]
              sm:rounded-[40px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-6
              sm:p-8
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
            `}
          >
            <p
              className={`text-[13px] sm:text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Your Position
            </p>

            <h2
              className="
                mt-4
                text-[52px]
                sm:text-[64px]
                leading-none
                tracking-[-0.08em]
                font-medium
              "
            >
              #{myRankInfo.rank}
            </h2>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  XP
                </p>

                <h3 className="text-[22px] sm:text-[26px] mt-1 font-medium">
                  {myRankInfo.xp}
                </h3>
              </div>

              <div>
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Streak
                </p>

                <h3 className="text-[22px] sm:text-[26px] mt-1 font-medium">
                  {myRankInfo.streak} Days
                </h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* PODIUM */}
        <div
          className="
            mt-16
            lg:mt-24
            flex
            flex-col
            lg:flex-row
            items-stretch
            lg:items-end
            justify-center
            gap-6
          "
        >
          {/* SECOND */}
          <motion.div
            whileHover={{ y: -8 }}
            className="
              order-2
              lg:order-1
              w-full
              lg:w-[300px]
            "
          >
            <div
              className={`${dark ? "bg-[#1e1e1e]" : "bg-white"} rounded-[32px] lg:rounded-[40px] border ${dark ? "border-white/10" : "border-black/5"} p-6 sm:p-8 ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"} text-center h-full`}
            >
              <div
                className={`w-[82px] h-[82px] rounded-full ${dark ? "bg-[#2a2a2a]" : "bg-[#d9d9d9]"} mx-auto flex items-center justify-center text-[30px] font-semibold`}
              >
                2
              </div>

              <h3 className="mt-6 text-[24px] sm:text-[28px] leading-[1] tracking-[-0.05em] font-medium">
                {podium[1].name}
              </h3>

              <p
                className={`mt-3 text-[15px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                {podium[1].xp} XP
              </p>

              <div
                className={`mt-8 h-[160px] sm:h-[190px] rounded-[24px] bg-[#d9d9d9]/40 flex items-center justify-center text-[44px] font-semibold ${dark ? "text-[#bbb]" : "text-[#444]"}`}
              >
                #2
              </div>
            </div>
          </motion.div>

          {/* FIRST */}
          <motion.div
            whileHover={{ y: -10 }}
            className="
              order-1
              lg:order-2
              w-full
              lg:w-[360px]
            "
          >
            <div className="bg-[#0071e3] rounded-[36px] lg:rounded-[46px] p-8 sm:p-10 shadow-xl text-center text-white">
              <div className="w-[100px] h-[100px] rounded-full bg-white/20 mx-auto flex items-center justify-center text-[40px] font-semibold">
                1
              </div>

              <h3 className="mt-7 text-[28px] sm:text-[34px] leading-[0.92] tracking-[-0.06em] font-medium">
                {podium[0].name}
              </h3>

              <p className="mt-4 text-[17px] text-white/80">
                {podium[0].xp} XP
              </p>

              <div className="mt-10 h-[220px] sm:h-[260px] rounded-[28px] bg-white/10 flex items-center justify-center text-[72px] sm:text-[84px] font-semibold">
                👑
              </div>
            </div>
          </motion.div>

          {/* THIRD */}
          <motion.div
            whileHover={{ y: -8 }}
            className="
              order-3
              w-full
              lg:w-[300px]
            "
          >
            <div
              className={`${dark ? "bg-[#1e1e1e]" : "bg-white"} rounded-[32px] lg:rounded-[40px] border ${dark ? "border-white/10" : "border-black/5"} p-6 sm:p-8 ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"} text-center h-full`}
            >
              <div className="w-[82px] h-[82px] rounded-full bg-[#d7a56c] mx-auto flex items-center justify-center text-[30px] font-semibold text-white">
                3
              </div>

              <h3 className="mt-6 text-[24px] sm:text-[28px] leading-[1] tracking-[-0.05em] font-medium">
                {podium[2].name}
              </h3>

              <p
                className={`mt-3 text-[15px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                {podium[2].xp} XP
              </p>

              <div className="mt-8 h-[140px] sm:h-[170px] rounded-[24px] bg-[#d7a56c]/20 flex items-center justify-center text-[44px] font-semibold text-[#8b5a2b]">
                #3
              </div>
            </div>
          </motion.div>
        </div>

        {/* LEADERBOARD TABLE */}
        <div
          className={`
            mt-16
            lg:mt-24
            rounded-[30px]
            lg:rounded-[42px]
            ${dark ? "bg-[#1e1e1e]" : "bg-white"}
            border
            ${dark ? "border-white/10" : "border-black/5"}
            ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
            overflow-hidden
          `}
        >
          {/* HEADER */}
          <div
            className={`
              hidden
              md:grid
              grid-cols-12
              px-6
              lg:px-10
              py-6
              border-b
              ${dark ? "border-white/10" : "border-black/5"}
              text-[13px]
              font-medium
              ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
            `}
          >
            <div className="col-span-2">Rank</div>
            <div className="col-span-7">Student</div>
            <div className="col-span-3 text-right">XP</div>
          </div>

          {/* ROWS */}
          <div>
            {others.map((student) => (
              <motion.div
                whileHover={{
                  backgroundColor: "rgba(0,113,227,0.04)",
                }}
                key={student.rank}
                className={`
                  grid
                  grid-cols-1
                  md:grid-cols-12
                  gap-5
                  md:gap-0
                  items-center
                  px-6
                  lg:px-10
                  py-6
                  lg:py-7
                  border-b
                  ${dark ? "border-white/10" : "border-black/5"}
                  transition-all
                  duration-300
                  ${student.name === "Ishaan Nandoskar" ? "bg-[#0071e3]/5" : ""}
                `}
              >
                {/* RANK */}
                <div className="md:col-span-2">
                  <div className="text-[18px] sm:text-[22px] font-medium tracking-[-0.04em]">
                    #{student.rank}
                  </div>
                </div>

                {/* USER */}
                <div className="md:col-span-7 flex items-center gap-4 sm:gap-5">
                  <div
                    className={`
                      w-[52px]
                      h-[52px]
                      sm:w-[60px]
                      sm:h-[60px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-white
                      text-[20px]
                      font-semibold
                      shrink-0
                      ${
                        student.name === "Ishaan Nandoskar"
                          ? "bg-[#0071e3]"
                          : "bg-[#0f1012]"
                      }
                    `}
                  >
                    {student.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="
                        text-[18px]
                        sm:text-[22px]
                        leading-none
                        tracking-[-0.04em]
                        font-medium
                        truncate
                      "
                    >
                      {student.name}
                    </h3>

                    <p
                      className={`mt-2 text-[13px] sm:text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                    >
                      Coding & Innovation Club
                    </p>
                  </div>
                </div>

                {/* XP */}
                <div className="md:col-span-3 md:text-right">
                  <span className="text-[22px] sm:text-[26px] tracking-[-0.05em] font-medium">
                    {student.xp}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageBg>
  );
}

function DailyQuestPage() {
  const { dark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const [dailyQuest, setDailyQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [xpInfo, setXpInfo] = useState(null);
  const [openHints, setOpenHints] = useState({});
  const [code, setCode] = useState("");
  const [templates, setTemplates] = useState({});
  const [runtimes, setRuntimes] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDailyQuest = async () => {
      try {
        setLoading(true);
        const data = await api.quests.getDaily();
        setDailyQuest(data);
        try {
          const templateData = await api.compiler.getTemplates(data._id);
          setTemplates(templateData);
          setCode(
            templateData[selectedLanguage] || templateData["Python"] || "",
          );
        } catch (err) {
          console.error("Template fetch failed", err);
        }
      } catch (err) {
        console.error("Error fetching daily quest:", err);
        setCode("");
      } finally {
        setLoading(false);
      }
    };

    const fetchRuntimes = async () => {
      try {
        const data = await api.compiler.getRuntimes();
        setRuntimes(data);
      } catch (_) {
        // non-critical
      }
    };

    fetchDailyQuest();
    fetchRuntimes();
  }, []);

  const [languageCode, setLanguageCode] = useState({});

  const handleLanguageChange = (lang) => {
    setLanguageCode((prev) => ({ ...prev, [selectedLanguage]: code }));
    const nextCode = languageCode[lang] || templates[lang] || "";
    setSelectedLanguage(lang);
    setCode(nextCode);
    setResults([]);
    setXpInfo(null);
  };

  const languages = ["Python", "C", "Java", "C++"];

  const dailyQuestData = dailyQuest || {
    title: "Daily Quest",
    difficulty: "Medium",
    statement: "Load your daily coding challenge.",
    tags: [],
    hints: [],
    testcases: [],
    examples: [],
  };

  const runCode = async () => {
    const codeToExecute = code.trim();
    if (!codeToExecute) {
      alert("Please write some code first!");
      return;
    }
    setRunning(true);
    setResults([]);
    setXpInfo(null);
    setSubmitted(false);
    try {
      const publicTestcases = dailyQuestData?.testcases || [];
      const questId = dailyQuestData?._id;
      const result = await api.compiler.execute(
        selectedLanguage,
        codeToExecute,
        publicTestcases,
        questId,
      );
      const mapped = (result.results || []).map((r, idx) => ({
        id: idx + 1,
        input: r.input,
        expectedOutput: r.expectedOutput,
        actualOutput: r.actualOutput,
        passed: r.passed,
        error: r.error,
        executionTime: r.executionTime,
        explanation: r.explanation,
      }));
      setResults(mapped);
      const passedCount = mapped.filter((r) => r.passed).length;
      setXpInfo({
        xp: result.xpAwarded ?? 0,
        rank: result.runtimeRank ?? null,
        allPassed: result.allTestsPassed ?? result.success,
        passedCount,
        total: mapped.length,
        averageTime: result.averageTime,
      });
    } catch (err) {
      console.error("Code execution error:", err);
      setResults([
        {
          id: 1,
          input: "(error)",
          expectedOutput: "",
          actualOutput: "",
          passed: false,
          error: err.message || "Execution failed.",
          executionTime: 0,
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!dailyQuestData?._id || submitting || submitted) return;
    setSubmitting(true);
    try {
      await api.submissions.submit(dailyQuestData._id, {
        code,
        language: selectedLanguage,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert(
        err?.response?.data?.message || "Submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHint = (idx) =>
    setOpenHints((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const xpRankColor = (rank) => {
    if (rank == null) return "#8f8f8f";
    if (rank === 1) return "#ffd700";
    if (rank === 2) return "#c0c0c0";
    if (rank === 3) return "#cd7f32";
    if (rank <= 5) return "#0071e3";
    return "#8f8f8f";
  };

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[40px] lg:py-[60px]">
        {/* HERO */}
        <div className="mb-10">
          <p
            className={`text-[12px] sm:text-[14px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Daily Challenge
          </p>
          <h1 className="mt-4 text-[42px] sm:text-[56px] lg:text-[72px] leading-[0.9] tracking-[-0.06em] font-medium">
            Daily Quest.
          </h1>
          <p
            className={`mt-5 max-w-[760px] text-[15px] sm:text-[17px] leading-[1.8] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Solve today's featured coding challenge. The faster your solution,
            the more XP you earn — up to 25 XP for runtime rank.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* LEFT: Problem statement */}
          <motion.div
            whileHover={{ y: -4 }}
            className={`xl:col-span-5 rounded-[34px] border p-6 sm:p-8 ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"} ${dark ? "bg-[#1e1e1e] border-white/10" : "bg-white border-black/5"}`}
          >
            {loading ? (
              <div
                className={`flex items-center justify-center h-40 ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                Loading quest…
              </div>
            ) : (
              <>
                {/* Tags / difficulty */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 h-[34px] rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[13px] flex items-center font-medium">
                    {dailyQuestData?.difficulty || "Medium"}
                  </span>
                  {(dailyQuestData?.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={`px-4 h-[34px] rounded-full text-[13px] flex items-center font-medium ${dark ? "bg-white/10 text-white/80" : "bg-black/[0.04] text-[#333]"}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="mt-6 text-[34px] sm:text-[42px] leading-[1] tracking-[-0.05em] font-medium">
                  {dailyQuestData?.title || "Quest"}
                </h2>

                {/* Statement */}
                <div className="mt-8">
                  <p
                    className={`text-[15px] leading-[1.9] ${dark ? "text-[#aaa]" : "text-[#5f5f5f]"}`}
                  >
                    {dailyQuestData?.statement ||
                      dailyQuestData?.description ||
                      "No description available."}
                  </p>
                </div>

                {/* Examples */}
                {(dailyQuestData?.examples || []).length > 0 && (
                  <div className="mt-8 flex flex-col gap-4">
                    {dailyQuestData.examples.map((ex, i) => (
                      <div
                        key={i}
                        className={`rounded-[18px] p-5 ${dark ? "bg-[#2a2a2a]" : "bg-[#f8f8f8]"}`}
                      >
                        <p className="font-medium text-[14px]">
                          Example {i + 1}
                        </p>
                        <p
                          className={`mt-2 text-[13px] leading-[1.8] font-mono ${dark ? "text-[#bbb]" : "text-[#555]"}`}
                        >
                          {ex}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Test case preview */}
                {(dailyQuestData?.testcases || []).length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-[16px] font-medium mb-4">
                      Sample Test Cases
                    </h3>
                    <div className="flex flex-col gap-3">
                      {dailyQuestData.testcases.slice(0, 2).map((tc, i) => (
                        <div
                          key={i}
                          className={`rounded-[16px] p-4 ${dark ? "bg-[#2a2a2a]" : "bg-[#f5f5f7]"}`}
                        >
                          <p
                            className={`text-[12px] font-mono leading-[1.8] ${dark ? "text-[#bbb]" : "text-[#444]"}`}
                          >
                            <span
                              className={`font-semibold ${dark ? "text-white" : "text-black"}`}
                            >
                              Input:{" "}
                            </span>
                            {tc.input}
                          </p>
                          <p
                            className={`text-[12px] font-mono leading-[1.8] ${dark ? "text-[#bbb]" : "text-[#444]"}`}
                          >
                            <span
                              className={`font-semibold ${dark ? "text-white" : "text-black"}`}
                            >
                              Expected:{" "}
                            </span>
                            {tc.expectedOutput}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {(dailyQuestData?.hints || []).length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-[22px] tracking-[-0.04em] font-medium">
                      Hints
                    </h3>
                    <div className="mt-5 flex flex-col gap-3">
                      {dailyQuestData.hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className={`rounded-[18px] border overflow-hidden ${dark ? "border-white/10" : "border-black/5"}`}
                        >
                          <button
                            onClick={() => toggleHint(idx)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left"
                          >
                            <span className="font-medium">Hint {idx + 1}</span>
                            <span className="text-[18px] leading-none">
                              {openHints[idx] ? "−" : "+"}
                            </span>
                          </button>
                          {openHints[idx] && (
                            <div
                              className={`px-5 pb-5 text-[14px] leading-[1.8] ${dark ? "text-[#aaa]" : "text-[#666]"}`}
                            >
                              {hint}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* XP Scale info */}
                <div
                  className={`mt-10 rounded-[20px] p-5 ${dark ? "bg-[#2a2a2a]" : "bg-[#f5f5f7]"}`}
                >
                  <p className="text-[13px] font-medium mb-3 text-[#0071e3]">
                    ⚡ XP Rewards by Runtime Rank
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "#1 Runtime Rank", xp: 25, color: "#ffd700" },
                      { label: "#2 Runtime Rank", xp: 18, color: "#c0c0c0" },
                      { label: "#3 Runtime Rank", xp: 15, color: "#cd7f32" },
                      { label: "#4 Runtime Rank", xp: 12, color: "#0071e3" },
                      { label: "#5 Runtime Rank", xp: 10, color: "#0071e3" },
                      { label: "#6 Runtime Rank", xp: 8, color: "#8f8f8f" },
                      { label: "#7 Runtime Rank", xp: 6, color: "#8f8f8f" },
                      { label: "#8 Runtime Rank", xp: 4, color: "#8f8f8f" },
                      { label: "#9 Runtime Rank", xp: 2, color: "#8f8f8f" },
                      { label: "#10 Runtime Rank", xp: 1, color: "#8f8f8f" },
                    ].map((tier) => (
                      <div
                        key={tier.label}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`text-[12px] ${dark ? "text-[#bbb]" : "text-[#555]"}`}
                        >
                          {tier.label}
                        </span>
                        <span
                          className="text-[12px] font-bold"
                          style={{ color: tier.color }}
                        >
                          +{tier.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* RIGHT: Code editor + results */}
          <motion.div
            whileHover={{ y: -4 }}
            className="xl:col-span-7 rounded-[34px] bg-[#0f1012] border border-white/5 overflow-hidden shadow-xl flex flex-col"
          >
            {/* Top bar */}
            <div className="h-[72px] px-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                {languages.map((lang) => {
                  const available =
                    Object.keys(runtimes).length === 0 ||
                    runtimes[lang] !== false;
                  return (
                    <button
                      key={lang}
                      onClick={() => available && handleLanguageChange(lang)}
                      title={
                        available
                          ? lang
                          : `${lang} runtime is not installed on the server`
                      }
                      className={`relative px-4 h-[36px] rounded-[10px] text-[13px] transition-all duration-200
                        ${
                          selectedLanguage === lang
                            ? "bg-[#0071e3] text-white"
                            : available
                              ? "bg-white/5 text-white/70 hover:bg-white/10"
                              : "bg-white/[0.03] text-white/25 cursor-not-allowed"
                        }`}
                    >
                      {lang}
                      {!available && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3">
                <button
                  onClick={runCode}
                  disabled={running}
                  className="px-5 h-[40px] rounded-[10px] bg-[#0071e3] text-white text-[14px] font-medium hover:scale-[1.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {running ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Running…
                    </>
                  ) : (
                    "▶  Run Code"
                  )}
                </button>

                {/* Submit button — only shown when all tests pass */}
                {xpInfo?.allPassed && (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || submitted}
                    className={`px-5 h-[40px] rounded-[10px] text-white text-[14px] font-medium transition-all flex items-center gap-2
                      ${
                        submitted
                          ? "bg-green-700 opacity-80 cursor-default"
                          : submitting
                            ? "bg-green-800 opacity-60 cursor-not-allowed"
                            : "bg-green-600 hover:scale-[1.03]"
                      }`}
                  >
                    {submitted ? (
                      "✓ Submitted!"
                    ) : submitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "✓ Submit"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Code editor */}
            <div className="p-6 flex-1">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                placeholder={`// Write your ${selectedLanguage} solution here…`}
                className="w-full h-[380px] bg-transparent text-[#f5f5f5] resize-none outline-none font-mono text-[14px] leading-[1.8] placeholder-white/20"
              />
            </div>

            {/* XP summary banner */}
            {xpInfo && (
              <div className="px-6 pb-4">
                <div
                  className="rounded-[18px] px-5 py-4 flex flex-wrap items-center justify-between gap-3"
                  style={{
                    background: xpInfo.allPassed
                      ? "linear-gradient(135deg, #0d2b16 0%, #0f1f10 100%)"
                      : "linear-gradient(135deg, #2b0d0d 0%, #1f0f0f 100%)",
                    border: `1px solid ${xpInfo.allPassed ? "#1d6b37" : "#6b1d1d"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[22px]">
                      {xpInfo.allPassed ? "🎉" : "⚠️"}
                    </span>
                    <div>
                      <p className="text-white font-semibold text-[15px]">
                        {xpInfo.allPassed
                          ? `All ${xpInfo.total} tests passed!`
                          : `${xpInfo.passedCount} / ${xpInfo.total} tests passed`}
                      </p>
                      <p className="text-white/60 text-[12px] mt-0.5">
                        Runtime Rank:{" "}
                        <span
                          className="font-semibold"
                          style={{ color: xpRankColor(xpInfo.rank) }}
                        >
                          #{xpInfo.rank ?? "—"}
                        </span>
                        {typeof xpInfo.averageTime === "number" && (
                          <span className="ml-2 text-white/40">
                            (avg {xpInfo.averageTime.toFixed(1)} ms)
                          </span>
                        )}
                      </p>
                      {/* Submission nudge */}
                      {xpInfo.allPassed && !submitted && (
                        <p className="text-green-400/80 text-[12px] mt-1">
                          All tests passed — hit Submit to save to your profile.
                        </p>
                      )}
                      {submitted && (
                        <p className="text-green-400 text-[12px] mt-1">
                          ✓ Solution submitted and saved to your profile.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[28px] font-bold leading-none"
                      style={{ color: xpRankColor(xpInfo.rank) }}
                    >
                      +{xpInfo.xp} XP
                    </p>
                    <p className="text-white/40 text-[11px] mt-1">
                      awarded to your profile
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Test results */}
            <div className="border-t border-white/10 p-6">
              <h3 className="text-[18px] text-white font-medium mb-5">
                Test Results
                {results.length > 0 && (
                  <span className="ml-3 text-[13px] font-normal text-white/50">
                    {results.filter((r) => r.passed).length}/{results.length}{" "}
                    passed
                  </span>
                )}
              </h3>

              {results.length === 0 && !running && (
                <p className="text-white/30 text-[14px]">
                  Run your code to see test results here.
                </p>
              )}

              <div className="flex flex-col gap-4">
                {results.map((test) => (
                  <div
                    key={test.id}
                    className={`rounded-[18px] p-5 border ${test.passed ? "bg-[#0d2b16] border-[#1d6b37]" : "bg-[#2b0d0d] border-[#6b1d1d]"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[15px] font-medium text-white">
                        Test Case {test.id}
                      </h4>
                      <div className="flex items-center gap-3">
                        {test.executionTime != null && (
                          <span className="text-[11px] text-white/40">
                            {test.executionTime.toFixed(1)} ms
                          </span>
                        )}
                        <span
                          className={`text-[13px] font-semibold ${test.passed ? "text-[#7dffab]" : "text-[#ff8d8d]"}`}
                        >
                          {test.passed ? "✓ Passed" : "✗ Failed"}
                        </span>
                      </div>
                    </div>
                    <div className="text-[13px] leading-[1.9] text-white/70 font-mono space-y-2">
                      <p>
                        <span className="text-white/90 font-semibold">
                          Input:{" "}
                        </span>
                        {test.input}
                      </p>
                      <p>
                        <span className="text-white/90 font-semibold">
                          Expected:{" "}
                        </span>
                        <span className="text-[#7dffab]">
                          {test.expectedOutput}
                        </span>
                      </p>
                      {test.actualOutput !== undefined &&
                        test.actualOutput !== "" && (
                          <p>
                            <span className="text-white/90 font-semibold">
                              Your Output:{" "}
                            </span>
                            <span
                              className={
                                test.passed
                                  ? "text-[#7dffab]"
                                  : "text-[#ff8d8d]"
                              }
                            >
                              {test.actualOutput || "(empty)"}
                            </span>
                          </p>
                        )}
                      {test.error && (
                        <p className="text-[#ff8d8d] whitespace-pre-wrap">
                          <span className="font-semibold">Error: </span>
                          {test.error}
                        </p>
                      )}
                      {test.explanation && (
                        <p className="text-white/40 italic text-[12px] pt-1">
                          {test.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageBg>
  );
}
function AnnouncementsPage() {
  const { dark } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await api.announcements.getAll();
        setAnnouncements(data);
        if (data.length > 0 && !selectedAnnouncement) {
          setSelectedAnnouncement(data[0]);
        }
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Set up auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchAnnouncements, 10000);

    return () => clearInterval(interval);
  }, []);

  const defaultImages = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?q=80&w=1200&auto=format&fit=crop",
  ];

  const featuredNews =
    announcements.length > 0
      ? announcements.slice(0, 3).map((ann, idx) => ({
          category: ann.category || "ANNOUNCEMENT",
          title: ann.title || "Untitled",
          description: ann.content || "",
          image: defaultImages[idx % defaultImages.length],
        }))
      : [
          {
            category: "TECH",
            title: "No announcements yet",
            description: "Check back soon for updates",
            image: defaultImages[0],
          },
          {
            category: "HACKATHON",
            title: "Stay tuned for updates",
            image: defaultImages[1],
          },
          {
            category: "EVENTS",
            title: "More announcements coming soon",
            image: defaultImages[2],
          },
        ];

  return (
    <div
      className={`min-h-screen ${dark ? "bg-[#2a2a2a]" : "bg-[#f3f0ea]"} ${dark ? "text-[#ededed]" : "text-[#111]"} font-serif px-3 py-3`}
    >
      <div
        className={`
          max-w-[1750px]
          mx-auto
          ${dark ? "bg-[#2a2a2a]" : "bg-[#f7f4ee]"}
          rounded-[34px]
          border
          ${dark ? "border-white/10" : "border-black/10"}
          overflow-hidden
          shadow-[0_20px_70px_rgba(0,0,0,0.08)]
        `}
      >
        {/* TOP NAV */}

        {/* HEADER */}
        {/* HEADER */}
        <div
          className={`px-6 lg:px-10 py-10 border-b ${dark ? "border-white/15" : "border-black/15"}`}
        >
          <div className="flex items-center justify-center">
            <h1
              className="
        text-center
        whitespace-nowrap
        text-[38px]
        sm:text-[56px]
        md:text-[74px]
        lg:text-[110px]
        leading-none
        tracking-[-0.08em]
      "
            >
              THE&nbsp;COMPILE &nbsp;TIMES
            </h1>
          </div>
        </div>

        {/* CATEGORY NAV */}
        <div
          className={`px-6 lg:px-10 py-4 border-b ${dark ? "border-white/15" : "border-black/15"}`}
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-4
              lg:gap-7
              text-[13px]
              uppercase
              tracking-wide
            "
          >
            {[
              "Hackathons",
              "Case Study",
              "Beyond The Classroom",
              "Datathons",
              "Research Presentation",
            ].map((item) => (
              <button key={item} className="hover:opacity-60 transition-all">
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-0">
          {/* LEFT FEATURE */}
          <div
            className={`xl:col-span-6 p-6 lg:p-10 border-b xl:border-b-0 xl:border-r ${dark ? "border-white/10" : "border-black/10"}`}
          >
            <p className="text-[12px] uppercase tracking-wide">
              {selectedAnnouncement?.category || "Technology"}
            </p>

            <h2
              className="
                mt-5
                text-[36px]
                lg:text-[52px]
                leading-[1]
                tracking-[-0.05em]
              "
            >
              {selectedAnnouncement?.title ||
                "Why student-led innovation labs are becoming the future of engineering culture."}
            </h2>

            <p
              className={`mt-6 text-[18px] leading-[1.8] ${dark ? "text-[#bbb]" : "text-[#444]"}`}
            >
              {selectedAnnouncement?.content ||
                "As innovation ecosystems evolve inside universities, coding clubs and startup cells are redefining how future developers learn, collaborate and build impactful products."}
            </p>

            <div
              className={`mt-8 text-[13px] uppercase tracking-wide ${dark ? "text-[#aaa]" : "text-[#666]"}`}
            >
              {selectedAnnouncement?.readTime || "11 Min"} Read
            </div>

            <div className="mt-8 overflow-hidden">
              <img
                src={selectedAnnouncement?.image || defaultImages[0]}
                alt=""
                className="
                  w-full
                  h-[320px]
                  lg:h-[520px]
                  object-cover
                "
              />
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div
            className={`xl:col-span-3 border-b xl:border-b-0 xl:border-r ${dark ? "border-white/10" : "border-black/10"}`}
          >
            {/* ARTICLE 1 */}
            <div
              onClick={() =>
                announcements.length > 1 &&
                setSelectedAnnouncement(announcements[1])
              }
              className={`p-6 lg:p-8 border-b ${dark ? "border-white/10" : "border-black/10"} cursor-pointer ${dark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.02]"} transition-colors`}
            >
              <img
                src={announcements[1]?.image || defaultImages[1]}
                alt=""
                className="
                  w-full
                  h-[240px]
                  object-cover
                "
              />

              <p className="mt-6 text-[12px] uppercase tracking-wide">
                {announcements[1]?.category || "ANNOUNCEMENT"}
              </p>

              <h3
                className="
                  mt-4
                  text-[28px]
                  leading-[1.1]
                  tracking-[-0.04em]
                "
              >
                {announcements[1]?.title || "Stay tuned for updates"}
              </h3>

              <p
                className={`mt-5 text-[12px] uppercase tracking-wide ${dark ? "text-[#aaa]" : "text-[#666]"}`}
              >
                4 Min Read
              </p>
            </div>

            {/* ARTICLE 2 */}
            <div
              onClick={() =>
                announcements.length > 2 &&
                setSelectedAnnouncement(announcements[2])
              }
              className={`p-6 lg:p-8 cursor-pointer ${dark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.02]"} transition-colors`}
            >
              <img
                src={announcements[2]?.image || defaultImages[2]}
                alt=""
                className="
                  w-full
                  h-[240px]
                  object-cover
                "
              />

              <p className="mt-6 text-[12px] uppercase tracking-wide">
                {announcements[2]?.category || "ANNOUNCEMENT"}
              </p>

              <h3
                className="
                  mt-4
                  text-[28px]
                  leading-[1.1]
                  tracking-[-0.04em]
                "
              >
                {announcements[2]?.title || "More announcements coming soon"}
              </h3>

              <p
                className={`mt-5 text-[12px] uppercase tracking-wide ${dark ? "text-[#aaa]" : "text-[#666]"}`}
              >
                6 Min Read
              </p>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="xl:col-span-3 bg-[#1a1a1a] text-white p-6 lg:p-8">
            {/* RADIO */}
            <div className="border border-white/10 p-5">
              <p className="text-[12px] uppercase tracking-wide text-white/60">
                Compile Radio
              </p>

              <div className="mt-5 bg-black p-5">
                <p className="text-[12px] uppercase tracking-wide text-[#f0c400]">
                  On Air
                </p>

                <h3 className="mt-3 text-[24px] leading-[1.1]">Global Music</h3>

                <button
                  className={`
                    mt-6
                    w-full
                    h-[48px]
                    bg-[#f0c400]
                    ${dark ? "text-[#ededed]" : "text-black"}
                    text-[13px]
                    font-bold
                    uppercase
                  `}
                >
                  ▶ Listen Live
                </button>
              </div>
            </div>

            {/* SMALL CARDS */}
            <div className="mt-8 space-y-4">
              {[
                {
                  title: "Top of the Hour",
                  subtitle: "Headlines as they happen",
                },
                {
                  title: "Meet the Writers",
                  subtitle: "Interviews with innovators and creators",
                },
                {
                  title: "Hackathon Weekly",
                  subtitle: "Inside the latest student competitions",
                },
              ].map((item) => (
                <div key={item.title} className="border border-white/10 p-5">
                  <h3 className="text-[20px] leading-[1.1]">{item.title}</h3>

                  <p className="mt-3 text-[14px] leading-[1.7] text-white/60">
                    {item.subtitle}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              className={`
                mt-8
                w-full
                h-[54px]
                border
                border-white/20
                text-[13px]
                uppercase
                tracking-wide
                ${dark ? "hover:bg-white/10" : "hover:bg-white"}
                hover:text-black
                transition-all
              `}
            >
              View Full Programme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarPage() {
  const { dark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("All");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    "All",
    "Hackathons",
    "Workshops",
    "Competitions",
    "Meetings",
  ];
  const currentDate = new Date();
  const currentMonthShort = new Date().toLocaleString("default", {
    month: "short",
  });
  const currentMonth = currentDate.toLocaleString("default", {
    month: "long",
  });

  const currentYear = currentDate.getFullYear();

  // Total events for the current month
  const totalEvents = calendarEvents.length;

  // Total registrations from API
  // Assumes each event has a registrations field
  const totalRegistrations = calendarEvents.reduce(
    (sum, event) => sum + (event.registrations || 0),
    0,
  );
  // Color mapping for event types
  const getEventColor = (type) => {
    const colorMap = {
      Hackathon: "bg-[#0071e3]",
      Workshop: "bg-[#7b61ff]",
      Competition: "bg-[#ff9f0a]",
      Meeting: "bg-[#111111]",
      hackathon: "bg-[#0071e3]",
      workshop: "bg-[#7b61ff]",
      competition: "bg-[#ff9f0a]",
      meeting: "bg-[#111111]",
    };
    return colorMap[type] || "bg-[#0071e3]";
  };

  // Fetch events from MongoDB on mount and set up auto-refresh
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await api.events.getAll();
        // Map API data to calendar format with color
        const formattedEvents = data.map((event) => ({
          day: event.day,
          title: event.title,
          type: event.type,
          color: event.color || getEventColor(event.type),
          registrations:
            event.registrationCount ??
            (Array.isArray(event.registrations)
              ? event.registrations.length
              : 0),
          _id: event._id,
          link: event.link,
        }));
        setCalendarEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        // Fallback to empty array instead of hardcoded data
        setCalendarEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Set up auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchEvents, 10000);

    return () => clearInterval(interval);
  }, []);

  // Get upcoming events (first 4 sorted by day)
  const upcomingEvents = calendarEvents
    .slice()
    .sort((a, b) => a.day - b.day)
    .slice(0, 4)
    .map((event) => ({
      ...event,
      date: `${currentMonthShort} ${event.day}`,
    }));

  const filteredEvents =
    activeFilter === "All"
      ? calendarEvents
      : calendarEvents.filter(
          (event) =>
            event.type === activeFilter.slice(0, -1) ||
            event.type === activeFilter.slice(0, -1).toLowerCase(),
        );

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[40px] lg:py-[55px]">
        {/* HERO */}
        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-10">
          <div>
            <p
              className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Club Activities
            </p>

            <h1
              className="
                mt-4
                text-[48px]
                sm:text-[68px]
                lg:text-[92px]
                leading-[0.88]
                tracking-[-0.08em]
                font-medium
              "
            >
              Calendar.
            </h1>

            <p
              className={`
                mt-6
                max-w-[760px]
                text-[15px]
                sm:text-[17px]
                leading-[1.8]
                ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
              `}
            >
              Track upcoming hackathons, workshops, coding competitions and
              community events happening across the Coding & Innovation Club.
            </p>
          </div>

          {/* QUICK STATS */}
          <motion.div
            whileHover={{
              y: -5,
              scale: 1.01,
            }}
            className={`
              w-full
              xl:w-[360px]
              rounded-[36px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-8
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
            `}
          >
            <p
              className={`text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              This Month
            </p>

            <div
              className={`mt-8 flex items-center justify-between ${dark ? "bg-[#1e1e1e]" : "bg-white"}`}
            >
              <div>
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Events
                </p>

                <h3 className="text-[36px] mt-1">{totalEvents}</h3>
              </div>

              <div>
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Registrations
                </p>

                <h3 className="text-[36px] mt-1">{totalRegistrations}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FILTERS */}
        <div className="mt-14 flex justify-center">
          <div
            className={`
              inline-flex
              items-center
              justify-center
              gap-3
              rounded-[28px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-3
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              overflow-x-auto
              max-w-full
            `}
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-7
                  h-[52px]
                  rounded-[18px]
                  text-[14px]
                  sm:text-[15px]
                  tracking-[-0.03em]
                  font-medium
                  whitespace-nowrap
                  transition-all
                  duration-300
                  ${
                    activeFilter === filter
                      ? "bg-[#0071e3] text-white shadow-lg"
                      : "text-[#555] hover:bg-black/[0.04]"
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mt-12">
          {/* LEFT SIDEBAR */}
          <div className="xl:col-span-3 space-y-5">
            {/* UPCOMING EVENTS */}
            <motion.div
              whileHover={{ y: -3 }}
              className={`
                rounded-[28px]
                ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                border
                ${dark ? "border-white/10" : "border-black/5"}
                p-6
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-[11px] uppercase tracking-[0.16em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                  >
                    Upcoming
                  </p>

                  <h2
                    className="
                      mt-2
                      text-[28px]
                      leading-[0.95]
                      tracking-[-0.05em]
                      font-medium
                    "
                  >
                    Events
                  </h2>
                </div>

                <button
                  className="
                    w-[38px]
                    h-[38px]
                    rounded-full
                    bg-[#0071e3]
                    text-white
                    text-[20px]
                  "
                >
                  +
                </button>
              </div>

              {/* EVENT LIST */}
              <div className="mt-8 space-y-4">
                {upcomingEvents.map((event) => (
                  <motion.div
                    whileHover={{
                      x: 4,
                    }}
                    key={event.title}
                    className={`
                      flex
                      items-center
                      justify-between
                      rounded-[18px]
                      border
                      ${dark ? "border-white/10" : "border-black/5"}
                      p-4
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-[10px]
                          h-[10px]
                          rounded-full
                          ${event.color}
                        `}
                      />

                      <div>
                        <h3
                          className="
                            text-[15px]
                            tracking-[-0.03em]
                            font-medium
                          "
                        >
                          {event.title}
                        </h3>

                        <p
                          className={`mt-1 text-[11px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                        >
                          {event.type}
                        </p>
                      </div>
                    </div>

                    <div className="text-[13px] font-medium">{event.date}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* FEATURED CARD */}
            <motion.div
              whileHover={{
                y: -3,
                scale: 1.01,
              }}
              className={`
                relative
                overflow-hidden
                rounded-[28px]
                h-[220px]
                ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              `}
            >
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/80
                  via-black/10
                  to-transparent
                "
              />

              <div className="absolute bottom-0 left-0 p-6 text-white">
                <div className="px-3 h-[28px] rounded-full bg-[#0071e3] inline-flex items-center text-[11px]">
                  Featured
                </div>

                <h3
                  className="
                    mt-4
                    text-[28px]
                    leading-[0.95]
                    tracking-[-0.05em]
                    font-medium
                  "
                >
                  HackForge
                  <br />
                  2026
                </h3>

                <p className="mt-3 text-[12px] leading-[1.7] text-white/70">
                  Build futuristic projects with developers and innovators
                  across campus.
                </p>
              </div>
            </motion.div>
          </div>

          {/* MAIN CALENDAR */}
          <motion.div
            whileHover={{ y: -2 }}
            className={`
              xl:col-span-9
              rounded-[32px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-5
              lg:p-6
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              overflow-hidden
            `}
          >
            {/* TOP */}
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-[11px] uppercase tracking-[0.16em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  {currentMonth} {currentYear}
                </p>

                <h2
                  className="
                    mt-2
                    text-[40px]
                    leading-[0.92]
                    tracking-[-0.06em]
                    font-medium
                  "
                >
                  Monthly Calendar
                </h2>
              </div>

              {/* <div className="flex items-center gap-2">
                {["Month", "Week", "Day"].map((item) => (
                  <button
                    key={item}
                    className={`
                        px-5
                        h-[40px]
                        rounded-full
                        text-[13px]
                        transition-all
                        ${
                          item === "Month"
                            ? "bg-[#0071e3] text-white"
                            : "bg-black/[0.04] hover:bg-black/[0.07]"
                        }
                      `}
                  >
                    {item}
                  </button>
                ))}
              </div> */}
            </div>

            {/* DAYS */}
            <div className="grid grid-cols-7 gap-3 mt-10">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className={`
                    h-[54px]
                    rounded-[18px]
                    ${dark ? "bg-white/[0.05]" : "bg-black/[0.03]"}
                    flex
                    items-center
                    justify-center
                    text-[14px]
                    font-medium
                  `}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-3 mt-3">
              {Array.from({ length: 31 }, (_, i) => {
                const currentDay = i + 1;

                const event = filteredEvents.find((e) => e.day === currentDay);

                return (
                  <motion.div
                    whileHover={{
                      y: -2,
                      scale: event?.link ? 1.02 : 1,
                    }}
                    onClick={() => {
                      if (event?.link) {
                        window.open(
                          event.link,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                    key={currentDay}
                    className={`
                      h-[115px]
                      rounded-[20px]
                      border
                      ${dark ? "border-white/10" : "border-black/5"}
                      ${dark ? "bg-[#2a2a2a]" : "bg-[#fafafa]"}
                      ${event?.link ? "cursor-pointer" : ""}
                      p-3
                      transition-all
                      overflow-hidden
                    `}
                  >
                    {/* DAY */}
                    <div className="flex items-center justify-between">
                      <h3
                        className="
                          text-[18px]
                          tracking-[-0.03em]
                          font-medium
                        "
                      >
                        {currentDay}
                      </h3>

                      {event && (
                        <div
                          className={`
                            w-[8px]
                            h-[8px]
                            rounded-full
                            ${event.color}
                          `}
                        />
                      )}
                    </div>

                    {/* EVENT */}
                    {event && (
                      <motion.div
                        whileHover={{
                          scale: 1.02,
                        }}
                        className={`
                          mt-3
                          rounded-[16px]
                          p-3
                          text-white
                          ${event.color}
                        `}
                      >
                        <p className="text-[9px] uppercase tracking-wide text-white/70">
                          {event.type}
                        </p>

                        <h4
                          className="
                            mt-2
                            text-[13px]
                            leading-[1.2]
                            tracking-[-0.03em]
                            font-medium
                          "
                        >
                          {event.title}
                        </h4>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            if (event?.link) {
                              window.open(
                                event.link,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            }
                          }}
                          className="
                          mt-3
                          px-3
                          h-[26px]
                          rounded-full
                          bg-white/15
                          text-[10px]
                        "
                        >
                          Register →
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </PageBg>
  );
}

function ResourcesPage() {
  const { dark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("All");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    "All",
    "AI & ML Enthusiasts",
    "Project Builders",
    "WebApp Developers",
    "DSA Coders",
  ];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await api.resources.getAll();
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources =
    activeFilter === "All"
      ? resources
      : resources.filter((resource) => resource.category === activeFilter);

  return (
    <PageBg>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px] lg:py-[70px]">
        {/* HERO */}
        <div className="flex flex-col ">
          <p
            className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Learning Hub
          </p>

          <h1
            className="
              mt-4
              text-[48px]
              sm:text-[68px]
              lg:text-[92px]
              leading-[0.88]
              tracking-[-0.08em]
              font-medium
            "
          >
            Resources.
          </h1>

          <p
            className={`
              mt-6
              max-w-[760px]
              text-[15px]
              sm:text-[17px]
              leading-[1.8]
              ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
            `}
          >
            Discover curated roadmaps, tutorials, interview preparation guides
            and learning resources tailored for builders, developers and
            innovators.
          </p>
        </div>

        {/* FILTERS */}
        <div className="mt-16 flex justify-center">
          <div
            className={`
              inline-flex
              items-center
              justify-center
              gap-3
              rounded-[28px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-3
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
              overflow-x-auto
              max-w-full
            `}
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-7
                  h-[54px]
                  rounded-[18px]
                  text-[14px]
                  sm:text-[15px]
                  tracking-[-0.03em]
                  font-medium
                  whitespace-nowrap
                  transition-all
                  duration-300
                  ${
                    activeFilter === filter
                      ? "bg-[#0071e3] text-white shadow-lg"
                      : "text-[#555] hover:bg-black/[0.04]"
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* RECENTLY ADDED */}
        <div className="mt-20">
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-[13px] uppercase tracking-[0.18em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
              >
                Latest Uploads
              </p>

              <h2
                className="
                  mt-3
                  text-[38px]
                  sm:text-[52px]
                  leading-[0.95]
                  tracking-[-0.06em]
                  font-medium
                "
              >
                Recently Added
              </h2>
            </div>

            <div
              className={`hidden lg:block text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Updated Weekly
            </div>
          </div>

          {/* RESOURCE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
            {filteredResources.map((resource) => (
              <motion.div
                whileHover={{
                  y: -6,
                  scale: 1.01,
                }}
                key={resource.title}
                className={`
                  overflow-hidden
                  rounded-[32px]
                  ${dark ? "bg-[#1e1e1e]" : "bg-white"}
                  border
                  ${dark ? "border-white/10" : "border-black/5"}
                  ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
                `}
              >
                {/* IMAGE */}
                <div className="relative h-[240px] overflow-hidden">
                  <img
                    src={resource.image}
                    alt=""
                    className="
                      w-full
                      h-full
                      object-cover
                      transition-all
                      duration-700
                      hover:scale-110
                    "
                  />

                  {/* OVERLAY */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-black/10
                      to-transparent
                    "
                  />

                  {/* TAG */}
                  <div className="absolute top-5 left-5">
                    <div
                      className="
                        px-4
                        h-[34px]
                        rounded-full
                        bg-white/15
                        backdrop-blur-xl
                        text-white
                        text-[12px]
                        flex
                        items-center
                      "
                    >
                      {resource.tag}
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div className="absolute bottom-5 left-5 text-white">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">
                      {resource.category}
                    </p>

                    <h3
                      className="
                        mt-3
                        text-[28px]
                        leading-[1]
                        tracking-[-0.05em]
                        font-medium
                        max-w-[280px]
                      "
                    >
                      {resource.title}
                    </h3>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-7">
                  <p
                    className={`text-[15px] leading-[1.8] ${dark ? "text-[#aaa]" : "text-[#666]"}`}
                  >
                    {resource.description}
                  </p>

                  {/* ACTIONS */}
                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={() =>
                        window.open(
                          resource.link,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="
                        px-5
                        h-[42px]
                        rounded-full
                        bg-[#0071e3]
                        text-white
                        text-[13px]
                        hover:scale-[1.03]
                        transition-all
                      "
                    >
                      Explore Resource
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          resource.link,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className={`
                        w-[42px]
                        h-[42px]
                        rounded-full
                        ${dark ? "bg-white/[0.06]" : "bg-black/[0.04]"}
                        text-[18px]
                        ${dark ? "hover:bg-white/[0.12]" : "hover:bg-black/[0.08]"}
                        transition-all
                      `}
                    >
                      →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageBg>
  );
}

function GalleryPage() {
  const { dark } = useTheme();

  const [activeTab, setActiveTab] = useState("All");
  const [galleryImages, setGalleryImages] = useState([]);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalEvents: 0,
    byCategory: {},
  });
  const [loading, setLoading] = useState(true);

  const tabs = ["All", "Hackathons", "Workshops", "Events"];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const [galleryData, statsData] = await Promise.all([
          api.gallery.getAll(),
          api.gallery.getStats(),
        ]);
        setGalleryImages(galleryData);
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching gallery:", err);
        setGalleryImages([]);
        setStats({ totalPhotos: 0, totalEvents: 0, byCategory: {} });
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const renderSlider = (title, images) => {
    return (
      <div className="mt-20">
        {/* HEADER */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p
              className={`text-[13px] uppercase tracking-[0.18em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              CIC Archives
            </p>

            <h2
              className="
                mt-3
                text-[36px]
                sm:text-[48px]
                lg:text-[58px]
                leading-[0.95]
                tracking-[-0.06em]
                font-medium
              "
            >
              {title}
            </h2>
          </div>

          <div
            className={`hidden lg:block text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
          >
            Swipe Through Memories
          </div>
        </div>

        {/* SLIDER */}
        <div className="overflow-hidden">
          <motion.div
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 24,
              ease: "linear",
            }}
            className="flex gap-6 w-max"
          >
            {[...images, ...images].map((img, index) => (
              <motion.div
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                key={index}
                className="
                  relative
                  overflow-hidden
                  rounded-[30px]
                  shrink-0
                  w-[320px]
                  sm:w-[420px]
                  lg:w-[520px]
                  h-[240px]
                  sm:h-[320px]
                  lg:h-[380px]
                  bg-black
                "
              >
                <img
                  src={img.image}
                  alt=""
                  className="
                    w-full
                    h-full
                    object-cover
                    transition-all
                    duration-700
                    hover:scale-110
                  "
                />

                {/* OVERLAY */}
                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/70
                    via-black/10
                    to-transparent
                  "
                />

                {/* TEXT */}
                <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white">
                  <p className="text-[12px] uppercase tracking-[0.2em] text-white/70">
                    Coding & Innovation Club
                  </p>

                  <h3
                    className="
                      mt-3
                      text-[28px]
                      sm:text-[36px]
                      leading-[1]
                      tracking-[-0.05em]
                      font-medium
                    "
                  >
                    {title}
                  </h3>

                  <p className="mt-4 text-[14px] text-white/70 max-w-[320px] leading-[1.7]">
                    Capturing innovation, collaboration and unforgettable
                    moments from our community.
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <PageBg className="overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-[50px] lg:py-[70px]">
        {/* HERO */}
        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-10">
          <div>
            <p
              className={`text-[13px] uppercase tracking-[0.2em] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Visual Archive
            </p>

            <h1
              className="
                mt-4
                text-[48px]
                sm:text-[68px]
                lg:text-[92px]
                leading-[0.88]
                tracking-[-0.08em]
                font-medium
              "
            >
              Gallery.
            </h1>

            <p
              className={`
                mt-6
                max-w-[720px]
                text-[15px]
                sm:text-[17px]
                leading-[1.8]
                ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}
              `}
            >
              Explore hackathons, workshops, speaker sessions, coding
              competitions and community moments from the Coding & Innovation
              Club.
            </p>
          </div>

          {/* STATS */}
          <motion.div
            whileHover={{
              y: -5,
              scale: 1.01,
            }}
            className={`
              w-full
              xl:w-[340px]
              rounded-[36px]
              ${dark ? "bg-[#1e1e1e]" : "bg-white"}
              border
              ${dark ? "border-white/10" : "border-black/5"}
              p-8
              ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
            `}
          >
            <p
              className={`text-[14px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
            >
              Archive Statistics
            </p>

            <div className="mt-8 flex items-center justify-between">
              <div>
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Events
                </p>

                <h3 className="text-[34px] mt-1">{stats.totalEvents}</h3>
              </div>

              <div>
                <p
                  className={`text-[12px] ${dark ? "text-[#aaaaaa]" : "text-[#8f8f8f]"}`}
                >
                  Photos
                </p>

                <h3 className="text-[34px] mt-1">{stats.totalPhotos}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FILTER HEADER */}
        <div
          className="
    mt-16
    w-full
    flex
    justify-center
  "
        >
          <div
            className={`
      flex
      items-center
      gap-4
      ${dark ? "bg-[#2a2a2a]" : "bg-[#f5f5f7]"}
      border
      ${dark ? "border-white/10" : "border-black/[0.05]"}
      rounded-[22px]
      px-4
      py-3
      ${dark ? "shadow-[0_16px_48px_rgba(0,0,0,0.5)]" : "shadow-sm"}
    `}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
          h-[46px]
          px-6
          rounded-[14px]
          flex
          items-center
          justify-center
          text-[15px]
          font-medium
          tracking-[-0.02em]
          whitespace-nowrap
          transition-all
          duration-300
          ${
            activeTab === tab
              ? "bg-white text-black shadow-md"
              : "text-[#666] hover:bg-white/70"
          }
        `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        {(activeTab === "All" || activeTab === "Hackathons") &&
          renderSlider(
            "Hackathons",
            galleryImages
              .filter((img) => img.category === "Hackathons")
              .slice(0, 4),
          )}

        {(activeTab === "All" || activeTab === "Workshops") &&
          renderSlider(
            "Workshops",
            galleryImages
              .filter((img) => img.category === "Workshops")
              .slice(0, 4),
          )}

        {(activeTab === "All" || activeTab === "Events") &&
          renderSlider(
            "Events",
            galleryImages
              .filter((img) => img.category === "Events")
              .slice(0, 4),
          )}
      </div>
    </PageBg>
  );
}

// ========================================
// MAIN APP
// ========================================

export default function App() {
  const [dark, setDark] = useState(() => {
    // Persist dark mode preference across reloads, falling back to the OS setting.
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme === "dark";
      return (
        window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
      );
    } catch {
      return false;
    }
  });

  const toggleDark = () =>
    setDark((d) => {
      const next = !d;
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // Ignore storage failures; the in-memory theme still updates.
      }
      return next;
    });

  // Sync data-dark attribute on <html> for CSS selectors
  useEffect(() => {
    document.documentElement.setAttribute("data-dark", dark ? "true" : "false");
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const data = await api.auth.getMe();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await api.auth.register(userData);
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#171717] text-[#ededed]" : "bg-[#f2f2f4] text-[#0f1012]"}`}
      >
        <div className="text-[20px] font-medium tracking-wide">
          Loading CIC Portal...
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      <AuthContext.Provider
        value={{ user, login, register, logout, loading, refreshUser }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthPage />} />

            <Route element={<Layout />}>
              <Route path="/home" element={<HomePage />} />

              <Route path="/platform" element={<PlatformPage />} />

              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/leaderboard" element={<LeaderboardPage />} />

              <Route path="/quests" element={<DailyQuestPage />} />

              <Route path="/announcements" element={<AnnouncementsPage />} />

              <Route path="/calendar" element={<CalendarPage />} />

              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/calendar" element={<ManageCalendarPage />} />
              <Route
                path="/admin/announcements"
                element={<ManageAnnouncementsPage />}
              />
              <Route
                path="/admin/resources"
                element={<ManageResourcesPage />}
              />
              <Route path="/admin/members" element={<ManageMembersPage />} />
              <Route
                path="/admin/dailyquest"
                element={<ManageDailyQuestPage />}
              />
              <Route path="/admin/gallery" element={<ManageGalleryPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
