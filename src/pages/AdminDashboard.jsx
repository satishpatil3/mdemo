import { useState } from "react";
import AddUserForm from "../components/AddUserForm";
import FeatureCard from "../components/FeatureCard";

function AdminDashboard() {

  const [showAddUser, setShowAddUser] =
    useState(false);

  const features = [
    {
      title: "Manage Users",
      description: "View and manage all users"
    },
    {
      title: "Role Management",
      description: "Assign Plus and Pro roles"
    },
    {
      title: "Delete Users",
      description: "Remove unwanted users"
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

      {/* Add User Card */}

      <div
        onClick={() =>
          setShowAddUser(true)
        }
        className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition mb-8"
      >
        <h2 className="text-xl font-bold">
          Add User
        </h2>

        <p className="text-gray-500 mt-2">
          Create a new user and assign a role.
        </p>
      </div>

      {/* Other Feature Cards */}

      <div className="grid md:grid-cols-3 gap-6">

        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}

      </div>

      {/* Popup Modal */}

      {showAddUser && (
        <AddUserForm
          onClose={() =>
            setShowAddUser(false)
          }
        />
      )}

    </>
  );
}

export default AdminDashboard;