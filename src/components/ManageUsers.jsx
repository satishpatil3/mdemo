import { useState, useEffect } from "react";
import { getAllUsers, deleteUser, normalizeEmail } from "../services/userService";
import { toast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";

function ManageUsers({ onClose }) {
  const { user: currentUser } = useAuth();
  const currentEmail = normalizeEmail(currentUser?.email);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getAllUsers()
      .then((data) => {
        if (!ignore) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          toast.error(err.message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (id) => {
    const targetUser = users.find((u) => u.id === id);
    const targetEmail = normalizeEmail(targetUser?.email);

    // Prevent deleting own logged-in account
    if (targetEmail === currentEmail) {
      toast.error("You cannot delete your own account while logged in.");
      return;
    }

    // Ensure system always keeps at least one Admin
    const adminCount = users.filter((u) => u.role === "admin").length;
    if (targetUser?.role === "admin" && adminCount <= 1) {
      toast.error("Cannot delete the last remaining Admin account. The system requires at least one active Admin.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${targetUser?.name || targetUser?.email || "this user"}?`)) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
        loadUsers();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <p className="text-gray-500 mt-1">
            View registered users and admin-added users. Note that only signed-up users can have their roles modified.
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

      {loading ? (
        <p className="text-gray-500 py-4">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500 py-4">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-700">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{u.name || "N/A"}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
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
                  <td className="p-3">
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
                  <td className="p-3 text-right">
                    {normalizeEmail(u.email) === currentEmail ? (
                      <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded font-semibold inline-block" title="You cannot delete your own active account">
                        You (Active Admin)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
