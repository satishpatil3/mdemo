import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-green-400">
        FirebaseApp
      </h1>

      <div className="flex gap-6 items-center">
        <Link
          to="/dashboard"
          className="hover:text-green-400"
        >
          Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
