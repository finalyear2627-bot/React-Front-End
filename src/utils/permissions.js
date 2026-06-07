const MODULES = ["PROGRAMS", "COURSES", "PLO", "CLO", "USERS", "ASSESSMENTS", "COURSE_ASSIGNMENTS", "REPORTS"];

export { MODULES };

// --- storage helpers ---

export const savePermissions = (permissionsArray) => {
  // Store as { MODULE: { can_view, can_create, can_edit, can_delete, id? } }
  const map = {};
  MODULES.forEach((m) => {
    map[m] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
  });
  (permissionsArray || []).forEach((p) => {
    if (p.module) map[p.module] = p;
  });
  localStorage.setItem("role_permissions", JSON.stringify(map));
};

export const clearPermissions = () => localStorage.removeItem("role_permissions");

const getMap = () => {
  try { return JSON.parse(localStorage.getItem("role_permissions") || "{}"); }
  catch { return {}; }
};

// ADMIN bypasses all checks
const isAdmin = () => localStorage.getItem("user_role") === "ADMIN";

export const canView   = (module) => isAdmin() || getMap()[module]?.can_view   === true;
export const canCreate = (module) => isAdmin() || getMap()[module]?.can_create === true;
export const canEdit   = (module) => isAdmin() || getMap()[module]?.can_edit   === true;
export const canDelete = (module) => isAdmin() || getMap()[module]?.can_delete === true;

// Returns the full permission object for one module
export const getModulePerms = (module) => getMap()[module] || { can_view: false, can_create: false, can_edit: false, can_delete: false };

// Returns the full map
export const getAllPerms = () => getMap();
