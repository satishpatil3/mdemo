import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/authService";

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

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        alert("Please enter email and password");
        return;
      }

      // 1. Create user in Firebase Authentication
      const userCredential = await signup(
        cleanEmail,
        password
      );

      const uid = userCredential.user.uid;
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

      // 3. Save user to database directly
      const userData = {
        name: assignedName,
        email: cleanEmail,
        role: assignedRole,
        createdAt: new Date().toISOString(),
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

      alert("Account Created with " + assignedRole.toUpperCase() + " Role");

      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">

      <div className="bg-white shadow-xl rounded-xl p-8 w-[400px]">

        <h2 className="text-3xl font-bold text-center mb-6">
          Signup
        </h2>

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
          onClick={handleSignup}
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
        >
          Create Account
        </button>

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
