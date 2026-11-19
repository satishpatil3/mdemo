import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc
} from "firebase/firestore";

import Navbar from "../components/Navbar";

import AdminDashboard from "./AdminDashboard";
import PlusDashboard from "./PlusDashboard";
import ProDashboard from "./ProDashboard";

import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const { user } = useAuth();

  const [role, setRole] = useState("plus"); // default is plus
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

        let userRole = "plus";
        if (querySnapshot.empty) {
          // If no document exists in database for this authenticated user, auto-add with plus role
          try {
            await setDoc(doc(db, "users", user.uid), {
              name: user.displayName || cleanEmail.split("@")[0],
              email: cleanEmail,
              role: "plus",
              createdAt: new Date().toISOString()
            });
          } catch (createErr) {
            console.warn("Could not auto-create user doc:", createErr);
          }
        } else {
          querySnapshot.forEach((docSnap) => {
            const dataRole = docSnap.data().role;
            if (dataRole) {
              userRole = dataRole;
            }
          });
        }

        setRole(userRole);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setRole("plus");
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

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
