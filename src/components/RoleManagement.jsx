import { useState, useEffect } from "react";
import {
  getAllUsers,
  updateUserRoleByEmail
} from "../services/userService";

function RoleManagement({ onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("plus");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let ignore = false;
    getAllUsers().then((data) => {
      if (!ignore) setUsers(data);
    }).catch(console.error);

    return () => {
      ignore = true;
    };
  }, []);

  const handleRoleChange = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter a user email.");
      return;
    }

    try {
      setLoading(true);
      await updateUserRoleByEmail(email, role);
      alert(`User ${email} role changed to ${role.toUpperCase()} successfully!`);
      setEmail("");
      loadUsers();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-gray-500 mt-1">
            Change an existing user's role to Plus or Pro by email.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl font-bold px-3 py-1 border rounded-lg"
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Form to change role by email */}
      <form onSubmit={handleRoleChange} className="max-w-md mb-8">
        <label className="block font-semibold mb-2 text-sm text-gray-700">
          User Email (must exist in database)
        </label>
        <input
          type="email"
          placeholder="Enter user email..."
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <h3 className="font-semibold mb-3 text-sm text-gray-700">Select New Role</h3>

        <div className="flex gap-6 mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="plus"
              checked={role === "plus"}
              onChange={(e) => setRole(e.target.value)}
            />
            <span className="ml-2 font-medium">Plus</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="pro"
              checked={role === "pro"}
              onChange={(e) => setRole(e.target.value)}
            />
            <span className="ml-2 font-medium">Pro</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
        >
          {loading ? "Updating..." : "Change Role"}
        </button>
      </form>

      {/* Quick list of database users to view their emails & roles */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold mb-3">Database Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Current Role</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-slate-50">
                  <td className="p-2 font-medium">{u.name || "N/A"}</td>
                  <td className="p-2 text-gray-600">{u.email}</td>
                  <td className="p-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        u.role === "pro"
                          ? "bg-purple-100 text-purple-700"
                          : u.role === "admin"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {u.role || "plus"}
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(u.email);
                        setRole(u.role === "plus" ? "pro" : "plus");
                      }}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Select to Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RoleManagement;
