import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { rolePermissionService } from "../api/rolePermission.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const Check = ({ value }) => (
  <Icon
    icon={value ? "material-symbols:check-circle" : "material-symbols:cancel"}
    className={value ? "text-success-main" : "text-danger-main"}
    style={{ fontSize: 18 }}
  />
);

const RolePermissionListLayer = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { fetchPermissions(); }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await rolePermissionService.getAllRolePermissions();
      setPermissions(Array.isArray(data) ? data : data.result || data.results || []);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load role permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (perm) => {
    setTogglingId(perm.id);
    try {
      const isActive = perm.is_active;
      const res = isActive
        ? await rolePermissionService.deactivateRolePermission(perm.id)
        : await rolePermissionService.activateRolePermission(perm.id);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Action failed");
        return;
      }
      showSuccess(res?.status?.message || `Role permission ${isActive ? "deactivated" : "activated"}`);
      setPermissions((prev) => prev.map((p) => p.id === perm.id ? { ...p, is_active: !isActive } : p));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role permission?")) {
      try {
        const res = await rolePermissionService.deleteRolePermission(id);
        setPermissions((prev) => prev.filter((p) => p.id !== id));
        showSuccess(res?.status?.message || "Role permission deleted");
      } catch (err) {
        showError(getApiError(err));
      }
    }
  };

  const paginated = permissions.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Role Permissions</h5>
        <Link to="/role-permission-add" className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1">
          <Icon icon="ic:round-plus" className="text-xl" />
          Add Role Permission
        </Link>
      </div>

      {error && <div className="card-body pb-0"><div className="alert alert-danger">{error}</div></div>}

      <div className="card-body">
        {permissions.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No role permissions found</p>
            <Link to="/role-permission-add" className="btn btn-sm btn-primary mt-16">Add First Role Permission</Link>
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Role</th>
                    <th>Users</th>
                    <th>Programs</th>
                    <th>Courses</th>
                    <th>Assessments</th>
                    <th>Reports</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((perm, index) => (
                    <tr key={perm.id || index}>
                      <td>{perm.id}</td>
                      <td>
                        <span className="badge bg-primary-100 text-primary-600 radius-4 fw-semibold">
                          {perm.role || "N/A"}
                        </span>
                      </td>
                      <td><Check value={perm.can_manage_users} /></td>
                      <td><Check value={perm.can_manage_programs} /></td>
                      <td><Check value={perm.can_manage_courses} /></td>
                      <td><Check value={perm.can_manage_assessments} /></td>
                      <td><Check value={perm.can_view_reports} /></td>
                      <td>
                        <span className={`badge radius-4 ${perm.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                          {perm.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/role-permission-edit/${perm.id}`}
                          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(perm)}
                          disabled={togglingId === perm.id}
                          className={`w-32-px h-32-px me-8 rounded-circle d-inline-flex align-items-center justify-content-center border-0 ${perm.is_active ? "bg-warning-focus text-warning-main" : "bg-success-focus text-success-main"}`}
                          title={perm.is_active ? "Deactivate" : "Activate"}
                        >
                          {togglingId === perm.id
                            ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                            : <Icon icon={perm.is_active ? "mingcute:pause-circle-line" : "mingcute:play-circle-line"} />
                          }
                        </button>
                        <button
                          onClick={() => handleDelete(perm.id)}
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
              total={permissions.length}
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

export default RolePermissionListLayer;