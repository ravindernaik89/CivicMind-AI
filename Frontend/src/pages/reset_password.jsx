// src/pages/reset_password.jsx

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

  // Step 1: Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/auth/password-reset-request", {
        email,
      });
      
      setMessage(res.data.message || "Password reset link sent to your email");
      setStep("sent");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with token
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
      const res = await API.post("/auth/password-reset", {
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <nav className="flex justify-between items-center p-6 bg-black bg-opacity-30">
        <button onClick={() => navigate("/")} className="text-3xl font-bold hover:text-gray-300">
          CivicMind AI
        </button>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
        >
          Back to Login
        </button>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2">

          <h2 className="text-3xl font-bold text-center mb-8xl w-96">
            {step === "request" && "Reset Password"}
            {step === "sent" && "Check Your Email"}
            {step === "reset" && "New Password"}
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-2 rounded-lg mb-4 text-sm">
              {message}
            </div>
          )}

          {/* Step 1: Request password reset */}
          {step === "request" && (
            <form onSubmit={handleRequestReset}>
              <p className="text-gray-300 text-sm mb-4">
                Enter your registered email address to receive a password reset link.
              </p>
              <input
                type="email"
                className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {/* Step 2: Email sent confirmation */}
          {step === "sent" && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                If an account exists with the email <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                In demo mode, the reset token is displayed on the next screen. Use it to reset your password.
              </p>
              <button
                onClick={() => {
                  setStep("reset");
                  setResetToken(localStorage.getItem("last_reset_token") || "");
                }}
                className="w-full py-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition font-semibold"
              >
                Continue to Reset
              </button>
            </div>
          )}

          {/* Step 3: Enter new password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword}>
              <p className="text-gray-300 text-sm mb-4">
                Enter the reset token and your new password.
              </p>
              <input
                type="text"
                className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-400"
                placeholder="Reset Token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-400"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-400"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

