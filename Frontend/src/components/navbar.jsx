import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

function Navbar({ title }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex flex-col gap-4 px-8 py-6 bg-slate-950/70 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-slate-950/10 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-sm text-slate-400">Your secure civic operations workspace</p>
      </div>
      <button
        onClick={handleLogout}
        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5"
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;