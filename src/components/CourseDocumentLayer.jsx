import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { courseDocumentService } from "../api/courseDocument.service";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { courseService } from "../api/course.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const DOC_TYPE_LABELS = {
  SLIDES:  "Slides",
  OUTLINE: "Course Outline",
  OTHER:   "Other / Description",
};

const DOC_TYPE_ICONS = {
  SLIDES:  "solar:presentation-graph-outline",
  OUTLINE: "solar:document-text-outline",
  OTHER:   "solar:file-text-outline",
};

const DOC_TYPE_BADGE = {
  SLIDES:  "bg-primary-100 text-primary-600",
  OUTLINE: "bg-success-focus text-success-main",
  OTHER:   "bg-warning-focus text-warning-main",
};

const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const CourseDocumentLayer = () => {
  const userRole = localStorage.getItem("user_role");

  const [courses,      setCourses]      = useState([]);
  const [courseId,     setCourseId]     = useState("");
  const [documents,    setDocuments]    = useState([]);
  const [loadingDocs,  setLoadingDocs]  = useState(false);
  const [deletingId,   setDeletingId]   = useState(null);

  // Upload form state
  const [title,        setTitle]        = useState("");
  const [docType,      setDocType]      = useState("SLIDES");
  const [file,         setFile]         = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState("");
  const fileRef = useRef(null);

  // Load courses
  useEffect(() => {
    const load = async () => {
      try {
        if (userRole === "TEACHER") {
          const data = await courseAssignmentService.getMyCourses();
          const list = Array.isArray(data) ? data : data.result || data.results || [];
          setCourses(list);
        } else {
          const data = await courseService.getAllCourses();
          const list = Array.isArray(data) ? data : data.result || data.results || [];
          setCourses(list.filter((c) => c.is_active));
        }
      } catch (err) {
        showError(getApiError(err));
      }
    };
    load();
  }, [userRole]);

  // Load documents for selected course
  const fetchDocs = useCallback(async () => {
    if (!courseId) { setDocuments([]); return; }
    setLoadingDocs(true);
    try {
      const data = await courseDocumentService.getAll({ course: courseId });
      setDocuments(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoadingDocs(false);
    }
  }, [courseId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!courseId)    { setUploadError("Please select a course"); return; }
    if (!title.trim()) { setUploadError("Please enter a title"); return; }
    if (!file)         { setUploadError("Please select a file"); return; }
    setUploadError("");
    setUploading(true);
    try {
      await courseDocumentService.upload(parseInt(courseId, 10), title.trim(), docType, file);
      showSuccess("Document uploaded successfully");
      setTitle("");
      setFile(null);
      setDocType("SLIDES");
      if (fileRef.current) fileRef.current.value = "";
      fetchDocs();
    } catch (err) {
      const msg = getApiError(err);
      setUploadError(msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    setDeletingId(id);
    try {
      await courseDocumentService.delete(id);
      showSuccess("Document deleted");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  // Derive display label for course dropdown
  const courseLabel = (c) => {
    if (userRole === "TEACHER") {
      return `${c.course_code || c.course?.code || "—"}  —  ${c.course_name || c.course?.name || ""}`;
    }
    return `${c.code || "—"}  —  ${c.name || ""}`;
  };
  const courseIdVal = (c) => (userRole === "TEACHER" ? c.course_id || c.course?.id || c.id : c.id);

  return (
    <div className="row gy-4">

      {/* Upload Card */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0 d-flex align-items-center gap-2">
              <Icon icon="solar:upload-square-outline" className="text-primary-600" style={{ fontSize: 20 }} />
              Upload Course Document
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpload}>
              <div className="row g-3">

                {/* Course selector */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Course <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">— Select Course —</option>
                    {courses.map((c) => (
                      <option key={courseIdVal(c)} value={courseIdVal(c)}>
                        {courseLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doc type */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Document Type <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="SLIDES">Slides (PDF / PPTX)</option>
                    <option value="OUTLINE">Course Outline (PDF / TXT)</option>
                    <option value="OTHER">Other / Description (PDF / TXT)</option>
                  </select>
                </div>

                {/* Title */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Week 1 Slides"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* File */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">File <span className="text-danger">*</span></label>
                  <input
                    ref={fileRef}
                    type="file"
                    className="form-control"
                    accept=".pdf,.pptx,.txt"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                  <div className="form-text">PDF, PPTX, or TXT — content is extracted and used during AI generation</div>
                </div>

                {uploadError && (
                  <div className="col-12">
                    <div className="alert alert-danger py-8 mb-0">{uploadError}</div>
                  </div>
                )}

                <div className="col-12">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn btn-primary-600 radius-8 d-inline-flex align-items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:upload-linear" />
                        Upload Document
                      </>
                    )}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="col-12">
        <div className="card basic-data-table">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="card-title mb-0 d-flex align-items-center gap-2">
              <Icon icon="solar:folder-with-files-outline" className="text-info-main" style={{ fontSize: 20 }} />
              Uploaded Documents
              {courseId && (
                <span className="badge bg-info-focus text-info-main radius-4 ms-2" style={{ fontSize: 12 }}>
                  {courses.find((c) => String(courseIdVal(c)) === String(courseId))
                    ? courseLabel(courses.find((c) => String(courseIdVal(c)) === String(courseId))).split("—")[0].trim()
                    : ""}
                </span>
              )}
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary radius-8"
              onClick={fetchDocs}
              title="Refresh"
            >
              <Icon icon="material-symbols:refresh" />
            </button>
          </div>

          <div className="card-body">
            {!courseId ? (
              <div className="text-center py-40">
                <Icon icon="solar:folder-outline" style={{ fontSize: 48 }} className="text-secondary-light mb-16" />
                <p className="text-secondary-light">Select a course above to view its documents.</p>
              </div>
            ) : loadingDocs ? (
              <div className="text-center py-40">
                <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-40">
                <Icon icon="solar:document-add-outline" style={{ fontSize: 48 }} className="text-secondary-light mb-16" />
                <p className="text-secondary-light">No documents uploaded for this course yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table bordered-table mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>File</th>
                      <th>Uploaded At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, idx) => (
                      <tr key={doc.id || idx}>
                        <td>{idx + 1}</td>
                        <td className="fw-medium">{doc.title || "—"}</td>
                        <td>
                          <span className={`badge radius-4 d-inline-flex align-items-center gap-1 ${DOC_TYPE_BADGE[doc.doc_type] || "bg-neutral-200 text-neutral-600"}`}>
                            <Icon icon={DOC_TYPE_ICONS[doc.doc_type] || "solar:file-outline"} style={{ fontSize: 13 }} />
                            {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type || "—"}
                          </span>
                        </td>
                        <td className="text-sm text-secondary-light">
                          {doc.file_name || doc.file?.split("/").pop() || "—"}
                        </td>
                        <td className="text-nowrap text-sm">{fmtDate(doc.uploaded_at || doc.created_at)}</td>
                        <td>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                            className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                            title="Delete"
                          >
                            {deletingId === doc.id
                              ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                              : <Icon icon="mingcute:delete-2-line" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDocumentLayer;
