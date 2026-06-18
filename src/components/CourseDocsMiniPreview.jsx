import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseDocumentService } from "../api/courseDocument.service";

const DOC_BADGE = {
  SLIDES:  "bg-primary-100 text-primary-600",
  OUTLINE: "bg-success-focus text-success-main",
  OTHER:   "bg-warning-focus text-warning-main",
};

const CourseDocsMiniPreview = ({ courseId }) => {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) { setDocs([]); return; }
    setLoading(true);
    courseDocumentService
      .getAll({ course: courseId })
      .then((d) => setDocs(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (!courseId) return null;

  if (loading) return (
    <div className="mt-6 text-secondary-light text-sm d-flex align-items-center gap-6">
      <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
      Loading course documents…
    </div>
  );

  if (docs.length === 0) return (
    <div className="mt-6 p-10 radius-8 d-flex align-items-start gap-8"
         style={{ background: "var(--neutral-50, #f9fafb)", border: "1px solid var(--neutral-200, #e5e7eb)" }}>
      <Icon icon="solar:info-circle-outline" className="text-secondary-light flex-shrink-0 mt-1" style={{ fontSize: 14 }} />
      <small className="text-secondary-light">
        No course documents uploaded.{" "}
        <Link to="/course-documents" className="text-primary-600 fw-medium">Upload slides or outline</Link>
        {" "}to improve AI generation quality.
      </small>
    </div>
  );

  return (
    <div className="mt-6 p-10 radius-8"
         style={{ background: "var(--info-50, #eff6ff)", border: "1px solid var(--info-200, #bfdbfe)" }}>
      <small className="fw-semibold text-info-600 d-flex align-items-center gap-6 mb-6">
        <Icon icon="solar:folder-with-files-outline" style={{ fontSize: 14 }} />
        {docs.length} document{docs.length !== 1 ? "s" : ""} will be used for generation:
      </small>
      <div className="d-flex flex-wrap gap-4">
        {docs.map((d) => (
          <span key={d.id} className={`badge radius-4 ${DOC_BADGE[d.doc_type] || "bg-neutral-200 text-neutral-600"}`}>
            {d.title}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CourseDocsMiniPreview;
