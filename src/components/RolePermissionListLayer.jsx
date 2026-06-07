import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { rolePermissionService } from "../api/rolePermission.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import { MODULES } from "../utils/permissions";

const ROLES = ["ADMIN", "TEACHER", "STUDENT"];

const MODULE_LABEL = {
  PROGRAMS:           "Programs",
  COURSES:            "Courses",
  PLO:                "PLO",
  CLO:                "CLO",
  USERS:              "Users",
  ASSESSMENTS:        "Assessments",
  COURSE_ASSIGNMENTS: "Course Assignments",
  REPORTS:            "Reports",
};

const MODULE_ICON = {
  PROGRAMS:           "solar:book-outline",
  COURSES:            "solar:notebook-outline",
  PLO:                "solar:diploma-outline",
  CLO:                "solar:clipboard-list-outline",
  USERS:              "solar:users-group-rounded-outline",
  ASSESSMENTS:        "solar:document-text-outline",
  COURSE_ASSIGNMENTS: "solar:bookmark-square-minimalistic-outline",
  REPORTS:            "solar:chart-2-outline",
};

const emptyRow = (module) => ({ module, can_view: false, can_create: false, can_edit: false, can_delete: false });

const CheckCell = ({ checked, onChange, disabled }) => (
  <td className="text-center" style={{ verticalAlign: "middle" }}>
    <div className="form-check d-flex justify-content-center mb-0">
      <input
        type="checkbox"
        className="form-check-input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ width: 18, height: 18, cursor: disabled ? "not-allowed" : "pointer" }}
      />
    </div>
  </td>
);

