import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generatedPaperService } from "../api/generatedPaper.service";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { courseService } from "../api/course.service";
import { cloService } from "../api/clo.service";
import { ploService } from "../api/plo.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import CourseDocsMiniPreview from "./CourseDocsMiniPreview";

const MARKS_OPTIONS = ["20", "30", "40", "50", "60", "80", "100"];
const TIME_OPTIONS = [
  "1 Hour",
  "1 Hour 30 Minutes",
  "2 Hours",
  "2 Hours 30 Minutes",
  "3 Hours",
];
const PROG_LANGS = ["Python", "Java", "C++", "C#", "JavaScript", "C", "Other"];

const CheckItem = ({ badge, badgeColor = "info", label, checked, onClick }) => (
  <div
    className={`d-flex align-items-start gap-10 p-10 radius-6 mb-6 ${
      checked ? "bg-primary-50 border border-primary-200" : "bg-base border border-transparent"
    }`}
    style={{ cursor: "pointer" }}
    onClick={onClick}
  >
    <input
      type="checkbox"
      className="form-check-input mt-1 flex-shrink-0"
      checked={checked}
      onChange={onClick}
      onClick={(e) => e.stopPropagation()}
      style={{ width: 16, height: 16 }}
    />
    <div className="flex-grow-1">
      <span className={`badge bg-${badgeColor}-100 text-${badgeColor}-600 radius-4 fw-semibold me-6`}>
        {badge}
      </span>
      <span className="text-sm text-secondary-light">{label}</span>
    </div>
  </div>
);

