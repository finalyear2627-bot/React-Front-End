import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { generatedAssignmentService } from "../api/generatedAssignment.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const STATUS_BADGE = {
  COMPLETED:  "bg-success-focus text-success-main",
  PENDING:    "bg-warning-focus text-warning-main",
  PROCESSING: "bg-info-focus text-info-main",
  FAILED:     "bg-danger-focus text-danger-main",
};

const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const GeneratedAssignmentListLayer = ({ courseType }) => {
  const userRole = localStorage.getItem("user_role");

  const [assignments,  setAssignments]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [openingId,    setOpeningId]    = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (courseType) params.course_type = courseType;
      const data = await generatedAssignmentService.getAll(params);
      setAssignments(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, courseType]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleOpenInNewTab = async (id) => {
    setOpeningId(id);
    try {
      await generatedAssignmentService.openInNewTab(id);
    } catch {
      showError("Failed to open PDF");
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment? This will also remove the PDF file.")) return;
    setDeletingId(id);
    try {
      const res = await generatedAssignmentService.delete(id);
      showSuccess(res?.status?.message || "Assignment deleted");
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const title = courseType === "THEORY"
    ? "Generated Theory Assignments"
    : courseType === "LAB"
    ? "Generated Lab Assignments"
    : "Generated Assignments";
  const courseColLabel = courseType === "LAB" ? "Lab Course" : "Theory Course";
  const generateRoute = courseType === "LAB" ? "/generate-lab-assignment" : "/generate-theory-assignment";

  const paginated = assignments.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">{title}</h5>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <select
            className="form-select form-select-sm radius-8"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
          <button
            className="btn btn-sm btn-outline-secondary radius-8"
            onClick={fetchAssignments}
            title="Refresh"
          >
            <Icon icon="material-symbols:refresh" />
          </button>
          {userRole === "TEACHER" && (
            <Link
              to={generateRoute}
              className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
            >
              <Icon icon="ic:round-plus" className="text-xl" />
              Generate Assignment
            </Link>
          )}
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">
            <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-40">
            <Icon icon="solar:document-text-outline" style={{ fontSize: 48 }} className="text-secondary-light mb-16" />
            <p className="text-secondary-light mb-16">
              {statusFilter ? `No ${statusFilter} assignments found.` : "No assignments generated yet."}
            </p>
            {userRole === "TEACHER" && (
              <Link to={generateRoute} className="btn btn-sm btn-primary radius-8">
                Generate First Assignment
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Topic / Title</th>
                    <th>{courseColLabel}</th>
                    <th>Teacher</th>
                    <th>CLOs</th>
                    <th>Status</th>
                    <th>Generated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((assignment, idx) => {
                    const courseDisplay =
                      assignment.theory_course_code || assignment.theory_course?.code ||
                      assignment.theory_course_name || assignment.theory_course?.name ||
                      assignment.course_code || assignment.course_name || "—";
                    const teacherDisplay = assignment.generated_by_name || assignment.teacher_name || "—";
                    const dateDisplay = fmtDate(assignment.generated_at || assignment.created_at);
                    return (
                      <tr key={assignment.id || idx}>
                        <td>{(page - 1) * pageSize + idx + 1}</td>
                        <td style={{ maxWidth: 200 }}>
                          <span className="fw-medium" title={assignment.topic || assignment.title}>
                            {((assignment.topic || assignment.title || "").length > 50
                              ? (assignment.topic || assignment.title || "").slice(0, 50) + "…"
                              : assignment.topic || assignment.title || "—")}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info-focus text-info-main radius-4">
                            {courseDisplay}
                          </span>
                        </td>
                        <td className="text-nowrap">{teacherDisplay}</td>
                        <td className="text-center">
                          {assignment.clo_ids?.length ?? assignment.clos?.length ?? "—"}
                        </td>
                        <td>
                          <span className={`badge radius-4 ${STATUS_BADGE[assignment.status] || "bg-neutral-200 text-neutral-600"}`}>
                            {assignment.status || "—"}
                          </span>
                        </td>
                        <td className="text-nowrap text-sm">{dateDisplay}</td>
                        <td>
                          {assignment.status === "COMPLETED" && (
                            <button
                              onClick={() => handleOpenInNewTab(assignment.id)}
                              disabled={openingId === assignment.id}
                              className="w-32-px h-32-px me-8 bg-info-focus text-info-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Open PDF in New Tab"
                            >
                              {openingId === assignment.id
                                ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                                : <Icon icon="solar:arrow-right-up-outline" />}
                            </button>
                          )}
                          {userRole === "ADMIN" && (
                            <button
                              onClick={() => handleDelete(assignment.id)}
                              disabled={deletingId === assignment.id}
                              className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Delete"
                            >
                              {deletingId === assignment.id
                                ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                                : <Icon icon="mingcute:delete-2-line" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
          </>
        )}
      </div>
    </div>
  );
};

export default GeneratedAssignmentListLayer;
