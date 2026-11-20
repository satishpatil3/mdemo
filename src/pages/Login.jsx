import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, logout } from "../services/authService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { normalizeEmail } from "../services/userService";
import { toast } from "../context/ToastContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      toast.warning("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // 1. Authenticate with Firebase Authentication
      await login(cleanEmail, password);

      // 2. Check if user document exists in Firestore database
      const q = query(
        collection(db, "users"),
        where("email", "==", cleanEmail)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // User was deleted from Firestore database or never completed signup
        await logout();
        toast.error("Account not found in database. Please register on the Signup page first.");
        setLoading(false);
        return;
      }

      let userData = null;
      querySnapshot.forEach((docSnap) => {
        userData = docSnap.data();
      });

      // Admin can always login; regular users must have completed signup
      const isAdmin = userData?.role === "admin";
      const isSignedUp =
        isAdmin ||
        userData?.isSignedUp === true ||
        (userData?.isSignedUp === undefined && userData?.source !== "admin" && userData?.status !== "pending_signup");

      if (!isSignedUp) {
        // User was added by admin but has not registered yet
        await logout();
        toast.warning("Signup Pending: You were added by Admin but have not registered with a password yet. Please go to Signup first to create your account.");
        setLoading(false);
        return;
      }

      // 3. User is valid and signed up
      toast.success("Welcome back! Logging you in...");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-[400px]">

        <h2 className="text-3xl font-bold text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-5">
          New User?{" "}
          <Link
            className="text-blue-600"
            to="/signup"
          >
            Signup
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
