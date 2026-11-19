import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import Navbar from "../components/Navbar";

import AdminDashboard from "./AdminDashboard";
import PlusDashboard from "./PlusDashboard";
import ProDashboard from "./ProDashboard";

import { db } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const { user } = useAuth();

  const [role, setRole] = useState("");
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "users"),
          where(
            "email",
            "==",
            user.email
          )
        );

        const querySnapshot =
          await getDocs(q);

        querySnapshot.forEach((doc) => {
          setRole(doc.data().role);
        });

        setLoading(false);
      } catch (error) {
        console.log(error);
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