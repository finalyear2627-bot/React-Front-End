import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { userService } from "../api/user.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const TYPE_BADGE = {
  THEORY: "bg-primary-100 text-primary-600",
  LAB:    "bg-warning-focus text-warning-main",
};

const CourseAssignmentListLayer = () => {
  const userRole = localStorage.getItem("user_role");
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [togglingId, setTogglingId]   = useState(null);
  const [error, setError]             = useState("");
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  // filters
  const [filterTeacher,  setFilterTeacher]  = useState("");
  const [filterType,     setFilterType]     = useState("");

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterTeacher) params.teacher_id  = filterTeacher;
      if (filterType)    params.course_type  = filterType;
      const data = await courseAssignmentService.getAll(params);
      setAssignments(Array.isArray(data) ? data : data.result || data.results || []);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [filterTeacher, filterType]);

  useEffect(() => {
    // load teachers for the filter dropdown
    userService.getAllUsers()
      .then((data) => {
        const all = Array.isArray(data) ? data : data.result || data.results || [];
        setTeachers(all.filter((u) => u.role === "TEACHER"));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleToggle = async (a) => {
    setTogglingId(a.id);
    try {
      const isActive = a.is_active;
      const res = isActive
        ? await courseAssignmentService.deactivate(a.id)
        : await courseAssignmentService.activate(a.id);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Action failed"); return; }
      showSuccess(res?.status?.message || `Assignment ${isActive ? "deactivated" : "activated"}`);
      setAssignments((prev) => prev.map((x) => x.id === a.id ? { ...x, is_active: !isActive } : x));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this course assignment?")) return;
    try {
      const res = await courseAssignmentService.delete(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      showSuccess(res?.status?.message || "Assignment removed");
    } catch (err) {
      showError(getApiError(err));
    }
  };

  const paginated = assignments.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">Course Assignments</h5>
        {userRole === "ADMIN" && (
          <Link
            to="/course-assignment-add"
            className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
          >
            <Icon icon="ic:round-plus" className="text-xl" />
            Assign Course
          </Link>
        )}
      </div>

      {/* Filters — admin only */}
      {userRole === "ADMIN" && (
        <div className="card-body pb-0">
          <div className="row g-3">
            <div className="col-sm-4">
              <select
                className="form-control form-select radius-8"
                value={filterTeacher}
                onChange={(e) => { setFilterTeacher(e.target.value); setPage(1); }}
              >
                <option value="">All Teachers</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {`${t.first_name} ${t.last_name}`.trim() || t.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-3">
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
            <div className="col-sm-2">
              <button
                className="btn btn-outline-secondary radius-8 w-100"
                onClick={() => { setFilterTeacher(""); setFilterType(""); setPage(1); }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="card-body pb-0"><div className="alert alert-danger">{error}</div></div>}

      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No assignments found</p>
            {userRole === "ADMIN" && (
              <Link to="/course-assignment-add" className="btn btn-sm btn-primary mt-16">Assign First Course</Link>
            )}
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Teacher</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Type</th>
                    <th>Semester</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a, idx) => (
                    <tr key={a.id || idx}>
                      <td>{a.id}</td>
                      <td className="fw-medium">
                        {a.teacher_name || a.teacher?.username || a.teacher || "N/A"}
                      </td>
                      <td>{a.course_code || a.course?.code || "N/A"}</td>
                      <td>{a.course_name || a.course?.name || "N/A"}</td>
                      <td>
                        <span className={`badge radius-4 ${TYPE_BADGE[a.course_type || a.course?.course_type] || "bg-neutral-200 text-neutral-600"}`}>
                          {a.course_type || a.course?.course_type || "N/A"}
                        </span>
                      </td>
                      <td>{a.semester_name || a.semester || a.course?.semester_name || a.course?.semester || "N/A"}</td>
                      <td>{a.program_name || a.course?.program_name || a.course?.program || "N/A"}</td>
                      <td>
                        <span className={`badge radius-4 ${a.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                          {a.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggle(a)}
                          disabled={togglingId === a.id}
                          className={`w-32-px h-32-px me-8 rounded-circle d-inline-flex align-items-center justify-content-center border-0 ${a.is_active ? "bg-warning-focus text-warning-main" : "bg-success-focus text-success-main"}`}
                          title={a.is_active ? "Deactivate" : "Activate"}
                        >
                          {togglingId === a.id
                            ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                            : <Icon icon={a.is_active ? "mingcute:pause-circle-line" : "mingcute:play-circle-line"} />
                          }
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                          title="Remove"
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
              total={assignments.length}
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

export default CourseAssignmentListLayer;
