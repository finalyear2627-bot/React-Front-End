import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../api/user.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const ROLE_BADGE = {
  ADMIN:   "bg-danger-focus text-danger-main",
  TEACHER: "bg-primary-100 text-primary-600",
  STUDENT: "bg-success-focus text-success-main",
};

const UserListLayer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : data.result || data.results || []);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setTogglingId(user.id);
    try {
      const isActive = user.is_active;
      const res = isActive
        ? await userService.deactivateUser(user.id)
        : await userService.activateUser(user.id);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Action failed");
        return;
      }
      showSuccess(res?.status?.message || `User ${isActive ? "deactivated" : "activated"} successfully`);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !isActive } : u));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await userService.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showSuccess(res?.status?.message || "User deleted successfully");
      } catch (err) {
        showError(getApiError(err));
      }
    }
  };

  const paginated = users.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Users</h5>
        <Link to="/user-add" className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1">
          <Icon icon="ic:round-plus" className="text-xl" />
          Add User
        </Link>
      </div>

      {error && <div className="card-body pb-0"><div className="alert alert-danger">{error}</div></div>}

      <div className="card-body">
        {users.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No users found</p>
            <Link to="/user-add" className="btn btn-sm btn-primary mt-16">Add First User</Link>
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user, index) => (
                    <tr key={user.id || index}>
                      <td>{user.id}</td>
                      <td className="fw-medium">{user.username || "N/A"}</td>
                      <td>{`${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td>
                        <span className={`badge radius-4 ${ROLE_BADGE[user.role] || "bg-neutral-200 text-neutral-600"}`}>
                          {user.role || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge radius-4 ${user.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/user-edit/${user.id}`}
                          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={togglingId === user.id}
                          className={`w-32-px h-32-px me-8 rounded-circle d-inline-flex align-items-center justify-content-center border-0 ${user.is_active ? "bg-warning-focus text-warning-main" : "bg-success-focus text-success-main"}`}
                          title={user.is_active ? "Deactivate" : "Activate"}
                        >
                          {togglingId === user.id
                            ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                            : <Icon icon={user.is_active ? "mingcute:pause-circle-line" : "mingcute:play-circle-line"} />
                          }
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                          title="Delete"
                        >
                          <Icon icon="mingcute:delete-2-line" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              total={users.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default UserListLayer;