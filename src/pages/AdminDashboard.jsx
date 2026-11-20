import { useState } from "react";
import AddUserForm from "../components/AddUserForm";
import FeatureCard from "../components/FeatureCard";
import ManageUsers from "../components/ManageUsers";
import RoleManagement from "../components/RoleManagement";

function AdminDashboard() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [activeView, setActiveView] = useState(""); // "" | "manageUsers" | "roleManagement"

  const features = [
    {
      title: "Add User",
      description: "Create a new user and assign a role",
      onClick: () => setShowAddUser(true)
    },
    {
      title: "Manage Users",
      description: "View and manage all users",
      onClick: () => setActiveView("manageUsers")
    },
    {
      title: "Role Management",
      description: "Assign Plus and Pro roles",
      onClick: () => setActiveView("roleManagement")
    },
    {
      title: "Analytics",
      description: "View system analytics"
    },
    {
      title: "Reports",
      description: "Generate reports"
    },
    {
      title: "Settings",
      description: "Manage application settings"
    }
  ];

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Admin Dashboard
        </h1>
      </div>

      {/* Manage Users Functional View */}
      {activeView === "manageUsers" && (
        <div className="mb-8">
          <ManageUsers onClose={() => setActiveView("")} />
        </div>
      )}

      {/* Role Management Functional View */}
      {activeView === "roleManagement" && (
        <div className="mb-8">
          <RoleManagement onClose={() => setActiveView("")} />
        </div>
      )}

      {/* Feature Cards Grid (Add User is now a small card just like Manage Users) */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            onClick={feature.onClick}
          />
        ))}
      </div>

      {/* Popup Modal */}
      {showAddUser && (
        <AddUserForm
          onClose={() => setShowAddUser(false)}
        />
      )}
    </>
  );
}

export default AdminDashboard;
