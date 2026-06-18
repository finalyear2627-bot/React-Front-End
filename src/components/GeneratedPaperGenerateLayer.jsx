import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { generatedPaperService } from "../api/generatedPaper.service";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { courseService } from "../api/course.service";
import { cloService } from "../api/clo.service";
import { ploService } from "../api/plo.service";
import { courseDocumentService } from "../api/courseDocument.service";
import { semesterService } from "../api/semester.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const MARKS_OPTIONS = ["20","25", "30", "40", "50", "60", "80", "100"];
const TIME_OPTIONS  = [
  "1 Hour", "1 Hour 30 Minutes", "2 Hours", "2 Hours 30 Minutes", "3 Hours",
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

/* ── Small doc-row shown in the uploaded list ── */
const DocRow = ({ doc, deletingId, onDelete }) => (
  <div className="d-flex align-items-start justify-content-between gap-8 p-10 radius-8 border mb-6">
    <div className="flex-grow-1 min-w-0">
      <div className="fw-medium text-sm text-truncate" title={doc.title}>{doc.title || "—"}</div>
      <div className="text-secondary-light mt-2" style={{ fontSize: 11 }}>
        {doc.file_name || doc.file?.split("/").pop() || ""}
      </div>
    </div>
    <button
      type="button"
      disabled={deletingId === doc.id}
      onClick={() => onDelete(doc.id)}
      className="flex-shrink-0 w-24-px h-24-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
      title="Delete"
    >
      {deletingId === doc.id
        ? <span className="spinner-border spinner-border-sm" style={{ width: 10, height: 10 }} />
        : <Icon icon="mingcute:delete-2-line" style={{ fontSize: 12 }} />}
    </button>
  </div>
);

const GeneratedPaperGenerateLayer = () => {
  const navigate = useNavigate();

  /* ── Generate form state ── */
  const [theoryCourseId,  setTheoryCourseId]  = useState("");
  const [topic,           setTopic]           = useState("");
  const [term,            setTerm]            = useState("MIDTERM");
  const [progLang,        setProgLang]        = useState("");
  const [teacherName,     setTeacherName]     = useState("");
  const [totalMarks,      setTotalMarks]      = useState("60");
  const [totalTime,       setTotalTime]       = useState("2 Hours 30 Minutes");
  const [customMarks,     setCustomMarks]     = useState(false);
  const [customTime,      setCustomTime]      = useState(false);

  const [theoryCourses,   setTheoryCourses]   = useState([]);
  const [allCourses,      setAllCourses]      = useState([]);
  const [clos,            setClos]            = useState([]);
  const [plos,            setPlos]            = useState([]);
  const [selectedCloIds,  setSelectedCloIds]  = useState([]);
  const [selectedPloIds,  setSelectedPloIds]  = useState([]);

  const [semesters,       setSemesters]       = useState([]);
  const [semesterName,    setSemesterName]    = useState("");

  const [loadingCourses,  setLoadingCourses]  = useState(true);
  const [loadingClos,     setLoadingClos]     = useState(false);
  const [loadingPlos,     setLoadingPlos]     = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [topicError,      setTopicError]      = useState("");

  /* ── Document state ── */
  const [documents,       setDocuments]       = useState([]);
  const [loadingDocs,     setLoadingDocs]     = useState(false);
  const [deletingDocId,   setDeletingDocId]   = useState(null);

  /* Slides upload */
  const [slideFile,       setSlideFile]       = useState(null);
  const [uploadingSlide,  setUploadingSlide]  = useState(false);
  const [slideError,      setSlideError]      = useState("");
  const slideFileRef = useRef(null);

  /* Outline upload */
  const [outlineFile,     setOutlineFile]     = useState(null);
  const [uploadingOutline,setUploadingOutline]= useState(false);
  const [outlineError,    setOutlineError]    = useState("");
  const outlineFileRef = useRef(null);

  const fallbackTeacher = () =>
    `${localStorage.getItem("user_first_name") || ""} ${localStorage.getItem("user_last_name") || ""}`.trim();

  /* Derived lists */
  const slides   = documents.filter((d) => d.doc_type === "SLIDES");
  const outlines = documents.filter((d) => d.doc_type === "OUTLINE");

  /* ── Load courses ── */
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const norm = (a) => ({
      id:           a.course_id ?? (typeof a.course === "object" ? a.course?.id : a.course) ?? a.id,
      code:         a.course_code || a.course?.code || a.code || "",
      name:         a.course_name || a.course?.name || a.name || "",
      course_type:  a.course_type || a.course?.course_type || "",
      program_id:   a.program_id || a.program || a.course?.program,
      teacher_name: a.teacher_name || (typeof a.teacher === "object"
        ? `${a.teacher?.first_name || ""} ${a.teacher?.last_name || ""}`.trim() : "") || "",
    });

    if (role === "TEACHER") {
      courseAssignmentService.getMyCourses({ course_type: "THEORY" })
        .then((d) => {
          const list = (Array.isArray(d) ? d : d.result || d.results || [])
            .filter((a) => a.is_active !== false).map(norm).filter((c) => c.id != null);
          setTheoryCourses(list);
          setAllCourses(list);
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    } else {
      courseService.getAllCourses()
        .then((d) => {
          const all = Array.isArray(d) ? d : d.result || d.results || [];
          const active = all.filter((c) => c.is_active).map(norm);
          setTheoryCourses(active.filter((c) => c.course_type === "THEORY" || !c.course_type));
          setAllCourses(active);
        })
        .catch(() => showError("Failed to load courses"))
        .finally(() => setLoadingCourses(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Load semesters ── */
  useEffect(() => {
    semesterService.getAll({ is_active: true })
      .then((d) => {
        const list = Array.isArray(d) ? d : d.result || d.results || [];
        setSemesters(list.filter((s) => s.name));
        if (list.length > 0 && list[0].name) setSemesterName(list[0].name);
      })
      .catch(() => {});
  }, []);

  /* ── CLOs / PLOs when course changes ── */
  useEffect(() => {
    if (!theoryCourseId) {
      setClos([]); setPlos([]);
      setSelectedCloIds([]); setSelectedPloIds([]);
      setTeacherName("");
      return;
    }
    const course = allCourses.find((c) => String(c.id) === String(theoryCourseId));
    setTeacherName(course?.teacher_name || fallbackTeacher());

    setLoadingClos(true);
    setSelectedCloIds([]);
    cloService.getAll({ course: theoryCourseId })
      .then((d) => setClos(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => showError("Failed to load CLOs"))
      .finally(() => setLoadingClos(false));

    const programId = course?.program_id || course?.program;
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

  /* ── Documents when course changes ── */
  const fetchDocs = useCallback(async () => {
    if (!theoryCourseId) { setDocuments([]); return; }
    setLoadingDocs(true);
    try {
      const d = await courseDocumentService.getAll({ course: theoryCourseId });
      setDocuments(Array.isArray(d) ? d : d.result || d.results || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [theoryCourseId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  /* ── CLO / PLO toggles ── */
  const toggleClo = (id) =>
    setSelectedCloIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const togglePlo = (id) =>
    setSelectedPloIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  /* ── Generate submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!theoryCourseId)             { showError("Please select a theory course"); return; }
    if (!topic.trim())               { showError("Please enter a topic"); return; }
    if (!teacherName.trim())         { showError("Please enter teacher name"); return; }
    if (!totalMarks)                 { showError("Please enter total marks"); return; }
    if (!totalTime)                  { showError("Please enter total time"); return; }
    if (selectedCloIds.length === 0) { showError("Select at least one CLO"); return; }
    if (selectedPloIds.length === 0) { showError("Select at least one PLO"); return; }
    if (slides.length === 0)   { showError("Upload at least one Slides file before generating"); return; }
    if (outlines.length === 0) { showError("Upload at least one Course Outline before generating"); return; }

    setSubmitting(true);
    try {
      const payload = {
        theory_course_id: parseInt(theoryCourseId, 10),
        topic:            topic.trim(),
        term:             term,
        semester_name:    semesterName.trim(),
        teacher_name:     teacherName.trim(),
        total_marks:      totalMarks,
        total_time:       totalTime,
        clo_ids:          selectedCloIds,
        plo_ids:          selectedPloIds,
        ...(progLang && { programming_language: progLang }),
      };
      const res = await generatedPaperService.generate(payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Generation failed"); return; }
      showSuccess(res?.status?.message || "Paper generated successfully");
      navigate("/generated-theory-papers");
    } catch (err) {
      const msg = getApiError(err);
      if (err?.response?.status === 422) setTopicError(msg);
      else showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Document delete ── */
  const handleDocDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    setDeletingDocId(id);
    try {
      await courseDocumentService.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setDeletingDocId(null);
    }
  };

  /* ── Slide upload ── */
  const handleSlideUpload = async (e) => {
    e.preventDefault();
    if (!theoryCourseId) { setSlideError("Select a course first"); return; }
    if (!slideFile)      { setSlideError("Select a PPT/PPTX file"); return; }
    setSlideError("");
    setUploadingSlide(true);
    const autoTitle = slideFile.name.replace(/\.[^/.]+$/, "");
    try {
      await courseDocumentService.upload(parseInt(theoryCourseId, 10), autoTitle, "SLIDES", slideFile);
      showSuccess("Slides uploaded");
      setSlideFile(null);
      if (slideFileRef.current) slideFileRef.current.value = "";
      fetchDocs();
    } catch (err) {
      setSlideError(getApiError(err) || "Upload failed");
    } finally {
      setUploadingSlide(false);
    }
  };

  /* ── Outline upload ── */
  const handleOutlineUpload = async (e) => {
    e.preventDefault();
    if (!theoryCourseId)     { setOutlineError("Select a course first"); return; }
    if (outlines.length > 0) { setOutlineError("Course outline already uploaded. Delete it first to replace."); return; }
    if (!outlineFile)        { setOutlineError("Select a PDF/Word file"); return; }
    setOutlineError("");
    setUploadingOutline(true);
    const autoTitle = outlineFile.name.replace(/\.[^/.]+$/, "");
    try {
      await courseDocumentService.upload(parseInt(theoryCourseId, 10), autoTitle, "OUTLINE", outlineFile);
      showSuccess("Course outline uploaded");
      setOutlineFile(null);
      if (outlineFileRef.current) outlineFileRef.current.value = "";
      fetchDocs();
    } catch (err) {
      setOutlineError(getApiError(err) || "Upload failed");
    } finally {
      setUploadingOutline(false);
    }
  };

  /* ──────────── RENDER ──────────── */
  return (
    <div className="row gy-4 align-items-start">

      {/* ── LEFT: Generate Form (col-lg-8) ── */}
      <div className="col-lg-8">
        <div className="card radius-12">
          <div className="card-body p-24">
            <form onSubmit={handleSubmit}>

              {/* Theory Course */}
              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Theory Course <span className="text-danger-600">*</span>
                </label>
                {loadingCourses ? (
                  <div className="placeholder-glow">
                    <span className="placeholder col-12 radius-8" style={{ height: 38 }} />
                  </div>
                ) : (
                  <select
                    className="form-control radius-8"
                    value={theoryCourseId}
                    onChange={(e) => setTheoryCourseId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Theory Course --</option>
                    {theoryCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Teacher Name */}
              {theoryCourseId && (
                <div className="mb-20">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">Teacher Name</label>
                  <select className="form-control radius-8" value={teacherName} disabled>
                    <option value={teacherName}>{teacherName || "—"}</option>
                  </select>
                </div>
              )}

              {/* Topic */}
              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Topic <span className="text-danger-600">*</span>
                </label>
                <textarea
                  rows={4}
                  className={`form-control radius-8 ${topicError ? "is-invalid" : ""}`}
                  placeholder="e.g., Machine Learning Fundamentals — key concepts, algorithms, and applications"
                  value={topic}
                  onChange={(e) => { setTopic(e.target.value); if (topicError) setTopicError(""); }}
                  required
                  style={{ resize: "vertical" }}
                />
                <small className="text-secondary-light">Must be correctly spelled and relevant to selected CLOs/PLOs.</small>
                {topicError && (
                  <div className="alert alert-danger radius-8 mt-8 text-sm py-8 px-12">{topicError}</div>
                )}
              </div>

              {/* Exam Term */}
              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Exam Term <span className="text-danger-600">*</span>
                </label>
                <div className="d-flex gap-24">
                  {[
                    { value: "MIDTERM", label: "Mid Term" },
                    { value: "FINAL",   label: "Final Term" },
                  ].map(({ value, label }) => (
                    <label key={value} className="d-flex align-items-center gap-8" style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="examTerm"
                        value={value}
                        checked={term === value}
                        onChange={() => setTerm(value)}
                        className="form-check-input mt-0"
                        style={{ width: 16, height: 16 }}
                      />
                      <span className="text-sm fw-semibold">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Semester */}
              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Semester <span className="text-danger-600">*</span>
                </label>
                {semesters.length > 0 ? (
                  <select
                    className="form-control radius-8"
                    value={semesterName}
                    onChange={(e) => setSemesterName(e.target.value)}
                  >
                    {semesters.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control radius-8"
                    placeholder="e.g. Fall 2025"
                    value={semesterName}
                    onChange={(e) => setSemesterName(e.target.value)}
                  />
                )}
                <small className="text-secondary-light">This name will appear on the exam paper.</small>
              </div>

              {/* Programming Language */}
              <div className="mb-20">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">Programming Language</label>
                <select className="form-control radius-8" value={progLang} onChange={(e) => setProgLang(e.target.value)}>
                  <option value="">-- None / Not Applicable --</option>
                  {PROG_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <small className="text-secondary-light">Required if the course involves programming topics.</small>
              </div>

              {/* Total Marks + Total Time */}
              <div className="row g-3 mb-24">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Total Marks <span className="text-danger-600">*</span>
                  </label>
                  {!customMarks ? (
                    <div className="d-flex gap-8">
                      <select className="form-control radius-8 flex-grow-1" value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}>
                        {MARKS_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button type="button" className="btn btn-outline-secondary radius-8 text-sm px-12"
                        onClick={() => setCustomMarks(true)}>Custom</button>
                    </div>
                  ) : (
                    <div className="d-flex gap-8">
                      <input type="text" className="form-control radius-8 flex-grow-1"
                        placeholder="e.g., 45" value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)} required />
                      <button type="button" className="btn btn-outline-secondary radius-8 text-sm px-12"
                        onClick={() => { setCustomMarks(false); setTotalMarks("60"); }}>Reset</button>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Total Time <span className="text-danger-600">*</span>
                  </label>
                  {!customTime ? (
                    <div className="d-flex gap-8">
                      <select className="form-control radius-8 flex-grow-1" value={totalTime}
                        onChange={(e) => setTotalTime(e.target.value)}>
                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button type="button" className="btn btn-outline-secondary radius-8 text-sm px-12"
                        onClick={() => setCustomTime(true)}>Custom</button>
                    </div>
                  ) : (
                    <div className="d-flex gap-8">
                      <input type="text" className="form-control radius-8 flex-grow-1"
                        placeholder="e.g., 2 Hours and 30 Minutes" value={totalTime}
                        onChange={(e) => setTotalTime(e.target.value)} required />
                      <button type="button" className="btn btn-outline-secondary radius-8 text-sm px-12"
                        onClick={() => { setCustomTime(false); setTotalTime("2 Hours 30 Minutes"); }}>Reset</button>
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
                      <div className="text-center py-16"><span className="spinner-border spinner-border-sm" /></div>
                    ) : clos.length === 0 ? (
                      <p className="text-secondary-light text-sm mb-0">
                        {theoryCourseId ? "No CLOs found for this course" : "Select a theory course first"}
                      </p>
                    ) : (
                      clos.map((c) => (
                        <CheckItem key={c.id} badge={`CLO-${c.clo_number}`} badgeColor="info"
                          label={c.description || `CLO ${c.clo_number}`}
                          checked={selectedCloIds.includes(c.id)} onClick={() => toggleClo(c.id)} />
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
                      <div className="text-center py-16"><span className="spinner-border spinner-border-sm" /></div>
                    ) : plos.length === 0 ? (
                      <p className="text-secondary-light text-sm mb-0">
                        {theoryCourseId ? "No PLOs found for this program" : "Select a theory course first"}
                      </p>
                    ) : (
                      plos.map((p) => (
                        <CheckItem key={p.id} badge={`PLO-${p.plo_number}`} badgeColor="success"
                          label={p.description || `PLO ${p.plo_number}`}
                          checked={selectedPloIds.includes(p.id)} onClick={() => togglePlo(p.id)} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Document requirement hint */}
              {theoryCourseId && (slides.length === 0 || outlines.length === 0) && (
                <div className="alert alert-warning radius-8 py-10 px-14 text-sm mb-20 d-flex align-items-center gap-8">
                  <Icon icon="solar:danger-triangle-outline" style={{ fontSize: 16, flexShrink: 0 }} />
                  <span>
                    {slides.length === 0 && outlines.length === 0
                      ? "Upload at least 1 Slides file and 1 Course Outline before generating."
                      : slides.length === 0
                      ? "Upload at least 1 Slides file (PPT/PPTX) before generating."
                      : "Upload a Course Outline (PDF/Word) before generating."}
                  </span>
                </div>
              )}

              {/* Submit */}
              <div className="d-flex gap-3 pt-24 border-top mt-4">
                <button
                  type="submit"
                  className="btn btn-primary radius-8 py-10 px-32 d-inline-flex align-items-center gap-2"
                  disabled={submitting}
                >
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-6" /> Generating…</>
                    : <><Icon icon="solar:magic-stick-3-outline" className="text-lg" /> Generate Theory Paper</>}
                </button>
                <button type="button" onClick={() => navigate("/generated-theory-papers")}
                  className="btn btn-outline-secondary radius-8 py-10 px-32">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Course Documents (col-lg-4) ── */}
      <div className="col-lg-4">
        <div style={{ position: "sticky", top: 24 }} className="d-flex flex-column gap-16">

          {/* ── Slides Upload ── */}
          <div className="card radius-12">
            <div className="card-header border-bottom pb-12">
              <h6 className="card-title mb-0 d-flex align-items-center gap-8">
                <Icon icon="solar:presentation-graph-outline" className="text-primary-600" style={{ fontSize: 18 }} />
                Slides
                {slides.length > 0 && (
                  <span className="badge bg-primary-100 text-primary-600 radius-4 ms-auto" style={{ fontSize: 11 }}>
                    {slides.length} uploaded
                  </span>
                )}
              </h6>
              <p className="text-secondary-light text-sm mb-0 mt-4">PPT / PPTX only. Multiple files allowed.</p>
            </div>
            <div className="card-body p-16">
              <form onSubmit={handleSlideUpload}>
                <div className="mb-10">
                  <label className="form-label text-sm fw-semibold mb-4">File (PPT / PPTX)</label>
                  <input
                    ref={slideFileRef}
                    type="file"
                    className="form-control form-control-sm radius-8"
                    accept=".ppt,.pptx"
                    onChange={(e) => setSlideFile(e.target.files[0] || null)}
                  />
                </div>
                {slideError && (
                  <div className="alert alert-danger py-6 px-10 text-sm radius-8 mb-8">{slideError}</div>
                )}
                <button
                  type="submit"
                  disabled={uploadingSlide}
                  className="btn btn-primary-600 btn-sm radius-8 w-100 d-flex align-items-center justify-content-center gap-6"
                >
                  {uploadingSlide
                    ? <><span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} /> Uploading…</>
                    : <><Icon icon="solar:upload-linear" style={{ fontSize: 14 }} /> Upload Slides</>}
                </button>
              </form>

              {/* Uploaded slides list */}
              {theoryCourseId && (
                <div className="mt-14 pt-14 border-top">
                  {loadingDocs ? (
                    <div className="text-center py-10">
                      <span className="spinner-border spinner-border-sm text-primary" />
                    </div>
                  ) : slides.length === 0 ? (
                    <p className="text-secondary-light text-sm mb-0">No slides uploaded yet.</p>
                  ) : (
                    slides.map((doc) => (
                      <DocRow key={doc.id} doc={doc} deletingId={deletingDocId} onDelete={handleDocDelete} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Course Outline Upload ── */}
          <div className="card radius-12">
            <div className="card-header border-bottom pb-12">
              <h6 className="card-title mb-0 d-flex align-items-center gap-8">
                <Icon icon="solar:document-text-outline" className="text-success-main" style={{ fontSize: 18 }} />
                Course Outline
                {outlines.length > 0 && (
                  <span className="badge bg-success-focus text-success-main radius-4 ms-auto" style={{ fontSize: 11 }}>
                    Uploaded
                  </span>
                )}
              </h6>
              <p className="text-secondary-light text-sm mb-0 mt-4">PDF / DOC / DOCX only. Only one outline allowed.</p>
            </div>
            <div className="card-body p-16">

              {/* If outline already uploaded, show it and block re-upload */}
              {outlines.length > 0 ? (
                <>
                  <DocRow doc={outlines[0]} deletingId={deletingDocId} onDelete={handleDocDelete} />
                  <p className="text-secondary-light text-sm mt-6 mb-0">
                    Delete the existing outline to upload a new one.
                  </p>
                </>
              ) : (
                <form onSubmit={handleOutlineUpload}>
                  <div className="mb-10">
                    <label className="form-label text-sm fw-semibold mb-4">File (PDF / DOC / DOCX)</label>
                    <input
                      ref={outlineFileRef}
                      type="file"
                      className="form-control form-control-sm radius-8"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setOutlineFile(e.target.files[0] || null)}
                    />
                  </div>
                  {outlineError && (
                    <div className="alert alert-danger py-6 px-10 text-sm radius-8 mb-8">{outlineError}</div>
                  )}
                  <button
                    type="submit"
                    disabled={uploadingOutline}
                    className="btn btn-success-600 btn-sm radius-8 w-100 d-flex align-items-center justify-content-center gap-6"
                  >
                    {uploadingOutline
                      ? <><span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} /> Uploading…</>
                      : <><Icon icon="solar:upload-linear" style={{ fontSize: 14 }} /> Upload Outline</>}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default GeneratedPaperGenerateLayer;
