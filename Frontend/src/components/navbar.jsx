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
    <nav className="flex justify-between items-center px-8 py-4 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <h1 className="text-2xl font-bold tracking-wide">{title}</h1>
      <button 
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition duration-300"
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;