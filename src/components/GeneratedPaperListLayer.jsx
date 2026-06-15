import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { generatedPaperService } from "../api/generatedPaper.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const STATUS_BADGE = {
  COMPLETED:  "bg-success-focus text-success-main",
  PENDING:    "bg-warning-focus text-warning-main",
  PROCESSING: "bg-info-focus text-info-main",
  FAILED:     "bg-danger-focus text-danger-main",
};

const GeneratedPaperListLayer = ({ courseType }) => {
  const userRole = localStorage.getItem("user_role");

  const [papers,       setPapers]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [downloading,  setDownloading]  = useState(null);
  const [openingId,    setOpeningId]    = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (courseType) params.course_type = courseType;
      const data = await generatedPaperService.getAll(params);
      setPapers(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, courseType]);

  useEffect(() => { fetchPapers(); }, [fetchPapers]);

  const handleDownload = async (paper) => {
    setDownloading(paper.id);
    try {
      const name = paper.topic || `paper_${paper.id}`;
      await generatedPaperService.download(
        paper.id,
        `${name.replace(/\s+/g, "_").slice(0, 40)}.pdf`
      );
    } catch {
      showError("Failed to download PDF");
    } finally {
      setDownloading(null);
    }
  };

  const handleOpenInNewTab = async (id) => {
    setOpeningId(id);
    try {
      await generatedPaperService.openInNewTab(id);
    } catch {
      showError("Failed to open PDF");
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this paper? This will also remove the PDF file.")) return;
    setDeletingId(id);
    try {
      const res = await generatedPaperService.delete(id);
      showSuccess(res?.status?.message || "Paper deleted");
      setPapers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const title = courseType === "THEORY" ? "Theory Papers" : courseType === "LAB" ? "Lab Papers" : "Generated Papers";
  const generateRoute = courseType === "LAB" ? "/generate-lab-paper" : "/generate-theory-paper";

  const paginated = papers.slice((page - 1) * pageSize, page * pageSize);

  // Resolve field names outside JSX — API may return flat or nested objects
  const rows = paginated.map((paper, idx) => {
    const theoryCourseCode =
      paper.theory_course_code || paper.theory_course?.code || paper.theory_course?.course_code;
    const theoryCourseId =
      paper.theory_course_id || paper.theory_course?.id;
    const theoryCourseName =
      paper.theory_course_name || paper.theory_course?.name;

    const labCourseCode =
      paper.lab_course_code || paper.lab_course?.code || paper.lab_course?.course_code;
    const labCourseName =
      paper.lab_course_name || paper.lab_course?.name || paper.lab_course?.course_name;
    const labCourseId =
      paper.lab_course_id || paper.lab_course?.id;
    const hasLab = !!(
      labCourseId || labCourseCode || labCourseName ||
      (paper.course_component && paper.course_component !== "THEORY")
    );

    const teacherDisplay =
      paper.teacher_name ||
      (paper.teacher && typeof paper.teacher === "object"
        ? (
            `${paper.teacher.first_name || ""} ${paper.teacher.last_name || ""}`.trim() ||
            paper.teacher.name ||
            paper.teacher.username
          )
        : "") ||
      "—";

    const totalMarks = paper.total_marks || paper.marks || "";
    const totalTime  = paper.total_time  || paper.time  || "";

    return {
      paper, idx,
      theoryCourseCode, theoryCourseId, theoryCourseName,
      labCourseCode, labCourseName, labCourseId, hasLab,
      teacherDisplay, totalMarks, totalTime,
    };
  });

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
            onClick={fetchPapers}
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
              Generate Paper
            </Link>
          )}
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">
            <Icon
              icon="svg-spinners:180-ring"
              className="text-primary-600"
              style={{ fontSize: 32 }}
            />
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-40">
            <Icon
              icon="solar:document-text-bold-duotone"
              style={{ fontSize: 48 }}
              className="text-secondary-light mb-16"
            />
            <p className="text-secondary-light mb-16">
              {statusFilter
                ? `No ${statusFilter} papers found.`
                : "No exam papers generated yet."}
            </p>
            {userRole === "TEACHER" && (
              <Link to={generateRoute} className="btn btn-sm btn-primary radius-8">
                Generate First Paper
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
                    <th>Topic</th>
                    <th>Theory Course</th>
                    <th>Lab Course</th>
                    <th>Component</th>
                    <th>Teacher</th>
                    <th>Marks / Time</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.paper.id || r.idx}>
                      <td>{(page - 1) * pageSize + r.idx + 1}</td>
                      <td style={{ maxWidth: 180 }}>
                        <span className="fw-medium" title={r.paper.topic}>
                          {(r.paper.topic || "").length > 45
                            ? r.paper.topic.slice(0, 45) + "…"
                            : r.paper.topic || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info-focus text-info-main radius-4">
                          {r.theoryCourseCode || r.theoryCourseName ||
                            (r.theoryCourseId ? `Course ${r.theoryCourseId}` : "—")}
                        </span>
                      </td>
                      <td>
                        {r.hasLab ? (
                          <span className="badge bg-warning-focus text-warning-main radius-4">
                            {r.labCourseCode || r.labCourseName ||
                              (r.labCourseId ? `Course ${r.labCourseId}` : "Lab Course")}
                          </span>
                        ) : (
                          <span className="text-secondary-light text-xs">—</span>
                        )}
                      </td>
                      <td>
                        {r.paper.course_component ? (
                          <span className="badge bg-primary-focus text-primary-main radius-4">
                            {r.paper.course_component}
                          </span>
                        ) : (
                          <span className="text-secondary-light text-xs">—</span>
                        )}
                      </td>
                      <td className="text-nowrap">{r.teacherDisplay}</td>
                      <td className="text-nowrap text-sm">
                        {r.totalMarks && <span>{r.totalMarks} marks</span>}
                        {r.totalMarks && r.totalTime && <span className="text-secondary-light mx-4">/</span>}
                        {r.totalTime  && <span className="text-secondary-light">{r.totalTime}</span>}
                        {!r.totalMarks && !r.totalTime && "—"}
                      </td>
                      <td>
                        <span
                          className={`badge radius-4 ${
                            STATUS_BADGE[r.paper.status] || "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {r.paper.status || "—"}
                        </span>
                      </td>
                      <td className="text-nowrap">
                        {r.paper.created_at
                          ? new Date(r.paper.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        {r.paper.status === "COMPLETED" && (
                          <>
                            <button
                              onClick={() => handleDownload(r.paper)}
                              disabled={downloading === r.paper.id}
                              className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Download PDF"
                            >
                              {downloading === r.paper.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  style={{ width: 12, height: 12 }}
                                />
                              ) : (
                                <Icon icon="solar:download-linear" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenInNewTab(r.paper.id)}
                              disabled={openingId === r.paper.id}
                              className="w-32-px h-32-px me-8 bg-info-focus text-info-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Open in New Tab"
                            >
                              {openingId === r.paper.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  style={{ width: 12, height: 12 }}
                                />
                              ) : (
                                <Icon icon="solar:arrow-right-up-outline" />
                              )}
                            </button>
                          </>
                        )}
                        {userRole === "ADMIN" && (
                          <button
                            onClick={() => handleDelete(r.paper.id)}
                            disabled={deletingId === r.paper.id}
                            className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                            title="Delete"
                          >
                            {deletingId === r.paper.id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                style={{ width: 12, height: 12 }}
                              />
                            ) : (
                              <Icon icon="mingcute:delete-2-line" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              total={papers.length}
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

export default GeneratedPaperListLayer;
