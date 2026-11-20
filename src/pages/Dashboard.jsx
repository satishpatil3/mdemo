import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc
} from "firebase/firestore";

import Navbar from "../components/Navbar";

import AdminDashboard from "./AdminDashboard";
import PlusDashboard from "./PlusDashboard";
import ProDashboard from "./ProDashboard";

import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/authService";
import { toast } from "../context/ToastContext";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("plus");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;

      try {
        const cleanEmail = user.email ? user.email.trim().toLowerCase() : "";
        const q = query(
          collection(db, "users"),
          where("email", "==", cleanEmail)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // User was deleted from Firestore database or never completed signup: DO NOT auto-create!
          toast.error("Account not found in database. Please register on the Signup page first.");
          await logout();
          navigate("/login");
          return;
        }

        let userRole = "plus";
        let isSignedUp = false;

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.role) {
            userRole = data.role;
          }
          if (
            data.role === "admin" ||
            data.isSignedUp === true ||
            (data.isSignedUp === undefined && data.source !== "admin" && data.status !== "pending_signup")
          ) {
            isSignedUp = true;
          }
        });

        if (!isSignedUp) {
          toast.warning("Signup Pending: You must register on the Signup page before accessing Dashboard.");
          await logout();
          navigate("/login");
          return;
        }

        setRole(userRole);
        setLoading(false);
      } catch (error) {
        console.log("Dashboard role error:", error);
        toast.error("Error loading profile role");
        setRole("plus");
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="p-10">
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-8">

        {role === "admin" && (
          <AdminDashboard />
        )}

        {role === "plus" && (
          <PlusDashboard />
        )}

        {role === "pro" && (
          <ProDashboard />
        )}

      </div>
    </>
  );
}

export default Dashboard;