const RolePermissionListLayer = () => {
  const [activeRole, setActiveRole] = useState("TEACHER");
  const [matrix, setMatrix]         = useState({}); // { MODULE: { can_view, can_create, can_edit, can_delete, id? } }
  const [loading, setLoading]       = useState(false);
  const [saving,  setSaving]        = useState(false);
  const [dirty,   setDirty]         = useState(false);

  const isAdmin = activeRole === "ADMIN";

  const fetchPermissions = useCallback(async (role) => {
    setLoading(true);
    setDirty(false);
    try {
      const data = await rolePermissionService.getByRole(role);
      const list = data?.result || data?.results || (Array.isArray(data) ? data : []);
      const map  = {};
      MODULES.forEach((m) => { map[m] = emptyRow(m); });
      list.forEach((p) => {
        if (p.module) map[p.module] = { ...emptyRow(p.module), ...p };
      });
      setMatrix(map);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) fetchPermissions(activeRole);
    else {
      // ADMIN — all permissions true by default (display only)
      const map = {};
      MODULES.forEach((m) => { map[m] = { module: m, can_view: true, can_create: true, can_edit: true, can_delete: true }; });
      setMatrix(map);
      setDirty(false);
    }
  }, [activeRole, isAdmin, fetchPermissions]);

  const toggle = (module, field) => {
    if (isAdmin) return;
    setMatrix((prev) => ({
      ...prev,
      [module]: { ...prev[module], [field]: !prev[module][field] },
    }));
    setDirty(true);
  };

  const setAll = (field, value) => {
    if (isAdmin) return;
    setMatrix((prev) => {
      const next = { ...prev };
      MODULES.forEach((m) => { next[m] = { ...next[m], [field]: value }; });
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (isAdmin) return;
    setSaving(true);
    try {
      const permissions = MODULES.map((m) => ({
        module:     m,
        can_view:   matrix[m]?.can_view   ?? false,
        can_create: matrix[m]?.can_create ?? false,
        can_edit:   matrix[m]?.can_edit   ?? false,
        can_delete: matrix[m]?.can_delete ?? false,
      }));
      const res = await rolePermissionService.setBulk({ role: activeRole, permissions });
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Save failed"); return; }
      showSuccess(res?.status?.message || `${activeRole} permissions saved`);
      setDirty(false);
      // refresh to get ids
      fetchPermissions(activeRole);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const allChecked = (field) => MODULES.every((m) => matrix[m]?.[field]);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">Role Permissions</h5>
        {!isAdmin && dirty && (
          <button className="btn btn-primary radius-8 d-inline-flex align-items-center gap-1" onClick={handleSave} disabled={saving}>
            <Icon icon={saving ? "svg-spinners:180-ring" : "material-symbols:save-outline"} className="text-xl" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>

      {/* Role Tabs */}
      <div className="card-body pb-0">
        <ul className="nav nav-pills d-inline-flex border radius-8 p-4 gap-2 mb-0">
          {ROLES.map((role) => (
            <li key={role} className="nav-item">
              <button
                type="button"
                className={`nav-link px-20 py-8 radius-6 fw-medium ${activeRole === role ? "active bg-primary-600 text-white" : "text-secondary-light"}`}
                onClick={() => setActiveRole(role)}
              >
                {role}
                {role === "ADMIN" && (
                  <span className="badge bg-danger-focus text-danger-main ms-8 radius-4 text-xs">Full Access</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Admin notice */}
      {isAdmin && (
        <div className="card-body pb-0">
          <div className="alert alert-info d-flex align-items-center gap-2 radius-8 mb-0">
            <Icon icon="solar:shield-check-outline" className="text-xl flex-shrink-0" />
            <span>ADMIN role always has full access to all modules. Permissions cannot be restricted.</span>
          </div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">
            <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
            <p className="text-secondary-light mt-12">Loading permissions…</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table bordered-table mb-0" style={{ minWidth: 600 }}>
              <thead>
                <tr className="bg-base">
                  <th style={{ minWidth: 200 }}>Module</th>
                  <th className="text-center">
                    <div>View</div>
                    {!isAdmin && (
                      <input type="checkbox" className="form-check-input mt-4"
                        checked={allChecked("can_view")}
                        onChange={(e) => setAll("can_view", e.target.checked)}
                        title="Toggle all"
                        style={{ width: 14, height: 14, cursor: "pointer" }}
                      />
                    )}
                  </th>
                  <th className="text-center">
                    <div>Create</div>
                    {!isAdmin && (
                      <input type="checkbox" className="form-check-input mt-4"
                        checked={allChecked("can_create")}
                        onChange={(e) => setAll("can_create", e.target.checked)}
                        title="Toggle all"
                        style={{ width: 14, height: 14, cursor: "pointer" }}
                      />
                    )}
                  </th>
                  <th className="text-center">
                    <div>Edit</div>
                    {!isAdmin && (
                      <input type="checkbox" className="form-check-input mt-4"
                        checked={allChecked("can_edit")}
                        onChange={(e) => setAll("can_edit", e.target.checked)}
                        title="Toggle all"
                        style={{ width: 14, height: 14, cursor: "pointer" }}
                      />
                    )}
                  </th>
                  <th className="text-center">
                    <div>Delete</div>
                    {!isAdmin && (
                      <input type="checkbox" className="form-check-input mt-4"
                        checked={allChecked("can_delete")}
                        onChange={(e) => setAll("can_delete", e.target.checked)}
                        title="Toggle all"
                        style={{ width: 14, height: 14, cursor: "pointer" }}
                      />
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((module) => {
                  const perm = matrix[module] || emptyRow(module);
                  return (
                    <tr key={module}>
                      <td>
                        <div className="d-flex align-items-center gap-8">
                          <div className="w-32-px h-32-px bg-primary-100 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0">
                            <Icon icon={MODULE_ICON[module] || "solar:document-outline"} className="text-primary-600" />
                          </div>
                          <span className="fw-medium">{MODULE_LABEL[module]}</span>
                        </div>
                      </td>
                      <CheckCell checked={perm.can_view}   onChange={() => toggle(module, "can_view")}   disabled={isAdmin} />
                      <CheckCell checked={perm.can_create} onChange={() => toggle(module, "can_create")} disabled={isAdmin} />
                      <CheckCell checked={perm.can_edit}   onChange={() => toggle(module, "can_edit")}   disabled={isAdmin} />
                      <CheckCell checked={perm.can_delete} onChange={() => toggle(module, "can_delete")} disabled={isAdmin} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom save bar */}
        {!isAdmin && !loading && (
          <div className="d-flex justify-content-between align-items-center mt-20 pt-16 border-top">
            <span className="text-secondary-light text-sm">
              {dirty
                ? <span className="text-warning-main"><Icon icon="material-symbols:circle" className="me-4" style={{ fontSize: 8 }} />Unsaved changes</span>
                : <span className="text-success-main"><Icon icon="material-symbols:check-circle-outline" className="me-4" />Saved</span>
              }
            </span>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary radius-8"
                onClick={() => fetchPermissions(activeRole)} disabled={saving}>
                <Icon icon="material-symbols:refresh" className="me-4" /> Discard
              </button>
              <button className="btn btn-primary radius-8" onClick={handleSave} disabled={saving || !dirty}>
                <Icon icon={saving ? "svg-spinners:180-ring" : "material-symbols:save-outline"} className="me-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolePermissionListLayer;
