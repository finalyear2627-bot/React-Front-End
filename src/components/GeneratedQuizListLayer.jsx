import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { generatedQuizService } from "../api/generatedQuiz.service";
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

const GeneratedQuizListLayer = ({ courseType }) => {
  const userRole = localStorage.getItem("user_role");

  const [quizzes,      setQuizzes]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [openingId,    setOpeningId]    = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (courseType) params.course_type = courseType;
      const data = await generatedQuizService.getAll(params);
      setQuizzes(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, courseType]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleOpenInNewTab = async (id) => {
    setOpeningId(id);
    try {
      await generatedQuizService.openInNewTab(id);
    } catch {
      showError("Failed to open PDF");
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quiz? This will also remove the PDF file.")) return;
    setDeletingId(id);
    try {
      const res = await generatedQuizService.delete(id);
      showSuccess(res?.status?.message || "Quiz deleted");
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const title = courseType === "THEORY"
    ? "Generated Theory Quizzes"
    : courseType === "LAB"
    ? "Generated Lab Quizzes"
    : "Generated Quizzes";
  const courseColLabel = courseType === "LAB" ? "Lab Course" : "Theory Course";
  const generateRoute = courseType === "LAB" ? "/generate-lab-quiz" : "/generate-theory-quiz";

  const paginated = quizzes.slice((page - 1) * pageSize, page * pageSize);

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
            onClick={fetchQuizzes}
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
              Generate Quiz
            </Link>
          )}
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">
            <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-40">
            <Icon icon="solar:question-circle-outline" style={{ fontSize: 48 }} className="text-secondary-light mb-16" />
            <p className="text-secondary-light mb-16">
              {statusFilter ? `No ${statusFilter} quizzes found.` : "No quizzes generated yet."}
            </p>
            {userRole === "TEACHER" && (
              <Link to={generateRoute} className="btn btn-sm btn-primary radius-8">
                Generate First Quiz
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
                  {paginated.map((quiz, idx) => {
                    const courseDisplay =
                      quiz.theory_course_code || quiz.theory_course?.code ||
                      quiz.theory_course_name || quiz.theory_course?.name ||
                      quiz.course_code || quiz.course_name || "—";
                    const teacherDisplay = quiz.generated_by_name || quiz.teacher_name || "—";
                    const dateDisplay = fmtDate(quiz.generated_at || quiz.created_at);
                    return (
                      <tr key={quiz.id || idx}>
                        <td>{(page - 1) * pageSize + idx + 1}</td>
                        <td style={{ maxWidth: 200 }}>
                          <span className="fw-medium" title={quiz.topic || quiz.title}>
                            {((quiz.topic || quiz.title || "").length > 50
                              ? (quiz.topic || quiz.title || "").slice(0, 50) + "…"
                              : quiz.topic || quiz.title || "—")}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info-focus text-info-main radius-4">
                            {courseDisplay}
                          </span>
                        </td>
                        <td className="text-nowrap">{teacherDisplay}</td>
                        <td className="text-center">
                          {quiz.clo_ids?.length ?? quiz.clos?.length ?? "—"}
                        </td>
                        <td>
                          <span className={`badge radius-4 ${STATUS_BADGE[quiz.status] || "bg-neutral-200 text-neutral-600"}`}>
                            {quiz.status || "—"}
                          </span>
                        </td>
                        <td className="text-nowrap text-sm">{dateDisplay}</td>
                        <td>
                          {quiz.status === "COMPLETED" && (
                            <button
                              onClick={() => handleOpenInNewTab(quiz.id)}
                              disabled={openingId === quiz.id}
                              className="w-32-px h-32-px me-8 bg-info-focus text-info-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Open PDF in New Tab"
                            >
                              {openingId === quiz.id
                                ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                                : <Icon icon="solar:arrow-right-up-outline" />}
                            </button>
                          )}
                          {userRole === "ADMIN" && (
                            <button
                              onClick={() => handleDelete(quiz.id)}
                              disabled={deletingId === quiz.id}
                              className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Delete"
                            >
                              {deletingId === quiz.id
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
              total={quizzes.length}
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

export default GeneratedQuizListLayer;
