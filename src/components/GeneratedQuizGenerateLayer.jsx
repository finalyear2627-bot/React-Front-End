import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generatedQuizService } from "../api/generatedQuiz.service";
import { courseService } from "../api/course.service";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { cloService } from "../api/clo.service";
import { ploService } from "../api/plo.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import CourseDocsMiniPreview from "./CourseDocsMiniPreview";

const CloRadioGroup = ({ items, selected, onSelect, emptyMsg }) => (
  <div className="border radius-8 p-12" style={{ maxHeight: 280, overflowY: "auto" }}>
    {items.length === 0 ? (
      <p className="text-secondary-light text-sm mb-0">{emptyMsg}</p>
    ) : (
      items.map((item) => {
        const checked = selected === item.id;
        return (
          <div
            key={item.id}
            className={`d-flex align-items-start gap-10 p-10 radius-6 mb-6 ${checked ? "bg-primary-50 border border-primary-200" : "bg-base"}`}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(item.id)}
          >
            <input
              type="radio"
              name="clo_radio"
              className="form-check-input mt-1 flex-shrink-0"
              checked={checked}
              onChange={() => onSelect(item.id)}
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

const PloRadioGroup = ({ items, selected, onSelect, emptyMsg }) => (
  <div className="border radius-8 p-12" style={{ maxHeight: 240, overflowY: "auto" }}>
    {items.length === 0 ? (
      <p className="text-secondary-light text-sm mb-0">{emptyMsg}</p>
    ) : (
      items.map((item) => {
        const checked = selected === item.id;
        return (
          <div
            key={item.id}
            className={`d-flex align-items-start gap-10 p-10 radius-6 mb-6 ${checked ? "bg-success-50 border border-success-200" : "bg-base"}`}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(item.id)}
          >
            <input
              type="radio"
              name="plo_radio"
              className="form-check-input mt-1 flex-shrink-0"
              checked={checked}
              onChange={() => onSelect(item.id)}
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

const PROG_LANGS = ["Python", "Java", "C++", "C#", "JavaScript", "C", "HTML/CSS"];

const GeneratedQuizGenerateLayer = ({ courseType = "THEORY" }) => {
  const navigate = useNavigate();

  const [topic,         setTopic]         = useState("");
  const [progLang,      setProgLang]      = useState("");
  const [term,          setTerm]          = useState("MIDTERM");
  const [courseId,      setCourseId]      = useState("");
  const [teacherName,      setTeacherName]      = useState("");
  const [selectedCloId,    setSelectedCloId]    = useState(null);
  const [selectedPloId,    setSelectedPloId]    = useState(null);

  const [courses,      setCourses]      = useState([]);
  const [allCourses,   setAllCourses]   = useState([]);
  const [clos,         setClos]         = useState([]);
  const [plos,         setPlos]         = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClos,    setLoadingClos]    = useState(false);
  const [loadingPlos,    setLoadingPlos]    = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [topicError,     setTopicError]     = useState("");

  const normAssignment = (a) => ({
    id:          a.course_id ?? (typeof a.course === "object" ? a.course?.id : a.course),
    code:        a.course_code || a.course?.code || "",
    name:        a.course_name || a.course?.name || "",
    program_id:  a.program_id || a.program || a.course?.program || a.course?.program_id,
    course_type: a.course_type || a.course?.course_type || "",
    teacher_name: a.teacher_name || (typeof a.teacher === "object" ? `${a.teacher?.first_name || ""} ${a.teacher?.last_name || ""}`.trim() : "") || "",
  });

  const fallbackTeacher = () =>
    `${localStorage.getItem("user_first_name") || ""} ${localStorage.getItem("user_last_name") || ""}`.trim();

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role === "TEACHER") {
      courseAssignmentService.getMyCourses({ course_type: courseType })
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
          const active = all
            .filter((c) => c.is_active)
            .map(normAssignment)
            .filter((c) => !courseType || c.course_type === courseType || !c.course_type);
          setCourses(active);
          setAllCourses(active);
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseType]);

  useEffect(() => {
    if (!courseId) {
      setClos([]); setPlos([]);
      setSelectedCloId(null); setSelectedPloId(null);
      setTeacherName("");
      return;
    }

    const course = allCourses.find((c) => String(c.id) === String(courseId));
    const programId = course?.program_id || course?.program;
    const tName = course?.teacher_name || fallbackTeacher();
    setTeacherName(tName);

    setLoadingClos(true);
    setSelectedCloId(null);

    // Try lab course CLOs first; fall back to theory counterpart if none found
    const fetchClos = async () => {
      const toList = (d) => Array.isArray(d) ? d : d.result || d.results || [];
      const direct = toList(await cloService.getAll({ course: courseId }));
      if (direct.length > 0 || courseType !== "LAB") return direct;

      const labCode = (course?.code || "").trim();
      const labName = (course?.name || "").trim();
      try {
        const role = localStorage.getItem("user_role");
        let rawData;
        if (role === "TEACHER") {
          rawData = await courseAssignmentService.getMyCourses({ course_type: "THEORY" });
        } else {
          rawData = await courseService.getAllCourses();
        }
        const normalize = (a) => ({
          id:   a.course_id ?? (typeof a.course === "object" ? a.course?.id : a.course) ?? a.id,
          code: a.course_code || a.course?.code || a.code || "",
          name: a.course_name || a.course?.name || a.name || "",
          course_type: a.course_type || a.course?.course_type || "",
        });
        const list = (Array.isArray(rawData) ? rawData : rawData.result || rawData.results || [])
          .map(normalize)
          .filter((c) => c.course_type === "THEORY" || !c.course_type);
        const code1 = labCode.replace(/-L$/i, "");
        const code2 = labCode.replace(/L$/i, "");
        const name3 = labName.replace(/\s*\(?\s*lab\s*\)?\s*$/i, "").trim();
        const theory = list.find((c) => {
          const tc = (c.code || "").toLowerCase();
          const tn = (c.name || "").toLowerCase();
          return tc === code1.toLowerCase()
              || tc === code2.toLowerCase()
              || (name3 && tn === name3.toLowerCase());
        });
        if (!theory?.id) return direct;
        return toList(await cloService.getAll({ course: theory.id }));
      } catch { return direct; }
    };

    fetchClos()
      .then((list) => setClos(list))
      .catch(() => showError("Failed to load CLOs"))
      .finally(() => setLoadingClos(false));

    if (programId) {
      setLoadingPlos(true);
      setSelectedPloId(null);
      ploService.getAll({ program: programId })
        .then((d) => setPlos(Array.isArray(d) ? d : d.result || d.results || []))
        .catch(() => showError("Failed to load PLOs"))
        .finally(() => setLoadingPlos(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const listRoute    = courseType === "LAB" ? "/generated-lab-quizzes" : "/generated-theory-quizzes";
  const buttonLabel  = courseType === "LAB" ? "Generate Lab Quiz" : "Generate Theory Quiz";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId)       { showError("Please select a course"); return; }
    if (!selectedCloId)  { showError("Please select a CLO"); return; }
    if (!selectedPloId)  { showError("Please select a PLO"); return; }
    if (!topic.trim())   { showError("Please enter a topic"); return; }

    setSubmitting(true);
    try {
      const payload = {
        course_id: parseInt(courseId, 10),
        topic:     topic.trim(),
        term,
        clo_ids:   [selectedCloId],
        plo_ids:   [selectedPloId],
        ...(progLang && { programming_language: progLang }),
      };
      const res = await generatedQuizService.generate(payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Generation failed"); return; }
      showSuccess(res?.status?.message || "Quiz generated successfully");
      navigate(listRoute);
    } catch (err) {
      const msg = getApiError(err);
      if (err?.response?.status === 422) {
        setTopicError(msg);
      } else {
        showError(msg);
      }
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
              className={`form-control radius-8 ${topicError ? "is-invalid" : ""}`}
              placeholder="e.g., Arrays and Pointers"
              value={topic}
              onChange={(e) => { setTopic(e.target.value); if (topicError) setTopicError(""); }}
              required
            />
            <small className="text-secondary-light">Topic must be correctly spelled and relevant to the selected CLOs and PLOs.</small>
            {topicError && (
              <div className="alert alert-danger radius-8 mt-8 text-sm py-8 px-12">{topicError}</div>
            )}
          </div>

          {/* Exam Term */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Exam Term <span className="text-danger-600">*</span>
            </label>
            <div className="d-flex gap-12">
              {[{ value: "MIDTERM", label: "Mid Term" }, { value: "FINAL", label: "Final Term" }].map(({ value, label }) => (
                <div
                  key={value}
                  className={`d-flex align-items-center gap-8 px-16 py-10 radius-8 border flex-grow-1 ${term === value ? "border-primary-600 bg-primary-50" : "border-neutral-200 bg-base"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setTerm(value)}
                >
                  <input type="radio" name="quiz_term" value={value} checked={term === value} onChange={() => setTerm(value)} className="form-check-input mb-0 flex-shrink-0" style={{ width: 16, height: 16 }} />
                  <span className={`fw-semibold text-sm ${term === value ? "text-primary-600" : "text-secondary-light"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Programming Language */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Programming Language
            </label>
            <select
              className="form-control radius-8"
              value={progLang}
              onChange={(e) => setProgLang(e.target.value)}
            >
              <option value="">-- None / Not Applicable --</option>
              {PROG_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <small className="text-secondary-light">Required if the course involves programming topics.</small>
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
            <CourseDocsMiniPreview courseId={courseId} />
          </div>

          {/* Teacher Name (auto-populated, disabled) */}
          {courseId && (
            <div className="mb-20">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Teacher Name
              </label>
              <select className="form-control radius-8" value={teacherName} disabled>
                <option value={teacherName}>{teacherName || "—"}</option>
              </select>
            </div>
          )}

          {/* CLO */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              CLO <span className="text-danger-600">*</span>
              {selectedCloId && (
                <span className="ms-8 badge bg-info-focus text-info-main radius-4">1 selected</span>
              )}
            </label>
            {loadingClos ? (
              <div className="text-center py-20"><span className="spinner-border spinner-border-sm" /></div>
            ) : (
              <CloRadioGroup
                items={clos}
                selected={selectedCloId}
                onSelect={setSelectedCloId}
                emptyMsg={courseId ? "No CLOs found for this course" : "Select a course first"}
              />
            )}
          </div>

          {/* PLO */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Program Learning Outcome (PLO) <span className="text-danger-600">*</span>
              {selectedPloId && (
                <span className="ms-8 badge bg-success-focus text-success-main radius-4">1 selected</span>
              )}
            </label>
            {loadingPlos ? (
              <div className="text-center py-20"><span className="spinner-border spinner-border-sm" /></div>
            ) : (
              <PloRadioGroup
                items={plos}
                selected={selectedPloId}
                onSelect={setSelectedPloId}
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
                    <span className="text-sm text-secondary-light fw-semibold">CLO selected:</span>
                    <span className={`badge radius-4 ${selectedCloId ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                      {selectedCloId ? "1 / " + clos.length : "None"}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-12">
                    <span className="text-sm text-secondary-light fw-semibold">PLO selected:</span>
                    <span className={`badge radius-4 ${selectedPloId ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                      {selectedPloId ? "1 / " + plos.length : "None"}
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
                : <><Icon icon="solar:magic-stick-3-outline" className="text-lg" /> {buttonLabel}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate(listRoute)}
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