const GeneratePaperLabLayer = () => {
  const navigate = useNavigate();

  const [theoryCourseId, setTheoryCourseId] = useState("");
  const [labCourseId,    setLabCourseId]    = useState("");
  const [topic,          setTopic]          = useState("");
  const [progLang,       setProgLang]       = useState("");
  const [teacherName,    setTeacherName]    = useState("");
  const [totalMarks,  setTotalMarks]  = useState("60");
  const [totalTime,   setTotalTime]   = useState("2 Hours 30 Minutes");
  const [customMarks, setCustomMarks] = useState(false);
  const [customTime,  setCustomTime]  = useState(false);

  const [theoryCourses, setTheoryCourses] = useState([]);
  const [labCourses,    setLabCourses]    = useState([]);
  const [allCourses,    setAllCourses]    = useState([]);
  const [clos,          setClos]          = useState([]);
  const [plos,          setPlos]          = useState([]);
  const [selectedCloIds, setSelectedCloIds] = useState([]);
  const [selectedPloIds, setSelectedPloIds] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClos,    setLoadingClos]    = useState(false);
  const [loadingPlos,    setLoadingPlos]    = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [topicError,     setTopicError]     = useState("");

  const fallbackTeacher = () =>
    `${localStorage.getItem("user_first_name") || ""} ${localStorage.getItem("user_last_name") || ""}`.trim();

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const normItem = (a) => ({
      id:           a.course_id ?? (typeof a.course === "object" ? a.course?.id : a.course) ?? a.id,
      code:         a.course_code || a.course?.code || a.code || "",
      name:         a.course_name || a.course?.name || a.name || "",
      course_type:  a.course_type || a.course?.course_type || "",
      program_id:   a.program_id || a.program || a.course?.program,
      teacher_name: a.teacher_name || (typeof a.teacher === "object" ? `${a.teacher?.first_name || ""} ${a.teacher?.last_name || ""}`.trim() : "") || "",
    });

    if (role === "TEACHER") {
      Promise.all([
        courseAssignmentService.getMyCourses({ course_type: "THEORY" }),
        courseAssignmentService.getMyCourses({ course_type: "LAB" }),
      ])
        .then(([theoryData, labData]) => {
          const theoryList = (Array.isArray(theoryData) ? theoryData : theoryData.result || theoryData.results || [])
            .filter((a) => a.is_active !== false)
            .map(normItem)
            .filter((c) => c.id != null);
          const labList = (Array.isArray(labData) ? labData : labData.result || labData.results || [])
            .filter((a) => a.is_active !== false)
            .map(normItem)
            .filter((c) => c.id != null);
          setTheoryCourses(theoryList);
          setLabCourses(labList);
          setAllCourses([...theoryList, ...labList]);
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    } else {
      courseService.getAllCourses()
        .then((d) => {
          const all = Array.isArray(d) ? d : d.result || d.results || [];
          const active = all.filter((c) => c.is_active).map(normItem);
          setAllCourses(active);
          setTheoryCourses(active.filter((c) => c.course_type === "THEORY" || !c.course_type));
          setLabCourses(active.filter((c) => c.course_type === "LAB"));
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When theory course changes: load CLOs + PLOs; if no lab course selected yet, set teacher from theory
  useEffect(() => {
    if (!theoryCourseId) {
      setClos([]); setPlos([]);
      setSelectedCloIds([]); setSelectedPloIds([]);
      if (!labCourseId) setTeacherName("");
      return;
    }

    const course = allCourses.find((c) => String(c.id) === String(theoryCourseId));
    const programId = course?.program_id || course?.program;

    // Only update teacher from theory if lab course not already providing one
    if (!labCourseId) {
      const tName = course?.teacher_name || fallbackTeacher();
      setTeacherName(tName);
    }

    setLoadingClos(true);
    setSelectedCloIds([]);
    cloService.getAll({ course: theoryCourseId })
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
  }, [theoryCourseId]);

  // When lab course changes: auto-infer theory course (CMC111-L → CMC111) + update teacher
  useEffect(() => {
    if (!labCourseId) {
      setTheoryCourseId("");
      setTeacherName("");
      return;
    }

    const labCourse = labCourses.find((c) => String(c.id) === String(labCourseId));
    if (!labCourse) return;

    // Strip "-L" (case-insensitive) suffix to find the matching theory course
    const theoryCode = labCourse.code.replace(/-L$/i, "");
    const matched = theoryCourses.find(
      (c) => c.code.toLowerCase() === theoryCode.toLowerCase()
    );
    setTheoryCourseId(matched ? String(matched.id) : "");

    const tName = labCourse.teacher_name || matched?.teacher_name || fallbackTeacher();
    setTeacherName(tName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labCourseId]);

  const toggleClo = (id) =>
    setSelectedCloIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const togglePlo = (id) =>
    setSelectedPloIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!labCourseId)                { showError("Please select a lab course"); return; }
    if (!theoryCourseId)             { showError("Could not find the matching theory course for the selected lab course. Please contact admin."); return; }
    if (!topic.trim())               { showError("Please enter a topic"); return; }
    if (!teacherName.trim())         { showError("Please enter teacher name"); return; }
    if (!totalMarks)                 { showError("Please enter total marks"); return; }
    if (!totalTime)                  { showError("Please enter total time"); return; }
    if (selectedCloIds.length === 0) { showError("Select at least one CLO"); return; }
    if (selectedPloIds.length === 0) { showError("Select at least one PLO"); return; }

    setSubmitting(true);
    try {
      const payload = {
        theory_course_id: parseInt(theoryCourseId, 10),
        lab_course_id:    parseInt(labCourseId, 10),
        topic:            topic.trim(),
        teacher_name:     teacherName.trim(),
        total_marks:      totalMarks,
        total_time:       totalTime,
        clo_ids:          selectedCloIds,
        plo_ids:          selectedPloIds,
        ...(progLang && { programming_language: progLang }),
      };

      const res = await generatedPaperService.generate(payload);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Generation failed");
        return;
      }
      showSuccess(res?.status?.message || "Paper generated successfully");
      navigate("/generated-lab-papers");
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

          {/* Lab Course */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Lab Course <span className="text-danger-600">*</span>
            </label>
            {loadingCourses ? (
              <div className="placeholder-glow">
                <span className="placeholder col-12 radius-8" style={{ height: 38 }} />
              </div>
            ) : (
              <select
                className="form-control radius-8"
                value={labCourseId}
                onChange={(e) => setLabCourseId(e.target.value)}
                required
              >
                <option value="">-- Select Lab Course --</option>
                {labCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            )}
            <CourseDocsMiniPreview courseId={labCourseId} />
          </div>

          {/* Teacher Name (auto-populated, disabled) */}
          {(theoryCourseId || labCourseId) && (
            <div className="mb-20">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Teacher Name
              </label>
              <select
                className="form-control radius-8"
                value={teacherName}
                disabled
              >
                <option value={teacherName}>{teacherName || "—"}</option>
              </select>
            </div>
          )}

          {/* Topic */}
          <div className="mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Topic <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              className={`form-control radius-8 ${topicError ? "is-invalid" : ""}`}
              placeholder="e.g., Machine Learning Fundamentals"
              value={topic}
              onChange={(e) => { setTopic(e.target.value); if (topicError) setTopicError(""); }}
              required
            />
            <small className="text-secondary-light">Topic must be correctly spelled and relevant to the selected CLOs and PLOs.</small>
            {topicError && (
              <div className="alert alert-danger radius-8 mt-8 text-sm py-8 px-12">{topicError}</div>
            )}
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
            <small className="text-secondary-light">Required if the course involves programming topics. All code in the paper will use this language.</small>
          </div>

          {/* Total Marks + Total Time */}
          <div className="row g-3 mb-24">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Total Marks <span className="text-danger-600">*</span>
              </label>
              {!customMarks ? (
                <div className="d-flex gap-8">
                  <select
                    className="form-control radius-8 flex-grow-1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  >
                    {MARKS_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-secondary radius-8 text-sm px-12"
                    onClick={() => setCustomMarks(true)}
                  >
                    Custom
                  </button>
                </div>
              ) : (
                <div className="d-flex gap-8">
                  <input
                    type="text"
                    className="form-control radius-8 flex-grow-1"
                    placeholder="e.g., 45"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary radius-8 text-sm px-12"
                    onClick={() => { setCustomMarks(false); setTotalMarks("60"); }}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Total Time <span className="text-danger-600">*</span>
              </label>
              {!customTime ? (
                <div className="d-flex gap-8">
                  <select
                    className="form-control radius-8 flex-grow-1"
                    value={totalTime}
                    onChange={(e) => setTotalTime(e.target.value)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-secondary radius-8 text-sm px-12"
                    onClick={() => setCustomTime(true)}
                  >
                    Custom
                  </button>
                </div>
              ) : (
                <div className="d-flex gap-8">
                  <input
                    type="text"
                    className="form-control radius-8 flex-grow-1"
                    placeholder="e.g., 2 Hours and 30 Minutes"
                    value={totalTime}
                    onChange={(e) => setTotalTime(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary radius-8 text-sm px-12"
                    onClick={() => { setCustomTime(false); setTotalTime("2 Hours 30 Minutes"); }}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CLOs + PLOs */}
          <div className="row g-4 mb-20">
            <div className="col-lg-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                CLOs <span className="text-danger-600">*</span>
                {clos.length > 0 && (
                  <span className="ms-8 badge bg-info-focus text-info-main radius-4">
                    {selectedCloIds.length} selected
                  </span>
                )}
              </label>
              <div className="border radius-8 p-12" style={{ minHeight: 80, maxHeight: 280, overflowY: "auto" }}>
                {loadingClos ? (
                  <div className="text-center py-16">
                    <span className="spinner-border spinner-border-sm" />
                  </div>
                ) : clos.length === 0 ? (
                  <p className="text-secondary-light text-sm mb-0">
                    {labCourseId ? (theoryCourseId ? "No CLOs found for this course" : "Could not find matching theory course for CLOs") : "Select a lab course first"}
                  </p>
                ) : (
                  clos.map((c) => (
                    <CheckItem
                      key={c.id}
                      badge={`CLO-${c.clo_number}`}
                      badgeColor="info"
                      label={c.description || `CLO ${c.clo_number}`}
                      checked={selectedCloIds.includes(c.id)}
                      onClick={() => toggleClo(c.id)}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                PLOs <span className="text-danger-600">*</span>
                {plos.length > 0 && (
                  <span className="ms-8 badge bg-success-focus text-success-main radius-4">
                    {selectedPloIds.length} selected
                  </span>
                )}
              </label>
              <div className="border radius-8 p-12" style={{ minHeight: 80, maxHeight: 280, overflowY: "auto" }}>
                {loadingPlos ? (
                  <div className="text-center py-16">
                    <span className="spinner-border spinner-border-sm" />
                  </div>
                ) : plos.length === 0 ? (
                  <p className="text-secondary-light text-sm mb-0">
                    {labCourseId ? (theoryCourseId ? "No PLOs found for this program" : "Could not find matching theory course for PLOs") : "Select a lab course first"}
                  </p>
                ) : (
                  plos.map((p) => (
                    <CheckItem
                      key={p.id}
                      badge={`PLO-${p.plo_number}`}
                      badgeColor="success"
                      label={p.description || `PLO ${p.plo_number}`}
                      checked={selectedPloIds.includes(p.id)}
                      onClick={() => togglePlo(p.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="d-flex gap-3 pt-24 border-top mt-4">
            <button
              type="submit"
              className="btn btn-primary radius-8 py-10 px-32 d-inline-flex align-items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <><span className="spinner-border spinner-border-sm me-6" /> Generating…</>
              ) : (
                <><Icon icon="solar:magic-stick-3-outline" className="text-lg" /> Generate Lab Paper</>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/generated-lab-papers")}
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

export default GeneratePaperLabLayer;
