import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "CITIZEN",
      });

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      let errorMessage = "Registration failed. Please try again.";

      const detail = err.response?.data?.detail;
      if (detail) {
        if (Array.isArray(detail)) {
          errorMessage = detail
            .map((item) => item.msg || JSON.stringify(item))
            .join(". ");
        } else if (typeof detail === "string") {
          errorMessage = detail;
        } else {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Login
        </button>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-center">Citizen Registration</h2>
          <p className="text-gray-300 text-center mb-6">Create your citizen account</p>

          {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-500 rounded text-white placeholder-gray-400"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-500 rounded text-white placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-500 rounded text-white placeholder-gray-400"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-500 rounded text-white placeholder-gray-400"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center text-gray-300 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
