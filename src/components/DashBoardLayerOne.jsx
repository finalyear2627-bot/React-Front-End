import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { dashboardService } from "../api/dashboard.service";
import { showError, getApiError } from "../utils/toast";

// ─── helpers ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, gradient, iconBg, loading }) => (
  <div className="col">
    <div className={`card shadow-none border ${gradient} h-100`}>
      <div className="card-body p-20">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <p className="fw-medium text-primary-light mb-1">{label}</p>
            {loading
              ? <div className="placeholder-glow"><span className="placeholder col-4" style={{ height: 24 }} /></div>
              : <h6 className="mb-0">{value ?? "—"}</h6>}
          </div>
          <div className={`w-50-px h-50-px ${iconBg} rounded-circle d-flex justify-content-center align-items-center`}>
            <Icon icon={icon} className="text-white text-2xl mb-0" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RoleCard = ({ role, count, icon, color, loading }) => (
  <div className="col-sm-4">
    <div className={`card border-0 shadow-none h-100`} style={{ background: `var(--${color}-50, #f8f9fa)` }}>
      <div className="card-body p-20 text-center">
        <div className={`w-56-px h-56-px bg-${color}-100 rounded-circle d-inline-flex align-items-center justify-content-center mb-12`}>
          <Icon icon={icon} className={`text-${color}-600 text-2xl`} />
        </div>
        {loading
          ? <div className="placeholder-glow"><span className="placeholder col-6 d-block mx-auto" style={{ height: 28 }} /></div>
          : <h4 className="fw-bold mb-4">{count ?? 0}</h4>}
        <p className={`text-${color}-600 fw-semibold text-sm mb-0`}>{role}</p>
      </div>
    </div>
  </div>
);

const ProgressBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-16">
      <div className="d-flex justify-content-between align-items-center mb-6">
        <span className="text-sm fw-medium text-primary-light">{label}</span>
        <span className="text-sm fw-semibold">{value} <span className="text-secondary-light fw-normal">({pct}%)</span></span>
      </div>
      <div className="progress radius-4" style={{ height: 8 }}>
        <div
          className={`progress-bar bg-${color}`}
          style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
        />
      </div>
    </div>
  );
};

// ─── Main dashboard ──────────────────────────────────────────────────────────

