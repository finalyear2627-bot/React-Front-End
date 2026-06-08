import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cloService } from "../api/clo.service";
import { courseService } from "../api/course.service";
import { ploService } from "../api/plo.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const CLOAddLayer = () => {
  const navigate = useNavigate();
  const [formData,     setFormData]     = useState({ course: "", clo_number: "", description: "" });
  const [courses,      setCourses]      = useState([]);
  const [availablePLOs, setAvailablePLOs] = useState([]);
  const [selectedPLOs, setSelectedPLOs] = useState([]);
  const [loadingPLOs,  setLoadingPLOs]  = useState(false);
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    courseService
      .getAllCourses()
      .then((d) => setCourses(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => {});
  }, []);

  const handleCourseChange = async (courseId) => {
    setFormData((prev) => ({ ...prev, course: courseId }));
    setSelectedPLOs([]);
    setAvailablePLOs([]);
    if (!courseId) return;
    const course = courses.find((c) => String(c.id) === String(courseId));
    if (!course) return;
    const programId = course.program || course.program_detail?.id;
    if (!programId) return;
    setLoadingPLOs(true);
    try {
      const data = await ploService.getAll({ program: programId });
      setAvailablePLOs(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (_) {
      setAvailablePLOs([]);
    } finally {
      setLoadingPLOs(false);
    }
  };

  const togglePLO = (id) => {
    setSelectedPLOs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        course:      parseInt(formData.course, 10),
        clo_number:  parseInt(formData.clo_number, 10),
        description: formData.description.trim(),
        mapped_plos: selectedPLOs,
      };
      const res = await cloService.create(payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Create failed"); return; }
      showSuccess(res?.status?.message || "CLO created successfully");
      navigate("/clos");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-7 col-xl-9 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Add New CLO</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  {/* Course */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Course <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      name="course"
                      value={formData.course}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      required
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* CLO Number */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      CLO Number <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="number" className="form-control radius-8" name="clo_number"
                      placeholder="e.g., 1" min="1"
                      value={formData.clo_number} onChange={handleChange} required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Description <span className="text-danger-600">*</span>
                    </label>
                    <textarea
                      className="form-control radius-8" name="description" rows={4}
                      placeholder="Describe what students should be able to do…"
                      value={formData.description} onChange={handleChange} required
                    />
                  </div>

                  {/* Mapped PLOs */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Map to PLOs
                      {selectedPLOs.length > 0 && (
                        <span className="badge bg-primary-600 text-white ms-8 radius-4 fw-normal text-xs">
                          {selectedPLOs.length} selected
                        </span>
                      )}
                    </label>

                    {!formData.course ? (
                      <p className="text-secondary-light text-sm">Select a course first to load available PLOs.</p>
                    ) : loadingPLOs ? (
                      <p className="text-secondary-light text-sm">Loading PLOs…</p>
                    ) : availablePLOs.length === 0 ? (
                      <div className="alert alert-info radius-8 text-sm mb-0">
                        No PLOs found for this course's program. Add PLOs first.
                      </div>
                    ) : (
                      <div className="border radius-8 p-12" style={{ maxHeight: 240, overflowY: "auto" }}>
                        {availablePLOs.map((plo) => (
                          <div
                            key={plo.id}
                            className={`d-flex align-items-start gap-12 p-10 radius-6 mb-6 cursor-pointer ${selectedPLOs.includes(plo.id) ? "bg-primary-50 border border-primary-200" : "bg-base"}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => togglePLO(plo.id)}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input mt-1 flex-shrink-0"
                              checked={selectedPLOs.includes(plo.id)}
                              onChange={() => togglePLO(plo.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ width: 16, height: 16 }}
                            />
                            <div>
                              <span className="badge bg-primary-100 text-primary-600 radius-4 me-8 text-xs fw-semibold">
                                PLO-{plo.plo_number}
                              </span>
                              <span className="text-sm text-secondary-light">{plo.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button type="submit" className="btn btn-primary radius-8 py-10 flex-grow-1" disabled={loading}>
                      {loading ? "Creating…" : "Create CLO"}
                    </button>
                    <button type="button" onClick={() => navigate("/clos")} className="btn btn-outline-secondary radius-8 py-10 flex-grow-1">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CLOAddLayer;