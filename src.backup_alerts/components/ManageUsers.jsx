import { useState, useEffect } from "react";
import { getAllUsers, deleteUser } from "../services/userService";

function ManageUsers({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      alert(error.message);
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
          alert(err.message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        alert("User deleted successfully");
        loadUsers();
      } catch (error) {
        alert(error.message);
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
            className="text-gray-500 hover:text-gray-800 text-xl font-bold px-3 py-1 border rounded-lg"
          >
            ✕ Close
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
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
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
