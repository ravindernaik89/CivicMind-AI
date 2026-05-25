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
      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("user_id", userId);
      localStorage.setItem("name", userName);
      if (departmentId) {
        localStorage.setItem("department_id", departmentId);
      }
      login(token, userRole);
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
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.18),transparent_24%),radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.14),transparent_22%)]" />
      <nav className="relative z-10 flex justify-between items-center px-6 py-6 bg-black/25 backdrop-blur-xl border-b border-white/10">
        <button onClick={() => navigate("/")} className="text-3xl font-bold tracking-tight hover:text-slate-100">
          CivicMind AI
        </button>
        <button
          onClick={() => navigate("/register")}
          className="rounded-full bg-green-500/90 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition hover:bg-green-400"
        >
          Register
        </button>
      </nav>

      <main className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-slate-950/70 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="mb-8 flex flex-col gap-2 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/90">Secure access for every user</p>
            <h1 className="text-4xl font-bold text-white">Sign in to CivicMind AI</h1>
            <p className="mx-auto max-w-md text-sm text-slate-400">
              Choose your role and access the dashboard for citizens, officers, or administrators.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {[
              { value: "CITIZEN", label: "Citizen" },
              { value: "OFFICER", label: "Officer" },
              { value: "ADMIN", label: "Admin" },
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  selectedRole === role.value
                    ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                    : "border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/20"
              placeholder={
                selectedRole === "ADMIN" ? "Admin ID" : selectedRole === "OFFICER" ? "Officer Email" : "Email"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/20"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {selectedRole === "OFFICER" && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-slate-300">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/20"
              >
                <option value="" disabled>
                  {departmentsLoading ? "Loading departments..." : "Select Department"}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="mt-8 w-full rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-fuchsia-500/20 transition hover:-translate-y-0.5"
          >
            Login
          </button>

          <div className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-400">
            <button onClick={() => navigate("/reset-password")} className="underline hover:text-white">
              Forgot Password?
            </button>
            <p>
              Don&apos;t have an account?{' '}
              <button onClick={() => navigate("/register")} className="font-semibold text-cyan-300 hover:text-cyan-200">
                Register here
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
