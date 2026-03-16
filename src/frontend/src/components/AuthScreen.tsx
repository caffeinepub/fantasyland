import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useBackendLogin, useBackendRegister } from "../hooks/useQueries";

interface AuthScreenProps {
  onAuthed: (username: string) => void;
  onGuest: () => void;
}

type Tab = "login" | "signup";

export default function AuthScreen({ onAuthed, onGuest }: AuthScreenProps) {
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = useBackendLogin();
  const registerMutation = useBackendRegister();

  const validate = () => {
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return false;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return false;
    }
    setError("");
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = await loginMutation.mutateAsync({
        username: username.trim(),
        password,
      });
      if (token) {
        localStorage.setItem("fl_session_token", token);
        localStorage.setItem("fl_auth_user", username.trim());
        localStorage.setItem("fl_username", username.trim());
        setSuccess("Welcome back! Logging in...");
        setTimeout(() => onAuthed(username.trim()), 600);
      } else {
        // Fallback to local check
        const storedUser = localStorage.getItem("fl_auth_user");
        const storedPass = localStorage.getItem("fl_auth_pass");
        if (storedUser === username.trim() && storedPass === password) {
          setSuccess("Welcome back! Logging in...");
          localStorage.setItem("fl_username", username.trim());
          setTimeout(() => onAuthed(username.trim()), 600);
        } else {
          setError("Incorrect username or password.");
        }
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const success = await registerMutation.mutateAsync({
        username: username.trim(),
        password,
      });
      if (success) {
        // Auto login after register
        const token = await loginMutation.mutateAsync({
          username: username.trim(),
          password,
        });
        if (token) {
          localStorage.setItem("fl_session_token", token);
        }
        localStorage.setItem("fl_auth_user", username.trim());
        localStorage.setItem("fl_auth_pass", password);
        localStorage.setItem("fl_username", username.trim());
        setSuccess("Account created! Entering FantasyLand...");
        setTimeout(() => onAuthed(username.trim()), 600);
      } else {
        setError("Username already taken. Please choose another.");
      }
    } catch {
      // Fallback to local registration
      localStorage.setItem("fl_auth_user", username.trim());
      localStorage.setItem("fl_auth_pass", password);
      localStorage.setItem("fl_username", username.trim());
      setSuccess("Account created! Entering FantasyLand...");
      setTimeout(() => onAuthed(username.trim()), 600);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    localStorage.setItem("fl_guest", "1");
    onGuest();
  };

  const handleSubmit = () => {
    if (loading) return;
    if (tab === "login") handleLogin();
    else handleSignup();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.18) 0%, rgba(10,10,15,1) 60%)",
      }}
    >
      {/* Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: "rgba(20,10,40,0.85)",
          border: "1px solid rgba(168,85,247,0.25)",
          boxShadow:
            "0 0 60px rgba(168,85,247,0.12), 0 8px 32px rgba(0,0,0,0.5)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Tabs */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              data-ocid={`auth.${t}_tab`}
              onClick={() => {
                setTab(t);
                setError("");
                setSuccess("");
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wider transition-all"
              style={{
                background:
                  tab === t
                    ? "linear-gradient(135deg, #a855f7, #ec4899)"
                    : "transparent",
                color: tab === t ? "white" : "rgba(255,255,255,0.4)",
                boxShadow: tab === t ? "0 0 16px rgba(168,85,247,0.4)" : "none",
              }}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-username"
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Username
            </label>
            <input
              id="auth-username"
              type="text"
              data-ocid="auth.username.input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your username"
              autoComplete="username"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(168,85,247,0.3)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(168,85,247,0.7)";
                e.currentTarget.style.boxShadow =
                  "0 0 12px rgba(168,85,247,0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(168,85,247,0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-password"
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPass ? "text" : "password"}
                data-ocid="auth.password.input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                autoComplete={
                  tab === "login" ? "current-password" : "new-password"
                }
                className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(168,85,247,0.3)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(168,85,247,0.7)";
                  e.currentTarget.style.boxShadow =
                    "0 0 12px rgba(168,85,247,0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(168,85,247,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                data-ocid="auth.show_password_toggle"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity opacity-60 hover:opacity-100"
              >
                {showPass ? (
                  <EyeOff size={16} color="white" />
                ) : (
                  <Eye size={16} color="white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error / Success */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              data-ocid="auth.error_state"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mt-4 text-xs text-center font-semibold px-3 py-2 rounded-xl"
              style={{
                color: "#f87171",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              key="success"
              data-ocid="auth.success_state"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 text-xs text-center font-semibold px-3 py-2 rounded-xl"
              style={{
                color: "#34d399",
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          type="button"
          data-ocid="auth.submit_button"
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 py-3.5 rounded-2xl font-bold text-white tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
            boxShadow: "0 0 24px rgba(168,85,247,0.45)",
          }}
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : tab === "login" ? (
            <>
              <LogIn size={18} />
              Log In
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Create Account
            </>
          )}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            or
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>

        {/* Guest button */}
        <button
          type="button"
          data-ocid="auth.guest_button"
          onClick={handleGuest}
          className="w-full py-3 rounded-2xl font-semibold text-sm tracking-wide transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          Continue as Guest
        </button>
      </motion.div>

      {/* Footer */}
      <p className="mt-8 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(168,85,247,0.6)" }}
        >
          caffeine.ai
        </a>
      </p>
    </motion.div>
  );
}