const DashBoardLayerOne = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const userRole = localStorage.getItem("user_role");
  const firstName = localStorage.getItem("user_first_name") || localStorage.getItem("username") || "there";

  useEffect(() => {
    if (userRole !== "ADMIN") { setLoading(false); return; }
    dashboardService
      .getSummary()
      .then((data) => {
        const s = data?.result?.[0] ?? data?.result ?? data;
        setStats(s);
      })
      .catch((err) => showError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [userRole]);

  // Helper: returns the value only if it's a number, otherwise null (so ?? chains work correctly)
  const n = (v) => (typeof v === "number" ? v : null);

  // Handle both flat format { total_users: 10 } and nested format { users: { total: 10, admin: 2 } }
  const usersObj    = stats?.users     && typeof stats.users     === "object" ? stats.users     : null;
  const semObj      = stats?.semesters && typeof stats.semesters === "object" ? stats.semesters : null;
  const coursesObj  = stats?.courses   && typeof stats.courses   === "object" ? stats.courses   : null;
  const programsObj = stats?.programs  && typeof stats.programs  === "object" ? stats.programs  : null;

  const totalUsers    = n(usersObj?.total)    ?? n(stats?.total_users)    ?? n(stats?.users_total)    ?? 0;
  const totalAdmins   = n(usersObj?.admin)    ?? n(stats?.total_admins)   ?? n(stats?.admin_count)    ?? n(stats?.admins)   ?? 0;
  const totalTeachers = n(usersObj?.teacher)  ?? n(stats?.total_teachers) ?? n(stats?.teacher_count)  ?? n(stats?.teachers) ?? 0;
  const totalStudents = n(usersObj?.student)  ?? n(stats?.total_students) ?? n(stats?.student_count)  ?? n(stats?.students) ?? 0;

  const totalPrograms = n(programsObj?.total) ?? n(stats?.programs) ?? n(stats?.total_programs) ?? n(stats?.programs_total) ?? 0;
  const totalCourses    = n(coursesObj?.total)    ?? n(stats?.total_courses)    ?? n(stats?.courses_total)    ?? 0;
  const activeCourses   = n(coursesObj?.active)   ?? n(stats?.active_courses)   ?? n(stats?.courses_active)   ?? 0;
  const inactiveCourses = n(coursesObj?.inactive) ?? n(stats?.inactive_courses) ?? n(stats?.courses_inactive) ?? 0;

  const totalSemesters   = n(semObj?.total)    ?? n(stats?.total_semesters)  ?? n(stats?.semesters_total)  ?? 0;
  const activeSemesters  = n(semObj?.active)   ?? n(stats?.active_semesters) ?? n(stats?.semesters_active) ?? 0;
  const totalAssignments = n(stats?.course_assignments) ?? n(stats?.total_assignments) ?? 0;
  const totalPLOs        = n(stats?.plo_count) ?? n(stats?.total_plos) ?? n(stats?.plos_total) ?? 0;
  const totalCLOs        = n(stats?.clo_count) ?? n(stats?.total_clos) ?? n(stats?.clos_total) ?? 0;

  // ── Non-admin dashboard ─────────────────────────────────────────────────────
  if (userRole !== "ADMIN") {
    const roleColor  = userRole === "TEACHER" ? "#7c3aed" : "#0ea5e9";
    const roleLinks  = [
      { to: "/my-courses",          icon: "solar:notebook-outline",                        label: "My Courses",          desc: "View courses assigned to you"         },
      { to: "/course-assignments",  icon: "solar:bookmark-square-minimalistic-outline",    label: "Course Assignments",  desc: "See all course assignments"            },
      { to: "/courses",             icon: "solar:notebook-outline",                        label: "All Courses",         desc: "Browse available courses"             },
      { to: "/programs",            icon: "solar:book-outline",                            label: "Programs",            desc: "View programs"                        },
      { to: "/semesters",           icon: "solar:calendar-outline",                        label: "Semesters",           desc: "View semesters"                       },
      { to: "/view-profile",        icon: "solar:user-outline",                            label: "My Profile",          desc: "Update your profile"                  },
    ];
    return (
      <div>
        {/* Welcome banner */}
        <div className="card border-0 mb-24" style={{ background: `linear-gradient(135deg, #1a3a6e 0%, ${roleColor} 100%)` }}>
          <div className="card-body p-24 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h5 className="text-white mb-4">Welcome back, {firstName}!</h5>
              <p className="text-white mb-0" style={{ opacity: 0.85 }}>Smart Assessment System</p>
            </div>
            <span className="badge px-16 py-8 radius-8 fw-semibold text-sm"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              <Icon icon="solar:shield-keyhole-outline" className="me-4" />
              {userRole}
            </span>
          </div>
        </div>

        {/* Quick access cards */}
        <div className="row gy-4">
          {roleLinks.map((link) => (
            <div key={link.to} className="col-xl-4 col-md-6">
              <Link to={link.to} className="card h-100 text-decoration-none border"
                style={{ transition: "box-shadow 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                <div className="card-body p-20 d-flex align-items-center gap-16">
                  <div className="w-56-px h-56-px bg-primary-100 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0">
                    <Icon icon={link.icon} className="text-primary-600 text-2xl" />
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-4 text-primary-light">{link.label}</h6>
                    <p className="text-secondary-light text-sm mb-0">{link.desc}</p>
                  </div>
                  <Icon icon="ep:arrow-right" className="ms-auto text-secondary-light" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Admin dashboard ──────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Welcome banner ── */}
      <div className="card border-0 mb-24" style={{ background: "linear-gradient(135deg, #1a3a6e 0%, #4361ee 100%)" }}>
        <div className="card-body p-24 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h5 className="text-white mb-4">Welcome back, {firstName}! 👋</h5>
            <p className="text-white mb-0" style={{ opacity: 0.85 }}>
              Here's what's happening in your Smart Assessment system today.
            </p>
          </div>
          <span className="badge px-16 py-8 radius-8 fw-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
            <Icon icon="solar:shield-keyhole-outline" className="me-4" />
            {userRole}
          </span>
        </div>
      </div>

      {/* ── Top stat cards ── */}
      <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4 mb-24">
        <StatCard label="Total Users"       value={totalUsers}    icon="gridicons:multiple-users"         gradient="bg-gradient-start-1" iconBg="bg-cyan"          loading={loading} />
        <StatCard label="Total Programs"    value={totalPrograms} icon="solar:book-outline"               gradient="bg-gradient-start-2" iconBg="bg-purple"        loading={loading} />
        <StatCard label="Total Courses"     value={totalCourses}  icon="solar:notebook-outline"           gradient="bg-gradient-start-3" iconBg="bg-info"          loading={loading} />
        <StatCard label="Active Courses"    value={activeCourses} icon="mingcute:play-circle-line"        gradient="bg-gradient-start-4" iconBg="bg-success-main"  loading={loading} />
        <StatCard label="Inactive Courses"  value={inactiveCourses} icon="mingcute:pause-circle-line"    gradient="bg-gradient-start-5" iconBg="bg-red"           loading={loading} />
      </div>

      {/* ── Second row: Users breakdown + Course status + Semesters ── */}
      <div className="row gy-4 mb-24">

        {/* Users by Role */}
        <div className="col-xl-5 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Users by Role</h6>
              {userRole === "ADMIN" && (
                <Link to="/users" className="text-primary-600 text-sm fw-semibold">
                  View All <Icon icon="ep:arrow-right" className="ms-4" />
                </Link>
              )}
            </div>
            <div className="card-body">
              <div className="row g-3 mb-20">
                <RoleCard role="Admins"   count={totalAdmins}   icon="solar:shield-user-outline"      color="danger"  loading={loading} />
                <RoleCard role="Teachers" count={totalTeachers} icon="solar:graduation-cap-outline"   color="primary" loading={loading} />
                <RoleCard role="Students" count={totalStudents} icon="solar:user-outline"              color="success" loading={loading} />
              </div>

              <div className="pt-16 border-top">
                <ProgressBar label="Admins"   value={totalAdmins}   total={totalUsers} color="danger"       />
                <ProgressBar label="Teachers" value={totalTeachers} total={totalUsers} color="primary-600"  />
                <ProgressBar label="Students" value={totalStudents} total={totalUsers} color="success-main" />
              </div>
            </div>
          </div>
        </div>

        {/* Course Status */}
        <div className="col-xl-4 col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Course Status</h6>
              {userRole === "ADMIN" && (
                <Link to="/courses" className="text-primary-600 text-sm fw-semibold">
                  View All <Icon icon="ep:arrow-right" className="ms-4" />
                </Link>
              )}
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              {/* Donut-style ring using conic-gradient */}
              {!loading && totalCourses > 0 && (
                <div className="text-center mb-20">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 120, height: 120,
                      background: `conic-gradient(
                        #22c55e 0% ${(activeCourses / totalCourses) * 100}%,
                        #ef4444 ${(activeCourses / totalCourses) * 100}% 100%
                      )`,
                    }}
                  >
                    <div className="rounded-circle bg-white d-flex flex-column align-items-center justify-content-center"
                      style={{ width: 80, height: 80 }}>
                      <span className="fw-bold text-lg">{totalCourses}</span>
                      <span className="text-secondary-light" style={{ fontSize: 10 }}>Total</span>
                    </div>
                  </div>
                </div>
              )}

              <ProgressBar label="Active"   value={activeCourses}   total={totalCourses} color="success-main" />
              <ProgressBar label="Inactive" value={inactiveCourses} total={totalCourses} color="danger"       />

              <div className="row g-3 mt-4">
                <div className="col-6">
                  <div className="p-12 bg-success-focus radius-8 text-center">
                    {loading
                      ? <div className="placeholder-glow"><span className="placeholder col-6 d-block mx-auto" /></div>
                      : <h5 className="text-success-main fw-bold mb-4">{activeCourses}</h5>}
                    <p className="text-secondary-light text-sm mb-0">Active</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-12 bg-danger-focus radius-8 text-center">
                    {loading
                      ? <div className="placeholder-glow"><span className="placeholder col-6 d-block mx-auto" /></div>
                      : <h5 className="text-danger-main fw-bold mb-4">{inactiveCourses}</h5>}
                    <p className="text-secondary-light text-sm mb-0">Inactive</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-xl-3 col-lg-12">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Quick Links</h6>
            </div>
            <div className="card-body p-16">
              {[
                { to: "/programs",          icon: "solar:book-outline",                    label: "Programs",          color: "primary" },
                { to: "/semesters",         icon: "solar:calendar-outline",               label: "Semesters",         color: "info"    },
                { to: "/courses",           icon: "solar:notebook-outline",               label: "Courses",           color: "success" },
                { to: "/course-assignments",icon: "solar:bookmark-square-minimalistic-outline", label: "Assignments",  color: "warning" },
                ...(userRole === "ADMIN" ? [
                  { to: "/users",           icon: "solar:users-group-rounded-outline",     label: "Users",             color: "danger"  },
                  { to: "/plos",            icon: "solar:diploma-outline",                 label: "PLOs",              color: "purple"  },
                  { to: "/clos",            icon: "solar:clipboard-list-outline",          label: "CLOs",              color: "cyan"    },
                  { to: "/clo-plo-generator", icon: "solar:magic-stick-3-outline",         label: "CLO-PLO Generator", color: "primary" },
                ] : []),
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="d-flex align-items-center gap-12 p-10 radius-8 mb-8 text-decoration-none"
                  style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div className={`w-32-px h-32-px bg-${link.color}-100 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0`}>
                    <Icon icon={link.icon} className={`text-${link.color}-600 text-sm`} />
                  </div>
                  <span className="text-sm fw-medium text-primary-light">{link.label}</span>
                  <Icon icon="ep:arrow-right" className="ms-auto text-secondary-light text-xs" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Third row: extra stats ── */}
      <div className="row gy-4">

        {/* Semesters */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Semesters</h6>
              <Link to="/semesters" className="text-primary-600 text-sm fw-semibold">
                View <Icon icon="ep:arrow-right" className="ms-4" />
              </Link>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center gap-16 mb-16">
                <div className="w-56-px h-56-px bg-primary-100 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0">
                  <Icon icon="solar:calendar-outline" className="text-primary-600 text-2xl" />
                </div>
                <div>
                  {loading
                    ? <div className="placeholder-glow"><span className="placeholder col-8 d-block" style={{ height: 28 }} /></div>
                    : <h4 className="fw-bold mb-4">{totalSemesters}</h4>}
                  <p className="text-secondary-light text-sm mb-0">Total Semesters</p>
                </div>
              </div>
              <ProgressBar label="Active Semesters" value={activeSemesters} total={totalSemesters} color="primary-600" />
              <ProgressBar label="Inactive Semesters" value={totalSemesters - activeSemesters} total={totalSemesters} color="secondary" />
            </div>
          </div>
        </div>

        {/* Course Assignments */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Course Assignments</h6>
              <Link to="/course-assignments" className="text-primary-600 text-sm fw-semibold">
                View <Icon icon="ep:arrow-right" className="ms-4" />
              </Link>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center py-32">
              <div className="w-72-px h-72-px bg-warning-focus rounded-circle d-inline-flex align-items-center justify-content-center mb-16">
                <Icon icon="solar:bookmark-square-minimalistic-outline" className="text-warning-main text-3xl" />
              </div>
              {loading
                ? <div className="placeholder-glow"><span className="placeholder col-8 d-block" style={{ height: 36 }} /></div>
                : <h3 className="fw-bold mb-4">{totalAssignments}</h3>}
              <p className="text-secondary-light text-sm mb-0">Total Assignments</p>
            </div>
          </div>
        </div>

        {/* PLOs & CLOs — admin only */}
        {userRole === "ADMIN" && (
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="card-title mb-0">Learning Outcomes</h6>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center gap-16 p-16 bg-primary-50 radius-8 mb-12">
                  <div className="w-48-px h-48-px bg-primary-100 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0">
                    <Icon icon="solar:diploma-outline" className="text-primary-600 text-xl" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-secondary-light text-sm mb-2">Program Learning Outcomes</p>
                    {loading
                      ? <div className="placeholder-glow"><span className="placeholder col-6 d-block" style={{ height: 24 }} /></div>
                      : <h5 className="fw-bold mb-0">{totalPLOs}</h5>}
                  </div>
                  <Link to="/plos" className="btn btn-sm btn-outline-primary radius-8">View</Link>
                </div>

                <div className="d-flex align-items-center gap-16 p-16 bg-info-focus radius-8">
                  <div className="w-48-px h-48-px bg-info-100 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0">
                    <Icon icon="solar:clipboard-list-outline" className="text-info-main text-xl" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-secondary-light text-sm mb-2">Course Learning Outcomes</p>
                    {loading
                      ? <div className="placeholder-glow"><span className="placeholder col-6 d-block" style={{ height: 24 }} /></div>
                      : <h5 className="fw-bold mb-0">{totalCLOs}</h5>}
                  </div>
                  <Link to="/clos" className="btn btn-sm btn-outline-info radius-8">View</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* For non-admin, show a 4th summary card */}
        {userRole !== "ADMIN" && (
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="card-title mb-0">My Courses</h6>
              </div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-32">
                <div className="w-72-px h-72-px bg-success-focus rounded-circle d-inline-flex align-items-center justify-content-center mb-16">
                  <Icon icon="solar:notebook-outline" className="text-success-main text-3xl" />
                </div>
                <p className="text-secondary-light text-sm text-center mb-16">View courses assigned to you</p>
                <Link to="/my-courses" className="btn btn-sm btn-primary radius-8">
                  My Courses <Icon icon="ep:arrow-right" className="ms-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashBoardLayerOne;