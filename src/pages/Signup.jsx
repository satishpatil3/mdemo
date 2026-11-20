import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup, login, logout } from "../services/authService";

import {
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { normalizeEmail } from "../services/userService";
import { toast } from "../context/ToastContext";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    if (e) e.preventDefault();

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !password) {
      toast.warning("Please enter email and password");
      return;
    }

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      let uid = null;

      // 1. Attempt to create user in Firebase Authentication
      try {
        const userCredential = await signup(cleanEmail, password);
        uid = userCredential.user.uid;
      } catch (authErr) {
        if (authErr.code === "auth/email-already-in-use") {
          // Check if user already exists as an active signed-up user in Firestore
          const q = query(
            collection(db, "users"),
            where("email", "==", cleanEmail)
          );
          const snap = await getDocs(q);

          const hasActiveSignedUpUser =
            !snap.empty &&
            snap.docs.some((d) => {
              const data = d.data();
              return (
                data.isSignedUp === true ||
                (data.isSignedUp === undefined && data.source !== "admin" && data.status !== "pending_signup")
              );
            });

          if (hasActiveSignedUpUser) {
            toast.info("Email is already registered. Please go to Login.");
            navigate("/login");
            return;
          }

          // If the user was deleted from database or was added by admin without signup:
          // Try to sign in with this password to claim/re-activate the account
          try {
            const loginRes = await login(cleanEmail, password);
            uid = loginRes.user.uid;
          } catch (loginErr) {
            toast.error(
              "This email was previously registered in Authentication with a different password. Please enter the existing password to complete registration, or clear the user in Firebase Console > Authentication."
            );
            setLoading(false);
            return;
          }
        } else {
          throw authErr;
        }
      }

      let assignedRole = "plus"; // default role is plus
      let assignedName = cleanEmail.split("@")[0];

      // 2. Check if admin pre-created a role for this email
      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", cleanEmail)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.role) assignedRole = data.role;
            if (data.name) assignedName = data.name;
          });
        }
      } catch (checkErr) {
        console.warn("Pre-role check skipped:", checkErr);
      }

      // 3. Save user to database directly as a signed-up user
      const userData = {
        name: assignedName,
        email: cleanEmail,
        role: assignedRole,
        isSignedUp: true, // Marked as signed-up user so admin can edit role
        status: "signed_up",
        source: "signup",
        signedUpAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "users", uid), userData);
      } catch (setErr) {
        console.warn("setDoc fallback to addDoc:", setErr);
        await addDoc(collection(db, "users"), userData);
      }

      // 4. Clean up any older pre-created duplicate documents
      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", cleanEmail)
        );
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
          if (docSnap.id !== uid) {
            await deleteDoc(doc(db, "users", docSnap.id));
          }
        }
      } catch (cleanErr) {
        console.warn("Older duplicate cleanup skipped:", cleanErr);
      }

      // Ensure user logs in through the Login page
      await logout();

      toast.success("Account Created with " + assignedRole.toUpperCase() + " Role! Please login.");

      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-[400px]">

        <h2 className="text-3xl font-bold text-center mb-6">
          Signup
        </h2>

        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className="w-full border p-3 rounded-lg mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-5">
          Already have account?{" "}
          <Link
            to="/login"
            className="text-blue-600"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;
