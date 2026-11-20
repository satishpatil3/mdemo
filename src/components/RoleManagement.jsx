import { useState, useEffect } from "react";
import {
  getAllUsers,
  updateUserRoleByEmail,
  normalizeEmail
} from "../services/userService";
import { toast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";

function RoleManagement({ onClose }) {
  const { user: currentUser } = useAuth();
  const currentEmail = normalizeEmail(currentUser?.email);

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

    const cleanInputEmail = normalizeEmail(email);

    if (!cleanInputEmail) {
      toast.warning("Please enter a user email.");
      return;
    }

    // An admin cannot change their own access level
    if (cleanInputEmail === currentEmail) {
      toast.error("You cannot change your own access level to prevent locking yourself out of Admin Dashboard.");
      return;
    }

    // Check if the user is in the database and verify they are signed up
    const targetUser = users.find((u) => normalizeEmail(u.email) === cleanInputEmail);

    if (targetUser && !targetUser.isSignedUp) {
      toast.error(`Cannot edit role: User "${targetUser.email}" is Signup Pending. Only signed-up users can have their roles edited.`);
      return;
    }

    try {
      setLoading(true);
      await updateUserRoleByEmail(cleanInputEmail, role, currentEmail);
      toast.success(`User ${cleanInputEmail} role changed to ${role.toUpperCase()} successfully!`);
      setEmail("");
      loadUsers();
    } catch (error) {
      toast.error(error.message);
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
            Assign Plus or Pro roles to registered users.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Info notice explaining the rule */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg text-sm text-blue-900">
        <span className="font-bold">Access Rule:</span> Only users who have completed <strong>Signup</strong> can have their roles edited. Users added by Admin remain <em>Pending Signup</em> until they register their account with a password.
      </div>

      {/* Form to change role by email */}
      <form onSubmit={handleRoleChange} className="max-w-md mb-8">
        <label className="block font-semibold mb-2 text-sm text-gray-700">
          User Email (must be a signed-up user)
        </label>
        <input
          type="email"
          placeholder="Enter signed-up user email..."
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

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value)}
            />
            <span className="ml-2 font-semibold text-yellow-800">Admin</span>
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

      {/* Quick list of database users with Signup status */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">Database Users</h3>
          <span className="text-xs text-gray-500">
            Total: {users.length} | Signed Up: {users.filter(u => u.isSignedUp).length} | Pending: {users.filter(u => !u.isSignedUp).length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Current Role</th>
                <th className="p-2">Signup Status</th>
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
                  <td className="p-2">
                    {u.isSignedUp ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        ✓ Signed Up
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        ⏳ Signup Pending
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    {normalizeEmail(u.email) === currentEmail ? (
                      <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded font-semibold inline-block" title="You cannot change your own access level">
                        You (Self)
                      </span>
                    ) : u.isSignedUp ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(u.email);
                          setRole(u.role === "plus" ? "pro" : "plus");
                        }}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-md font-semibold transition"
                      >
                        Select to Edit Role
                      </button>
                    ) : (
                      <span
                        className="text-xs text-gray-400 italic bg-gray-50 border border-gray-200 px-2 py-1 rounded cursor-not-allowed"
                        title="This user is Signup Pending. Only signed-up users can have their roles edited."
                      >
                        🔒 Cannot Edit (Signup Pending)
                      </span>
                    )}
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
