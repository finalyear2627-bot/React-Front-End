import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generatedPaperService } from "../api/generatedPaper.service";
import { courseService } from "../api/course.service";
import { cloService } from "../api/clo.service";
import { ploService } from "../api/plo.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const CheckGroup = ({ title, items, selected, onToggle, color = "primary", emptyMsg }) => (
  <div className="border radius-8 p-12" style={{ maxHeight: 220, overflowY: "auto" }}>
    {items.length === 0 ? (
      <p className="text-secondary-light text-sm mb-0">{emptyMsg}</p>
    ) : (
      items.map((item) => {
        const checked = selected.includes(item.id);
        return (
          <div key={item.id} className="form-check mb-8">
            <input
              className="form-check-input"
              type="checkbox"
              id={`${title}-${item.id}`}
              checked={checked}
              onChange={() => onToggle(item.id)}
            />
            <label className="form-check-label text-sm cursor-pointer" htmlFor={`${title}-${item.id}`}>
              <span className={`badge bg-${color}-100 text-${color}-600 radius-4 me-6`}>
                CLO-{item.clo_number || item.id}
              </span>
              {item.description || item.name || `CLO ${item.id}`}
            </label>
          </div>
        );
      })
    )}
  </div>
);

const GeneratedPaperGenerateLayer = () => {
  const navigate = useNavigate();

  const [topic,           setTopic]           = useState("");
  const [theoryCourseId,  setTheoryCourseId]  = useState("");
  const [labCourseId,     setLabCourseId]     = useState("");
  const [selectedCloIds,  setSelectedCloIds]  = useState([]);
  const [selectedPloIds,  setSelectedPloIds]  = useState([]);

  const [theoryCourses, setTheoryCourses] = useState([]);
  const [labCourses,    setLabCourses]    = useState([]);
  const [theoryClos,    setTheoryClos]    = useState([]);
  const [labClos,       setLabClos]       = useState([]);
  const [plos,          setPlos]          = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingTClos,   setLoadingTClos]   = useState(false);
  const [loadingLClos,   setLoadingLClos]   = useState(false);
  const [loadingPlos,    setLoadingPlos]    = useState(true);
  const [submitting,     setSubmitting]     = useState(false);

  // Load all active courses + all PLOs on mount
  useEffect(() => {
    courseService
      .getAllCourses()
      .then((d) => {
        const all = Array.isArray(d) ? d : d.result || d.results || [];
        const active = all.filter((c) => c.is_active);
        setTheoryCourses(active.filter((c) => c.course_type === "THEORY"));
        setLabCourses(active.filter((c) => c.course_type === "LAB"));
      })
      .catch(() => showError("Failed to load courses"))
      .finally(() => setLoadingCourses(false));

    ploService
      .getAll()
      .then((d) => setPlos(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => showError("Failed to load PLOs"))
      .finally(() => setLoadingPlos(false));
  }, []);

  // Fetch CLOs when theory course changes
  useEffect(() => {
    if (!theoryCourseId) { setTheoryClos([]); return; }
    setLoadingTClos(true);
    setSelectedCloIds((prev) => prev.filter((id) => labClos.some((c) => c.id === id)));
    cloService
      .getAll({ course: theoryCourseId })
      .then((d) => setTheoryClos(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => showError("Failed to load theory CLOs"))
      .finally(() => setLoadingTClos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theoryCourseId]);

  // Fetch CLOs when lab course changes
  useEffect(() => {
    if (!labCourseId) { setLabClos([]); return; }
    setLoadingLClos(true);
    setSelectedCloIds((prev) => prev.filter((id) => theoryClos.some((c) => c.id === id)));
    cloService
      .getAll({ course: labCourseId })
      .then((d) => setLabClos(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => showError("Failed to load lab CLOs"))
      .finally(() => setLoadingLClos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labCourseId]);

  const toggleClo = (id) =>
    setSelectedCloIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const togglePlo = (id) =>
    setSelectedPloIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const theorySelected = selectedCloIds.filter((id) => theoryClos.some((c) => c.id === id));
  const labSelected    = selectedCloIds.filter((id) => labClos.some((c) => c.id === id));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!theoryCourseId) { showError("Please select a theory course"); return; }
    if (!labCourseId)    { showError("Please select a lab course"); return; }
    if (theorySelected.length === 0) { showError("Select at least one CLO from the theory course"); return; }
    if (labSelected.length === 0)    { showError("Select at least one CLO from the lab course"); return; }
    if (selectedPloIds.length === 0) { showError("Select at least one PLO"); return; }
    if (!topic.trim())               { showError("Please enter a topic"); return; }

    setSubmitting(true);
    try {
      const payload = {
        theory_course_id: parseInt(theoryCourseId, 10),
        lab_course_id:    parseInt(labCourseId, 10),
        topic:            topic.trim(),
        clo_ids:          selectedCloIds,
        plo_ids:          selectedPloIds,
      };
      const res = await generatedPaperService.generate(payload);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Generation failed");
        return;
      }
      showSuccess(res?.status?.message || "Paper generation started successfully");
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
          <div className="row g-4">

            {/* Left column */}
            <div className="col-lg-6">

              {/* Topic */}
              <div className="mb-20">
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

              {/* Theory Course */}
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

              {/* Theory CLOs */}
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
                  <CheckGroup
                    title="theory"
                    items={theoryClos}
                    selected={selectedCloIds}
                    onToggle={toggleClo}
                    color="info"
                    emptyMsg={theoryCourseId ? "No CLOs found for this course" : "Select a theory course first"}
                  />
                )}
              </div>

              {/* Lab Course */}
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
                    onChange={(e) => { setLabCourseId(e.target.value); setSelectedCloIds((prev) => prev.filter((id) => theoryClos.some((c) => c.id === id))); }}
                    required
                  >
                    <option value="">-- Select Lab Course --</option>
                    {labCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Lab CLOs */}
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
                  <CheckGroup
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

            {/* Right column — PLOs */}
            <div className="col-lg-6">
              <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                Program Learning Outcomes (PLOs){" "}
                <span className="text-danger-600">*</span>
                {selectedPloIds.length > 0 && (
                  <span className="ms-8 badge bg-primary-100 text-primary-600 radius-4">
                    {selectedPloIds.length} selected
                  </span>
                )}
              </label>

              {loadingPlos ? (
                <div className="text-center py-40"><span className="spinner-border spinner-border-sm" /></div>
              ) : plos.length === 0 ? (
                <div className="border radius-8 p-20 text-center text-secondary-light">
                  No PLOs found. Please add PLOs first.
                </div>
              ) : (
                <div className="border radius-8 p-12" style={{ maxHeight: 480, overflowY: "auto" }}>
                  {plos.map((plo) => {
                    const checked = selectedPloIds.includes(plo.id);
                    return (
                      <div key={plo.id} className="form-check mb-10">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`plo-${plo.id}`}
                          checked={checked}
                          onChange={() => togglePlo(plo.id)}
                        />
                        <label className="form-check-label text-sm cursor-pointer" htmlFor={`plo-${plo.id}`}>
                          <span className="badge bg-primary-100 text-primary-600 radius-4 me-6">
                            PLO-{plo.plo_number || plo.id}
                          </span>
                          {plo.description || plo.name || `PLO ${plo.id}`}
                          {plo.program_name && (
                            <span className="text-secondary-light ms-6">({plo.program_name})</span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary card */}
              <div className="card border mt-20 mb-0">
                <div className="card-body p-16">
                  <h6 className="fw-semibold mb-12 text-primary-light">Selection Summary</h6>
                  <div className="d-flex justify-content-between mb-8">
                    <span className="text-sm text-secondary-light">Theory CLOs selected</span>
                    <span className={`badge radius-4 ${theorySelected.length > 0 ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                      {theorySelected.length} / {theoryClos.length}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-8">
                    <span className="text-sm text-secondary-light">Lab CLOs selected</span>
                    <span className={`badge radius-4 ${labSelected.length > 0 ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                      {labSelected.length} / {labClos.length}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-sm text-secondary-light">PLOs selected</span>
                    <span className={`badge radius-4 ${selectedPloIds.length > 0 ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                      {selectedPloIds.length} / {plos.length}
                    </span>
                  </div>
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