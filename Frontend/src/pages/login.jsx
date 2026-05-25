// src/pages/Login.jsx

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/authContext";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("CITIZEN");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Special handling for Admin login
    if (selectedRole === "ADMIN") {
      if (email === "ADMIN123" && password === "Admin@001") {
        // Try real admin login first
        try {
          const res = await API.post("/auth/login", {
            email: "admin@civicmind.com",
            password: "Admin@001",
          });
          
          const token = res.data.access_token;
          login(token, "ADMIN");
          localStorage.setItem("user_id", res.data.user_id);
          localStorage.setItem("name", res.data.name);
          navigate("/admin");
          return;
        } catch (err) {
          // Fall back to mock token if real login fails
          console.log("Using mock admin token");
          const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQURNSU4iLCJlbWFpbCI6ImFkbWluQGNpdmljbWluZC5jb20ifQ.mock";
          login(mockToken, "ADMIN");
          navigate("/admin");
          return;
        }
      } else {
        alert("Invalid Admin ID or Password");
        return;
      }
    }

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const token = res.data.access_token;
      const userRole = res.data.role;
      const userId = res.data.user_id;
      const userName = res.data.name;
      const departmentId = res.data.department_id;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("user_id", userId);
      localStorage.setItem("name", userName);
      if (departmentId) {
        localStorage.setItem("department_id", departmentId);
      }

      // Update context
      login(token, userRole);

      // Navigate based on actual role from token
      if (userRole === "CITIZEN") navigate("/citizen");
      if (userRole === "OFFICER") navigate("/officer");
      if (userRole === "ADMIN") navigate("/admin");

    } catch (error) {
      alert("Invalid Credentials");
    }
  };

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const res = await API.get("/auth/departments");
      setDepartments(res.data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <nav className="flex justify-between items-center p-6 bg-black bg-opacity-30">
        <button onClick={() => navigate("/")} className="text-3xl font-bold hover:text-gray-300">
          CivicMind AI
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
        >
          Register
        </button>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl w-96">

          <h2 className="text-3xl font-bold text-center mb-8">
            Login
          </h2>

          <input
            className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-400"
            placeholder={
              selectedRole === "ADMIN" ? "Admin ID" : 
              selectedRole === "OFFICER" ? "Officer Email" : 
              "Email"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {selectedRole === "OFFICER" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/20 text-white"
              >
                <option value="" className="bg-gray-900">Select Department</option>
                {departmentsLoading ? (
                  <option value="" disabled className="bg-gray-900">Loading departments...</option>
                ) : departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="bg-gray-900">
                      {dept.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled className="bg-gray-900">No departments available</option>
                )}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">Login as</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 text-white"
            >
              <option value="CITIZEN" className="bg-gray-900">Citizen</option>
              <option value="OFFICER" className="bg-gray-900">Officer</option>
              <option value="ADMIN" className="bg-gray-900">Admin</option>
            </select>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition font-semibold"
          >
            Login
          </button>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/reset-password")}
              className="text-gray-300 hover:text-white text-sm"
            >
              Forgot Password?
            </button>
          </div>

          <p className="text-center text-gray-300 mt-4">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-green-400 hover:text-green-300 font-semibold"
            >
              Register here
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
