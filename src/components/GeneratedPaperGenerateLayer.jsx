import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generatedPaperService } from "../api/generatedPaper.service";
import { courseService } from "../api/course.service";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { cloService } from "../api/clo.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const CloCheckGroup = ({ title, items, selected, onToggle, color, emptyMsg }) => (
  <div className="border radius-8 p-12" style={{ maxHeight: 240, overflowY: "auto" }}>
    {items.length === 0 ? (
      <p className="text-secondary-light text-sm mb-0">{emptyMsg}</p>
    ) : (
      items.map((item) => {
        const checked = selected.includes(item.id);
        return (
          <div
            key={item.id}
            className={`d-flex align-items-start gap-10 p-10 radius-6 mb-6 cursor-pointer ${checked ? "bg-primary-50 border border-primary-200" : "bg-base"}`}
            style={{ cursor: "pointer" }}
            onClick={() => onToggle(item.id)}
          >
            <input
              type="checkbox"
              className="form-check-input mt-1 flex-shrink-0"
              checked={checked}
              onChange={() => onToggle(item.id)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: 16, height: 16 }}
            />
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-6 flex-wrap mb-4">
                <span className={`badge bg-${color}-100 text-${color}-600 radius-4 fw-semibold`}>
                  CLO-{item.clo_number}
                </span>
                {item.bt_level && (
                  <span className="badge bg-warning-focus text-warning-main radius-4 text-xs">
                    {item.bt_level}
                  </span>
                )}
                {(item.ga_code || item.ga_detail?.code) && (
                  <span className="badge bg-info-focus text-info-main radius-4 text-xs">
                    {item.ga_code || item.ga_detail?.code}
                  </span>
                )}
              </div>
              {item.description && (
                <span className="text-sm text-secondary-light">{item.description}</span>
              )}
            </div>
          </div>
        );
      })
    )}
  </div>
);

