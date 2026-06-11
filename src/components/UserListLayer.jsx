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

const isAdmin = () => localStorage.getItem("user_role") === "ADMIN";

/* ── Password Modal ── */
const PasswordModal = ({ user, onClose, onSuccess }) => {
  const [form, setForm]       = useState({ password: "", confirm_password: "" });
  const [saving, setSaving]   = useState(false);
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      showError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await userService.setUserPassword(user.id, form.password, form.confirm_password);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Failed to update password");
        return;
      }
      showSuccess(res?.status?.message || `Password updated for ${user.username}`);
      onSuccess();
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    /* backdrop */
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 10000 }}
      onClick={onClose}
    >
      {/* panel — stop propagation so clicking inside doesn't close */}
      <div
        className="bg-base radius-12 shadow p-24"
        style={{ width: "100%", maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-20">
          <h6 className="mb-0">
            <Icon icon="solar:lock-password-outline" className="me-8 text-primary-600" />
            Set Password — <span className="text-secondary-light fw-normal">{user.username}</span>
          </h6>
          <button onClick={onClose} className="border-0 bg-transparent text-secondary-light text-xl line-height-1">
            <Icon icon="material-symbols:close" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-16">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              New Password <span className="text-danger-600">*</span>
            </label>
            <div className="position-relative">
              <input
                type={showPwd.password ? "text" : "password"}
                className="form-control radius-8"
                name="password"
                placeholder="Enter new password"
                value={form.password}
                onChange={handleChange}
                required
                autoFocus
              />
              <span
                className={`toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light ${showPwd.password ? "ri-eye-off-line" : "ri-eye-line"}`}
                onClick={() => setShowPwd((p) => ({ ...p, password: !p.password }))}
              />
            </div>
          </div>

          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Confirm Password <span className="text-danger-600">*</span>
            </label>
            <div className="position-relative">
              <input
                type={showPwd.confirm ? "text" : "password"}
                className="form-control radius-8"
                name="confirm_password"
                placeholder="Confirm new password"
                value={form.confirm_password}
                onChange={handleChange}
                required
              />
              <span
                className={`toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light ${showPwd.confirm ? "ri-eye-off-line" : "ri-eye-line"}`}
                onClick={() => setShowPwd((p) => ({ ...p, confirm: !p.confirm }))}
              />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary radius-8 py-10 flex-grow-1" disabled={saving}>
              {saving ? "Saving…" : "Update Password"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-outline-secondary radius-8 py-10 flex-grow-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main component ── */
const UserListLayer = () => {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error,      setError]      = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterFullName, setFilterFullName] = useState("");
  const [filterEmail,    setFilterEmail]    = useState("");
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(10);

  // password modal state
  const [pwdTarget, setPwdTarget] = useState(null); // user object or null

  const admin = isAdmin();

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

  const resetFilters = () => {
    setFilterUsername("");
    setFilterFullName("");
    setFilterEmail("");
    setPage(1);
  };

  const hasFilter = filterUsername || filterFullName || filterEmail;

  const filtered = users.filter((user) => {
    const username = (user.username || "").toLowerCase();
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim().toLowerCase();
    const email = (user.email || "").toLowerCase();

    if (filterUsername && !username.includes(filterUsername.trim().toLowerCase())) return false;
    if (filterFullName && !fullName.includes(filterFullName.trim().toLowerCase())) return false;
    if (filterEmail && !email.includes(filterEmail.trim().toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <React.Fragment>
      {/* Password modal (admin only) */}
      {admin && pwdTarget && (
        <PasswordModal
          user={pwdTarget}
          onClose={() => setPwdTarget(null)}
          onSuccess={() => setPwdTarget(null)}
        />
      )}

      <div className="card basic-data-table">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Users</h5>
          <Link to="/user-add" className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1">
            <Icon icon="ic:round-plus" className="text-xl" />
            Add User
          </Link>
        </div>

        {error && <div className="card-body pb-0"><div className="alert alert-danger">{error}</div></div>}

        <div className="card-body pb-0">
          <div className="row g-2 align-items-end">
            <div className="col-sm-6 col-md-3">
              <label className="form-label text-sm fw-semibold text-primary-light mb-4">Username</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control radius-8 ps-36"
                  placeholder="Search username"
                  value={filterUsername}
                  onChange={(e) => { setFilterUsername(e.target.value); setPage(1); }}
                />
                <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light" style={{ left: 10, pointerEvents: "none" }} />
              </div>
            </div>

            <div className="col-sm-6 col-md-3">
              <label className="form-label text-sm fw-semibold text-primary-light mb-4">Full Name</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control radius-8 ps-36"
                  placeholder="Search full name"
                  value={filterFullName}
                  onChange={(e) => { setFilterFullName(e.target.value); setPage(1); }}
                />
                <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light" style={{ left: 10, pointerEvents: "none" }} />
              </div>
            </div>

            <div className="col-sm-6 col-md-3">
              <label className="form-label text-sm fw-semibold text-primary-light mb-4">Email</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control radius-8 ps-36"
                  placeholder="Search email"
                  value={filterEmail}
                  onChange={(e) => { setFilterEmail(e.target.value); setPage(1); }}
                />
                <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light" style={{ left: 10, pointerEvents: "none" }} />
              </div>
            </div>

            <div className="col-sm-auto">
              <label className="form-label text-sm mb-4 d-block invisible">x</label>
              <button
                className="btn btn-outline-secondary radius-8"
                onClick={resetFilters}
                disabled={!hasFilter}
                title="Clear filters"
              >
                <Icon icon="material-symbols:filter-alt-off-outline" />
              </button>
            </div>
          </div>

          {hasFilter && (
            <div className="d-flex flex-wrap gap-2 mt-12 mb-0">
              {filterUsername && (
                <span className="badge bg-primary-100 text-primary-600 radius-4 d-flex align-items-center gap-1">
                  Username: {filterUsername}
                  <Icon icon="material-symbols:close" className="cursor-pointer" onClick={() => { setFilterUsername(""); setPage(1); }} />
                </span>
              )}
              {filterFullName && (
                <span className="badge bg-info-focus text-info-main radius-4 d-flex align-items-center gap-1">
                  Full Name: {filterFullName}
                  <Icon icon="material-symbols:close" className="cursor-pointer" onClick={() => { setFilterFullName(""); setPage(1); }} />
                </span>
              )}
              {filterEmail && (
                <span className="badge bg-success-focus text-success-main radius-4 d-flex align-items-center gap-1">
                  Email: {filterEmail}
                  <Icon icon="material-symbols:close" className="cursor-pointer" onClick={() => { setFilterEmail(""); setPage(1); }} />
                </span>
              )}
              <span className="text-secondary-light text-sm align-self-center">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="card-body">
          {filtered.length === 0 ? (
            <div className="text-center py-40">
              <p className="text-secondary-light">
                {hasFilter ? "No users match the current filters." : "No users found"}
              </p>
              {hasFilter
                ? <button className="btn btn-sm btn-outline-secondary mt-16" onClick={resetFilters}>Clear Filters</button>
                : <Link to="/user-add" className="btn btn-sm btn-primary mt-16">Add First User</Link>
              }
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

                          {/* Change Password — admin only */}
                          {admin && (
                            <button
                              onClick={() => setPwdTarget(user)}
                              className="w-32-px h-32-px me-8 bg-info-focus text-info-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Change Password"
                            >
                              <Icon icon="solar:lock-password-outline" />
                            </button>
                          )}

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
                total={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default UserListLayer;
