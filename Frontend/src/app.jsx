import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import ResetPassword from "./pages/reset_password";
import CitizenDashboard from "./pages/citizen_dashboard";
import OfficerDashboard from "./pages/officer_Dashboard";
import AdminDashboard from "./pages/admin_dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/citizen"
              element={
                <ProtectedRoute role="CITIZEN">
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/officer"
              element={
                <ProtectedRoute role="OFFICER">
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
