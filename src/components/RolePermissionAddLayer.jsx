import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { rolePermissionService } from "../api/rolePermission.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const ROLES = ["ADMIN", "TEACHER", "STUDENT"];

const PERM_FIELDS = [
  { key: "can_manage_users",       label: "Manage Users" },
  { key: "can_manage_programs",    label: "Manage Programs" },
  { key: "can_manage_courses",     label: "Manage Courses" },
  { key: "can_manage_assessments", label: "Manage Assessments" },
  { key: "can_view_reports",       label: "View Reports" },
];

const RolePermissionAddLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "TEACHER",
    can_manage_users:       false,
    can_manage_programs:    false,
    can_manage_courses:     true,
    can_manage_assessments: true,
    can_view_reports:       true,
    is_active:              true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await rolePermissionService.createRolePermission(formData);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Failed to create role permission");
        return;
      }
      showSuccess(res?.status?.message || "Role permission created successfully");
      navigate("/role-permissions");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Add Role Permission</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Role <span className="text-danger-600">*</span>
                    </label>
                    <select className="form-control radius-8" name="role" value={formData.role} onChange={handleChange} required>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-12">Permissions</label>
                    <div className="d-flex flex-column gap-12 ps-4">
                      {PERM_FIELDS.map(({ key, label }) => (
                        <div key={key} className="form-check d-flex align-items-center gap-8">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={key}
                            name={key}
                            checked={formData[key]}
                            onChange={handleChange}
                          />
                          <label className="form-check-label text-secondary-light" htmlFor={key}>{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-20">
                    <div className="form-check d-flex align-items-center gap-8">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <label className="form-check-label fw-semibold text-primary-light" htmlFor="is_active">Active</label>
                    </div>
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button type="submit" className="btn btn-primary radius-8 py-10 flex-grow-1" disabled={loading}>
                      {loading ? "Creating..." : "Create Role Permission"}
                    </button>
                    <button type="button" onClick={() => navigate("/role-permissions")} className="btn btn-outline-secondary radius-8 py-10 flex-grow-1">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionAddLayer;