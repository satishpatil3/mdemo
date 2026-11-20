import { useState } from "react";
import { createUser } from "../services/userService";
import { toast } from "../context/ToastContext";

function AddUserForm({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("plus"); // Default is plus

  const handleCreateUser = async () => {
    try {
      await createUser({
        name,
        email,
        role
      });

      toast.success("User Added! Status: Signup Pending. (The user must complete signup on the Signup page before their role can be edited).");
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[500px] p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Add User
          </h2>

          <button
            onClick={onClose}
            className="text-xl"
          >
            ✕
          </button>
        </div>

        {/* Notice on Signup Requirement */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg mb-4">
          ℹ️ <strong>Note:</strong> Adding a user pre-assigns their account details. The user must complete <strong>Signup</strong> with their email & password before their role can be modified in Role Management.
        </div>

        {/* Display Name */}
        <input
          type="text"
          placeholder="Display Name"
          className="w-full border rounded-lg p-3 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="User Email"
          className="w-full border rounded-lg p-3 mb-6"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Role */}
        <h3 className="font-semibold mb-3">
          Role
        </h3>

        <div className="flex gap-6 mb-8">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="plus"
              checked={role === "plus"}
              onChange={(e) => setRole(e.target.value)}
            />
            <span className="ml-2">
              Plus
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="pro"
              checked={role === "pro"}
              onChange={(e) => setRole(e.target.value)}
            />
            <span className="ml-2">
              Pro
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value)}
            />
            <span className="ml-2 font-semibold text-yellow-800">
              Admin
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateUser}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUserForm;
