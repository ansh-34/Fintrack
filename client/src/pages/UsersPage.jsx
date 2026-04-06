import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, search: "", role: "" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 20 };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;

      const res = await api.get("/users", { params });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeRole = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (currentUser?.role !== "admin") {
    return <p>Access denied. Admin only.</p>;
  }

  return (
    <div>
      <h2 className="page-title">User Management</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="analyst">Analyst</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === currentUser._id;
                  return (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        {isSelf ? (
                          <span className={`badge badge-${u.role}`}>{u.role}</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => changeRole(u._id, e.target.value)}
                            style={{ padding: "0.2rem", fontSize: "0.8rem" }}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${u.isActive ? "active" : "inactive"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {!isSelf && (
                          <>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => toggleStatus(u._id, u.isActive)}
                              style={{ marginRight: "0.3rem" }}
                            >
                              {u.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteUser(u._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {meta.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Prev
                </button>
                <span style={{ padding: "0.4rem", fontSize: "0.85rem" }}>
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  disabled={filters.page >= meta.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
