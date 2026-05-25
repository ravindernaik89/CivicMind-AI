import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState(token || "");
  const [step, setStep] = useState(token ? "reset" : "request");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/auth/password-reset-request", { email });
      setMessage(res.data.message || "Password reset link sent to your email");
      setStep("sent");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/password-reset", {
        token: resetToken,
        new_password: newPassword,
      });
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.2),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_20%)]" />
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 bg-black/25 backdrop-blur-xl border-b border-white/10">
        <button onClick={() => navigate("/")} className="text-3xl font-bold tracking-tight hover:text-slate-100">
          CivicMind AI
        </button>
        <button
          onClick={() => navigate("/login")}
          className="rounded-full bg-purple-500/90 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-400"
        >
          Back to Login
        </button>
      </nav>

      <main className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Password recovery</p>
            <h1 className="mt-4 text-4xl font-bold text-white">Reset your password</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400">
              Follow the steps below to request a reset link and update your account password.
            </p>
          </div>

          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100 mb-5">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-100 mb-5">
              {message}
            </div>
          )}

          {step === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/20"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-fuchsia-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {step === "sent" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-green-300">
                ✓
              </div>
              <p className="text-slate-300">If an account exists with the email <strong>{email}</strong>, you will receive a reset link soon.</p>
              <button
                onClick={() => {
                  setStep("reset");
                  setResetToken(localStorage.getItem("last_reset_token") || "");
                }}
                className="w-full rounded-3xl bg-purple-600 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-purple-500/20 transition hover:-translate-y-0.5"
              >
                Continue to Reset
              </button>
            </div>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reset Token</label>
                <input
                  type="text"
                  className="w-full rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/20"
                  placeholder="Reset Token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/20"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/20"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-fuchsia-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;

