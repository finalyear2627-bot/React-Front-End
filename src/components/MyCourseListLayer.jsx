import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const TYPE_BADGE = {
  THEORY: "bg-primary-100 text-primary-600",
  LAB:    "bg-warning-focus text-warning-main",
};

const MyCourseListLayer = () => {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.course_type = typeFilter;
      const data = await courseAssignmentService.getMyCourses(params);
      setCourses(Array.isArray(data) ? data : data.result || data.results || []);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const paginated = courses.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">My Assigned Courses</h5>
        <div className="d-flex gap-2">
          {["", "THEORY", "LAB"].map((t) => (
            <button
              key={t}
              type="button"
              className={`btn btn-sm radius-8 ${typeFilter === t ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => { setTypeFilter(t); setPage(1); }}
            >
              {t || "All"}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card-body pb-0"><div className="alert alert-danger">{error}</div></div>}

      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-40">
            <Icon icon="solar:notebook-outline" style={{ fontSize: 48 }} className="text-secondary-light mb-16" />
            <p className="text-secondary-light">
              {typeFilter ? `No ${typeFilter} courses assigned to you.` : "No courses assigned to you yet."}
            </p>
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Type</th>
                    <th>Semester</th>
                    <th>Credit (Theory)</th>
                    <th>Credit (Lab)</th>
                    <th>Program</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a, idx) => (
                    <tr key={a.id || idx}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td className="fw-medium">{a.course_code || a.course?.code || "N/A"}</td>
                      <td>{a.course_name || a.course?.name || "N/A"}</td>
                      <td>
                        <span className={`badge radius-4 ${TYPE_BADGE[a.course_type || a.course?.course_type] || "bg-neutral-200 text-neutral-600"}`}>
                          {a.course_type || a.course?.course_type || "N/A"}
                        </span>
                      </td>
                      <td>{a.semester || a.course?.semester || "N/A"}</td>
                      <td>{a.credit_hours_theory ?? a.course?.credit_hours_theory ?? "N/A"}</td>
                      <td>{a.credit_hours_lab    ?? a.course?.credit_hours_lab    ?? "N/A"}</td>
                      <td>{a.program_name || a.course?.program_name || a.course?.program || "N/A"}</td>
                      <td>
                        <span className={`badge radius-4 ${a.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                          {a.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              total={courses.length}
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

export default MyCourseListLayer;