const GeneratedPaperGenerateLayer = () => {
  const navigate = useNavigate();

  const [topic,          setTopic]          = useState("");
  const [theoryCourseId, setTheoryCourseId] = useState("");
  const [labCourseId,    setLabCourseId]    = useState("");
  const [selectedCloIds, setSelectedCloIds] = useState([]);

  const [theoryCourses, setTheoryCourses] = useState([]);
  const [labCourses,    setLabCourses]    = useState([]);
  const [theoryClos,    setTheoryClos]    = useState([]);
  const [labClos,       setLabClos]       = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingTClos,   setLoadingTClos]   = useState(false);
  const [loadingLClos,   setLoadingLClos]   = useState(false);
  const [submitting,     setSubmitting]     = useState(false);

  const normAssignment = (a) => ({
    id:          a.course_id ?? (typeof a.course === "object" ? a.course?.id : a.course),
    code:        a.course_code || a.course?.code || "",
    name:        a.course_name || a.course?.name || "",
    course_type: a.course_type || a.course?.course_type,
    is_active:   a.is_active,
  });

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role === "TEACHER") {
      Promise.all([
        courseAssignmentService.getMyCourses({ course_type: "THEORY" }),
        courseAssignmentService.getMyCourses({ course_type: "LAB" }),
      ])
        .then(([td, ld]) => {
          const toList = (d) => (Array.isArray(d) ? d : d.result || d.results || []);
          const active = (items) =>
            items
              .filter((a) => a.is_active !== false)
              .map(normAssignment)
              .filter((c) => c.id != null && c.id !== "");
          setTheoryCourses(active(toList(td)));
          setLabCourses(active(toList(ld)));
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    } else {
      courseService.getAllCourses()
        .then((d) => {
          const all = Array.isArray(d) ? d : d.result || d.results || [];
          const active = all.filter((c) => c.is_active);
          setTheoryCourses(active.filter((c) => c.course_type === "THEORY"));
          setLabCourses(active.filter((c) => c.course_type === "LAB"));
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!theoryCourseId) { setTheoryClos([]); return; }
    setLoadingTClos(true);
    setSelectedCloIds((prev) => prev.filter((id) => labClos.some((c) => c.id === id)));
    cloService.getAll({ course: theoryCourseId })
      .then((d) => setTheoryClos(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => showError("Failed to load theory CLOs"))
      .finally(() => setLoadingTClos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theoryCourseId]);

  useEffect(() => {
    if (!labCourseId) { setLabClos([]); return; }
    setLoadingLClos(true);
    setSelectedCloIds((prev) => prev.filter((id) => theoryClos.some((c) => c.id === id)));
    cloService.getAll({ course: labCourseId })
      .then((d) => setLabClos(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => showError("Failed to load lab CLOs"))
      .finally(() => setLoadingLClos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labCourseId]);

  const toggleClo = (id) =>
    setSelectedCloIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const theorySelected = selectedCloIds.filter((id) => theoryClos.some((c) => c.id === id));
  const labSelected    = selectedCloIds.filter((id) => labClos.some((c) => c.id === id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!theoryCourseId)             { showError("Please select a theory course"); return; }
    if (!labCourseId)                { showError("Please select a lab course"); return; }
    if (theorySelected.length === 0) { showError("Select at least one CLO from the theory course"); return; }
    if (labSelected.length === 0)    { showError("Select at least one CLO from the lab course"); return; }
    if (!topic.trim())               { showError("Please enter a topic"); return; }

    setSubmitting(true);
    try {
      const payload = {
        theory_course_id: parseInt(theoryCourseId, 10),
        lab_course_id:    parseInt(labCourseId, 10),
        topic:            topic.trim(),
        clo_ids:          selectedCloIds,
      };
      const res = await generatedPaperService.generate(payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Generation failed"); return; }
      showSuccess(res?.status?.message || "Paper generated successfully");
      navigate("/generated-papers");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <form onSubmit={handleSubmit}>

          {/* Topic */}
          <div className="mb-24">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Topic / Paper Title <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              className="form-control radius-8"
              placeholder="e.g., Object Oriented Programming - Classes and Objects"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="row g-4">
            {/* Theory column */}
            <div className="col-lg-6">
              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Theory Course <span className="text-danger-600">*</span>
                </label>
                {loadingCourses ? (
                  <div className="placeholder-glow"><span className="placeholder col-12 radius-8" style={{ height: 38 }} /></div>
                ) : (
                  <select
                    className="form-control radius-8"
                    value={theoryCourseId}
                    onChange={(e) => { setTheoryCourseId(e.target.value); setSelectedCloIds([]); }}
                    required
                  >
                    <option value="">-- Select Theory Course --</option>
                    {theoryCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Theory CLOs
                  {theoryCourseId && (
                    <span className="ms-8 badge bg-info-focus text-info-main radius-4">
                      {theorySelected.length} selected
                    </span>
                  )}
                </label>
                {loadingTClos ? (
                  <div className="text-center py-20"><span className="spinner-border spinner-border-sm" /></div>
                ) : (
                  <CloCheckGroup
                    title="theory"
                    items={theoryClos}
                    selected={selectedCloIds}
                    onToggle={toggleClo}
                    color="info"
                    emptyMsg={theoryCourseId ? "No CLOs found for this course" : "Select a theory course first"}
                  />
                )}
              </div>
            </div>

            {/* Lab column */}
            <div className="col-lg-6">
              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Lab Course <span className="text-danger-600">*</span>
                </label>
                {loadingCourses ? (
                  <div className="placeholder-glow"><span className="placeholder col-12 radius-8" style={{ height: 38 }} /></div>
                ) : (
                  <select
                    className="form-control radius-8"
                    value={labCourseId}
                    onChange={(e) => {
                      setLabCourseId(e.target.value);
                      setSelectedCloIds((prev) => prev.filter((id) => theoryClos.some((c) => c.id === id)));
                    }}
                    required
                  >
                    <option value="">-- Select Lab Course --</option>
                    {labCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Lab CLOs
                  {labCourseId && (
                    <span className="ms-8 badge bg-warning-focus text-warning-main radius-4">
                      {labSelected.length} selected
                    </span>
                  )}
                </label>
                {loadingLClos ? (
                  <div className="text-center py-20"><span className="spinner-border spinner-border-sm" /></div>
                ) : (
                  <CloCheckGroup
                    title="lab"
                    items={labClos}
                    selected={selectedCloIds}
                    onToggle={toggleClo}
                    color="warning"
                    emptyMsg={labCourseId ? "No CLOs found for this course" : "Select a lab course first"}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Selection summary */}
          <div className="card border mb-0 mt-4">
            <div className="card-body p-16">
              <h6 className="fw-semibold mb-12 text-primary-light">Selection Summary</h6>
              <div className="d-flex gap-24 flex-wrap">
                <div className="d-flex justify-content-between gap-12 align-items-center">
                  <span className="text-sm text-secondary-light">Theory CLOs</span>
                  <span className={`badge radius-4 ${theorySelected.length > 0 ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                    {theorySelected.length} / {theoryClos.length}
                  </span>
                </div>
                <div className="d-flex justify-content-between gap-12 align-items-center">
                  <span className="text-sm text-secondary-light">Lab CLOs</span>
                  <span className={`badge radius-4 ${labSelected.length > 0 ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                    {labSelected.length} / {labClos.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="d-flex gap-3 pt-24 border-top mt-24">
            <button
              type="submit"
              className="btn btn-primary radius-8 py-10 px-32 d-inline-flex align-items-center gap-2"
              disabled={submitting}
            >
              {submitting
                ? <><span className="spinner-border spinner-border-sm me-6" /> Generating…</>
                : <><Icon icon="solar:magic-stick-3-outline" className="text-lg" /> Generate Paper</>}
            </button>
            <button
              type="button"
              onClick={() => navigate("/generated-papers")}
              className="btn btn-outline-secondary radius-8 py-10 px-32"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratedPaperGenerateLayer;
