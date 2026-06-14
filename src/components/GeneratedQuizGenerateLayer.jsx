import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generatedQuizService } from "../api/generatedQuiz.service";
import { courseService } from "../api/course.service";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { cloService } from "../api/clo.service";
import { ploService } from "../api/plo.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const CloCheckGroup = ({ items, selected, onToggle, emptyMsg }) => (
  <div className="border radius-8 p-12" style={{ maxHeight: 280, overflowY: "auto" }}>
    {items.length === 0 ? (
      <p className="text-secondary-light text-sm mb-0">{emptyMsg}</p>
    ) : (
      items.map((item) => {
        const checked = selected.includes(item.id);
        return (
          <div
            key={item.id}
            className={`d-flex align-items-start gap-10 p-10 radius-6 mb-6 ${checked ? "bg-primary-50 border border-primary-200" : "bg-base"}`}
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
                <span className="badge bg-info-100 text-info-600 radius-4 fw-semibold">
                  CLO-{item.clo_number}
                </span>
                {item.bt_level && (
                  <span className="badge bg-warning-focus text-warning-main radius-4 text-xs">
                    {item.bt_level}
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

const PloCheckGroup = ({ items, selected, onToggle, emptyMsg }) => (
  <div className="border radius-8 p-12" style={{ maxHeight: 240, overflowY: "auto" }}>
    {items.length === 0 ? (
      <p className="text-secondary-light text-sm mb-0">{emptyMsg}</p>
    ) : (
      items.map((item) => {
        const checked = selected.includes(item.id);
        return (
          <div
            key={item.id}
            className={`d-flex align-items-start gap-10 p-10 radius-6 mb-6 ${checked ? "bg-success-50 border border-success-200" : "bg-base"}`}
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
                <span className="badge bg-success-100 text-success-600 radius-4 fw-semibold">
                  PLO-{item.plo_number}
                </span>
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

const GeneratedQuizGenerateLayer = () => {
  const navigate = useNavigate();

  const [topic,          setTopic]          = useState("");
  const [courseId,       setCourseId]       = useState("");
  const [selectedCloIds, setSelectedCloIds] = useState([]);
  const [selectedPloIds, setSelectedPloIds] = useState([]);

  const [courses,      setCourses]      = useState([]);
  const [allCourses,   setAllCourses]   = useState([]);
  const [clos,         setClos]         = useState([]);
  const [plos,         setPlos]         = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClos,    setLoadingClos]    = useState(false);
  const [loadingPlos,    setLoadingPlos]    = useState(false);
  const [submitting,     setSubmitting]     = useState(false);

  const normAssignment = (a) => ({
    id:         a.course_id ?? (typeof a.course === "object" ? a.course?.id : a.course),
    code:       a.course_code || a.course?.code || "",
    name:       a.course_name || a.course?.name || "",
    program_id: a.program_id || a.program || a.course?.program || a.course?.program_id,
  });

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role === "TEACHER") {
      courseAssignmentService.getMyCourses()
        .then((d) => {
          const list = Array.isArray(d) ? d : d.result || d.results || [];
          const mapped = list
            .filter((a) => a.is_active !== false)
            .map(normAssignment)
            .filter((c) => c.id != null && c.id !== "");
          setCourses(mapped);
          setAllCourses(mapped);
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    } else {
      courseService.getAllCourses()
        .then((d) => {
          const all = Array.isArray(d) ? d : d.result || d.results || [];
          const active = all.filter((c) => c.is_active);
          setCourses(active);
          setAllCourses(active);
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!courseId) { setClos([]); setPlos([]); setSelectedPloIds([]); return; }
    setLoadingClos(true);
    setSelectedCloIds([]);

    const course = allCourses.find((c) => String(c.id) === String(courseId));
    const programId = course?.program_id || course?.program;

    cloService.getAll({ course: courseId })
      .then((d) => setClos(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => showError("Failed to load CLOs"))
      .finally(() => setLoadingClos(false));

    if (programId) {
      setLoadingPlos(true);
      setSelectedPloIds([]);
      ploService.getAll({ program: programId })
        .then((d) => setPlos(Array.isArray(d) ? d : d.result || d.results || []))
        .catch(() => showError("Failed to load PLOs"))
        .finally(() => setLoadingPlos(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const toggleClo = (id) =>
    setSelectedCloIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const togglePlo = (id) =>
    setSelectedPloIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId)                   { showError("Please select a course"); return; }
    if (selectedCloIds.length === 0) { showError("Select at least one CLO"); return; }
    if (selectedPloIds.length === 0) { showError("Select at least one PLO"); return; }
    if (!topic.trim())               { showError("Please enter a topic"); return; }

    setSubmitting(true);
    try {
      const payload = {
        course_id: parseInt(courseId, 10),
        topic:     topic.trim(),
        clo_ids:   selectedCloIds,
        plo_ids:   selectedPloIds,
      };
      const res = await generatedQuizService.generate(payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Generation failed"); return; }
      showSuccess(res?.status?.message || "Quiz generated successfully");
      navigate("/generated-quizzes");
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
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Topic / Quiz Title <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              className="form-control radius-8"
              placeholder="e.g., Arrays and Pointers"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          {/* Course */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Course <span className="text-danger-600">*</span>
            </label>
            {loadingCourses ? (
              <div className="placeholder-glow"><span className="placeholder col-12 radius-8" style={{ height: 38 }} /></div>
            ) : (
              <select
                className="form-control radius-8"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* CLOs */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              CLOs <span className="text-danger-600">*</span>
              {courseId && (
                <span className="ms-8 badge bg-info-focus text-info-main radius-4">
                  {selectedCloIds.length} selected
                </span>
              )}
            </label>
            {loadingClos ? (
              <div className="text-center py-20"><span className="spinner-border spinner-border-sm" /></div>
            ) : (
              <CloCheckGroup
                items={clos}
                selected={selectedCloIds}
                onToggle={toggleClo}
                emptyMsg={courseId ? "No CLOs found for this course" : "Select a course first"}
              />
            )}
          </div>

          {/* PLOs */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Program Learning Outcomes (PLOs) <span className="text-danger-600">*</span>
              {plos.length > 0 && (
                <span className="ms-8 badge bg-success-focus text-success-main radius-4">
                  {selectedPloIds.length} selected
                </span>
              )}
            </label>
            {loadingPlos ? (
              <div className="text-center py-20"><span className="spinner-border spinner-border-sm" /></div>
            ) : (
              <PloCheckGroup
                items={plos}
                selected={selectedPloIds}
                onToggle={togglePlo}
                emptyMsg={courseId ? "No PLOs found for this program" : "Select a course first to load PLOs"}
              />
            )}
          </div>

          {/* Summary */}
          {courseId && (
            <div className="card border mb-0 mt-4">
              <div className="card-body p-16">
                <div className="d-flex gap-24 flex-wrap">
                  <div className="d-flex align-items-center gap-12">
                    <span className="text-sm text-secondary-light fw-semibold">CLOs selected:</span>
                    <span className={`badge radius-4 ${selectedCloIds.length > 0 ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                      {selectedCloIds.length} / {clos.length}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-12">
                    <span className="text-sm text-secondary-light fw-semibold">PLOs selected:</span>
                    <span className={`badge radius-4 ${selectedPloIds.length > 0 ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                      {selectedPloIds.length} / {plos.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="d-flex gap-3 pt-24 border-top mt-24">
            <button
              type="submit"
              className="btn btn-primary radius-8 py-10 px-32 d-inline-flex align-items-center gap-2"
              disabled={submitting}
            >
              {submitting
                ? <><span className="spinner-border spinner-border-sm me-6" /> Generating…</>
                : <><Icon icon="solar:magic-stick-3-outline" className="text-lg" /> Generate Quiz</>}
            </button>
            <button
              type="button"
              onClick={() => navigate("/generated-quizzes")}
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

export default GeneratedQuizGenerateLayer;
