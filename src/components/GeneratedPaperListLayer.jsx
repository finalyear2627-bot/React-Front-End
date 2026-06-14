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

const GeneratedPaperListLayer = () => {
  const userRole = localStorage.getItem("user_role");
  const [papers,      setPapers]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [openingId,   setOpeningId]   = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await generatedPaperService.getAll(params);
      const list = Array.isArray(data)
        ? data
        : data.result || data.results || [];
      setPapers(list);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchPapers(); }, [fetchPapers]);

  const handleDownload = async (paper) => {
    setDownloading(paper.id);
    try {
      const topic = paper.topic || `paper_${paper.id}`;
      const filename = `${topic.replace(/\s+/g, "_").slice(0, 40)}.pdf`;
      await generatedPaperService.download(paper.id, filename);
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
    if (!window.confirm("Delete this paper? This will also remove the PDF file from disk.")) return;
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

  const paginated = papers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card basic-data-table">
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">Generated Assessment Papers</h5>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Status filter */}
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
              to="/generate-paper"
              className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
            >
              <Icon icon="ic:round-plus" className="text-xl" />
              Generate Paper
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">Loading…</div>
        ) : papers.length === 0 ? (
          <div className="text-center py-40">
            <Icon icon="solar:document-outline" style={{ fontSize: 48 }} className="text-secondary-light mb-16" />
            <p className="text-secondary-light mb-16">
              {statusFilter ? `No ${statusFilter} papers found.` : "No assessment papers generated yet."}
            </p>
            {userRole === "TEACHER" && (
              <Link to="/generate-paper" className="btn btn-sm btn-primary radius-8">
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
                    <th>CLOs</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((paper, idx) => (
                    <tr key={paper.id || idx}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td style={{ maxWidth: 200 }}>
                        <span className="fw-medium" title={paper.topic}>
                          {paper.topic?.length > 50
                            ? paper.topic.slice(0, 50) + "…"
                            : paper.topic || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info-focus text-info-main radius-4">
                          {paper.theory_course_name || paper.theory_course?.name || paper.theory_course_code || `Course ${paper.theory_course_id || "—"}`}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-warning-focus text-warning-main radius-4">
                          {paper.lab_course_name || paper.lab_course?.name || paper.lab_course_code || `Course ${paper.lab_course_id || "—"}`}
                        </span>
                      </td>
                      <td className="text-center">
                        {paper.clo_ids?.length ?? paper.clos?.length ?? "—"}
                      </td>
                      <td>
                        <span className={`badge radius-4 ${STATUS_BADGE[paper.status] || "bg-neutral-200 text-neutral-600"}`}>
                          {paper.status || "—"}
                        </span>
                      </td>
                      <td className="text-nowrap">
                        {paper.created_at
                          ? new Date(paper.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        {paper.status === "COMPLETED" && (
                          <>
                            <button
                              onClick={() => handleDownload(paper)}
                              disabled={downloading === paper.id}
                              className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Download PDF"
                            >
                              {downloading === paper.id
                                ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                                : <Icon icon="solar:download-linear" />}
                            </button>
                            <button
                              onClick={() => handleOpenInNewTab(paper.id)}
                              disabled={openingId === paper.id}
                              className="w-32-px h-32-px me-8 bg-info-focus text-info-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                              title="Open in New Tab"
                            >
                              {openingId === paper.id
                                ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                                : <Icon icon="solar:arrow-right-up-outline" />}
                            </button>
                          </>
                        )}
                        {userRole !== "STUDENT" && (
                          <button
                            onClick={() => handleDelete(paper.id)}
                            disabled={deletingId === paper.id}
                            className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                            title="Delete"
                          >
                            {deletingId === paper.id
                              ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                              : <Icon icon="mingcute:delete-2-line" />}
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