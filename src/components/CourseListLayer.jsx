import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseService } from "../api/course.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";
import { canView } from "../utils/permissions";

const CourseListLayer = () => {
  const userRole = localStorage.getItem("user_role");

  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error,      setError]      = useState("");
  const [permDenied, setPermDenied] = useState(false);

  // filters
  const [search,      setSearch]      = useState("");
  const [filterCode,  setFilterCode]  = useState("");
  const [filterType,  setFilterType]  = useState("");
  const [filterClass, setFilterClass] = useState("");

  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(Array.isArray(data) ? data : data.result || data.results || []);
      setError("");
    } catch (err) {
      if (err?.response?.status === 403) {
        setPermDenied(true);
      } else {
        showError(getApiError(err));
        setError("Failed to load courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (course) => {
    setTogglingId(course.id);
    try {
      const isActive = course.is_active;
      const res = isActive
        ? await courseService.deactivateCourse(course.id)
        : await courseService.activateCourse(course.id);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Action failed");
        return;
      }
      showSuccess(res?.status?.message || `Course ${isActive ? "deactivated" : "activated"} successfully`);
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_active: !isActive } : c));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const res = await courseService.deleteCourse(id);
        setCourses((prev) => prev.filter((c) => c.id !== id));
        showSuccess(res?.status?.message || "Course deleted successfully");
      } catch (err) {
        showError(getApiError(err));
      }
    }
  };

  const resetFilters = () => {
    setSearch(""); setFilterCode(""); setFilterType(""); setFilterClass("");
    setPage(1);
  };

  const hasFilter = search || filterCode || filterType || filterClass;

  // apply all filters
  const filtered = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    if (q && !(
      (c.name || "").toLowerCase().includes(q) ||
      (c.code || "").toLowerCase().includes(q) ||
      String(c.semester || "").includes(q)
    )) return false;
    if (filterCode  && !(c.code        || "").toLowerCase().includes(filterCode.trim().toLowerCase())) return false;
    if (filterType  && c.course_type  !== filterType)  return false;
    if (filterClass && c.course_class !== filterClass) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (permDenied || !canView("COURSES")) {
    return (
      <div className="card">
        <div className="card-body text-center py-40">
          <Icon icon="solar:lock-outline" style={{ fontSize: 48 }} className="text-secondary-light mb-16" />
          <p className="text-secondary-light mb-0">You don't have permission to view courses.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card basic-data-table">
      {/* ── Header ── */}
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">Courses</h5>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {userRole === "ADMIN" && (
            <Link to="/course-bulk-upload" className="btn btn-sm btn-outline-primary radius-8 d-inline-flex align-items-center gap-1">
              <Icon icon="vscode-icons:file-type-excel" className="text-lg" />
              Bulk Upload
            </Link>
          )}
          {userRole === "ADMIN" && (
            <Link to="/course-add" className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1">
              <Icon icon="ic:round-plus" className="text-xl" />
              Add Course
            </Link>
          )}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="card-body pb-0">
        <div className="row g-2 align-items-end">
          {/* Name / Semester search */}
          <div className="col-sm-4 col-md-3">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Name / Semester</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control radius-8 ps-36"
                placeholder="Search name or sem…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light" style={{ left: 10, pointerEvents: "none" }} />
            </div>
          </div>

          {/* Code search */}
          <div className="col-sm-4 col-md-2">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Code</label>
            <input
              type="text"
              className="form-control radius-8"
              placeholder="e.g. CS101"
              value={filterCode}
              onChange={(e) => { setFilterCode(e.target.value); setPage(1); }}
            />
          </div>

          {/* Type */}
          <div className="col-sm-4 col-md-2">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Type</label>
            <select
              className="form-control form-select radius-8"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="THEORY">Theory</option>
              <option value="LAB">Lab</option>
            </select>
          </div>

          {/* Class */}
          <div className="col-sm-4 col-md-2">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Class</label>
            <select
              className="form-control form-select radius-8"
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}
            >
              <option value="">All Classes</option>
              <option value="CORE">Core</option>
              <option value="GER">GER</option>
              <option value="ELECTIVE">Elective</option>
            </select>
          </div>

          {/* Clear */}
          <div className="col-sm-auto col-md-1">
            <label className="form-label text-sm mb-4 d-block invisible">x</label>
            <button
              className="btn btn-outline-secondary radius-8 w-100"
              onClick={resetFilters}
              disabled={!hasFilter}
              title="Clear filters"
            >
              <Icon icon="material-symbols:filter-alt-off-outline" />
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilter && (
          <div className="d-flex flex-wrap gap-2 mt-12 mb-0">
            {search && (
              <span className="badge bg-primary-100 text-primary-600 radius-4 d-flex align-items-center gap-1">
                "{search}"
                <Icon icon="material-symbols:close" className="cursor-pointer" onClick={() => { setSearch(""); setPage(1); }} />
              </span>
            )}
            {filterCode && (
              <span className="badge bg-info-focus text-info-main radius-4 d-flex align-items-center gap-1">
                Code: {filterCode}
                <Icon icon="material-symbols:close" className="cursor-pointer" onClick={() => { setFilterCode(""); setPage(1); }} />
              </span>
            )}
            {filterType && (
              <span className="badge bg-warning-focus text-warning-main radius-4 d-flex align-items-center gap-1">
                {filterType}
                <Icon icon="material-symbols:close" className="cursor-pointer" onClick={() => { setFilterType(""); setPage(1); }} />
              </span>
            )}
            {filterClass && (
              <span className="badge bg-success-focus text-success-main radius-4 d-flex align-items-center gap-1">
                {filterClass}
                <Icon icon="material-symbols:close" className="cursor-pointer" onClick={() => { setFilterClass(""); setPage(1); }} />
              </span>
            )}
            <span className="text-secondary-light text-sm align-self-center">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {error && <div className="card-body pb-0"><div className="alert alert-danger">{error}</div></div>}

      {/* ── Table ── */}
      <div className="card-body">
        {filtered.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">
              {hasFilter ? "No courses match the current filters." : "No courses found."}
            </p>
            {hasFilter
              ? <button className="btn btn-sm btn-outline-secondary mt-16" onClick={resetFilters}>Clear Filters</button>
              : userRole === "ADMIN" && <Link to="/course-add" className="btn btn-sm btn-primary mt-16">Create First Course</Link>
            }
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sem</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Class</th>
                    <th>Theory</th>
                    <th>Lab</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((course, index) => (
                    <tr key={course.id || index}>
                      <td>{course.id}</td>
                      <td>{course.semester ?? "N/A"}</td>
                      <td className="fw-medium">{course.code || "N/A"}</td>
                      <td>{course.name || "N/A"}</td>
                      <td>
                        <span className={`badge radius-4 ${course.course_type === "THEORY" ? "bg-info-focus text-info-main" : "bg-warning-focus text-warning-main"}`}>
                          {course.course_type || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge radius-4 ${
                          course.course_class === "CORE"     ? "bg-primary-100 text-primary-600"
                          : course.course_class === "GER"   ? "bg-purple-light text-purple"
                          : "bg-success-focus text-success-main"
                        }`}>
                          {course.course_class || "N/A"}
                        </span>
                      </td>
                      <td>{course.credit_hours_theory ?? "N/A"}</td>
                      <td>{course.credit_hours_lab    ?? "N/A"}</td>
                      <td>
                        <span className={`badge radius-4 ${course.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                          {course.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <Link to={`/course-view/${course.id}`}
                          className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="View">
                          <Icon icon="iconamoon:eye-light" />
                        </Link>
                        {localStorage.getItem("user_role") === "ADMIN" && (
                          <Link to={`/clo-plo-statement/${course.id}`}
                            className="w-32-px h-32-px me-8 bg-info-focus text-info-main rounded-circle d-inline-flex align-items-center justify-content-center"
                            title="CLO-PLO Statement">
                            <Icon icon="solar:clipboard-list-outline" />
                          </Link>
                        )}
                        <Link to={`/course-edit/${course.id}`}
                          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="Edit">
                          <Icon icon="lucide:edit" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(course)}
                          disabled={togglingId === course.id}
                          className={`w-32-px h-32-px me-8 rounded-circle d-inline-flex align-items-center justify-content-center border-0 ${course.is_active ? "bg-warning-focus text-warning-main" : "bg-success-focus text-success-main"}`}
                          title={course.is_active ? "Deactivate" : "Activate"}
                        >
                          {togglingId === course.id
                            ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                            : <Icon icon={course.is_active ? "mingcute:pause-circle-line" : "mingcute:play-circle-line"} />
                          }
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                          title="Delete">
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
  );
};

export default CourseListLayer;
