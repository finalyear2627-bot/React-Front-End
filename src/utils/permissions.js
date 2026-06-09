const MODULES = ["PROGRAMS", "SEMESTERS", "COURSES", "PLO", "CLO", "USERS", "ASSESSMENTS", "QUIZZES", "ASSIGNMENTS", "COURSE_ASSIGNMENTS", "REPORTS"];

export { MODULES };

// Default view modules when no permissions have been configured yet for a role
const TEACHER_DEFAULT_VIEW   = ["PROGRAMS", "SEMESTERS", "COURSES", "PLO", "CLO", "ASSESSMENTS", "QUIZZES", "ASSIGNMENTS", "COURSE_ASSIGNMENTS", "REPORTS"];
const TEACHER_DEFAULT_CREATE = ["ASSESSMENTS", "QUIZZES", "ASSIGNMENTS"];
const TEACHER_DEFAULT_EDIT   = ["ASSESSMENTS", "QUIZZES", "ASSIGNMENTS"];
const STUDENT_DEFAULT_VIEW   = ["PROGRAMS", "SEMESTERS", "COURSES", "COURSE_ASSIGNMENTS"];

// --- storage helpers ---

export const savePermissions = (permissionsArray) => {
  const map = {};
  MODULES.forEach((m) => {
    map[m] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
  });
  (permissionsArray || []).forEach((p) => {
    if (p.module) map[p.module] = { ...map[p.module], ...p };
  });
  localStorage.setItem("role_permissions", JSON.stringify(map));
};

export const clearPermissions = () => localStorage.removeItem("role_permissions");

const getMap = () => {
  try { return JSON.parse(localStorage.getItem("role_permissions") || "{}"); }
  catch { return {}; }
};

const isAdmin   = () => localStorage.getItem("user_role") === "ADMIN";
const isTeacher = () => localStorage.getItem("user_role") === "TEACHER";
const isStudent = () => localStorage.getItem("user_role") === "STUDENT";

// Returns true if at least one module has an explicit permission saved
const hasConfiguredPermissions = (map) =>
  Object.values(map).some((p) => p.can_view === true || p.can_create === true);

export const canView = (module) => {
  if (isAdmin()) return true;
  const map = getMap();
  if (!hasConfiguredPermissions(map)) {
    if (isTeacher()) return TEACHER_DEFAULT_VIEW.includes(module);
    if (isStudent()) return STUDENT_DEFAULT_VIEW.includes(module);
  }
  return map[module]?.can_view === true;
};

export const canCreate = (module) => {
  if (isAdmin()) return true;
  const map = getMap();
  if (!hasConfiguredPermissions(map)) {
    if (isTeacher()) return TEACHER_DEFAULT_CREATE.includes(module);
    return false;
  }
  return map[module]?.can_create === true;
};

export const canEdit = (module) => {
  if (isAdmin()) return true;
  const map = getMap();
  if (!hasConfiguredPermissions(map)) {
    if (isTeacher()) return TEACHER_DEFAULT_EDIT.includes(module);
    return false;
  }
  return map[module]?.can_edit === true;
};

export const canDelete = (module) => {
  if (isAdmin()) return true;
  const map = getMap();
  if (!hasConfiguredPermissions(map)) return false;
  return map[module]?.can_delete === true;
};

// Returns the full permission object for one module
export const getModulePerms = (module) =>
  getMap()[module] || { can_view: false, can_create: false, can_edit: false, can_delete: false };

// Returns the full map
export const getAllPerms = () => getMap();