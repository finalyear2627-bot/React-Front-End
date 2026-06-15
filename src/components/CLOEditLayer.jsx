import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cloService } from "../api/clo.service";
import { courseService } from "../api/course.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const BT_LEVELS = [
  { group: "Cognitive (C)",   options: ["C1 — Remember", "C2 — Understand", "C3 — Apply", "C4 — Analyze", "C5 — Evaluate", "C6 — Create"] },
  { group: "Psychomotor (P)", options: ["P1 — Imitation", "P2 — Manipulation", "P3 — Precision", "P4 — Articulation", "P5 — Naturalization"] },
  { group: "Affective (A)",   options: ["A1 — Receiving", "A2 — Responding", "A3 — Valuing", "A4 — Organizing", "A5 — Characterizing"] },
];

const CLOEditLayer = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [formData,   setFormData]   = useState({ course_code: "", clo_number: "", description: "", bt_level: "", ga_code: "" });
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [fetchingId, setFetchingId] = useState(true);

  useEffect(() => {
    Promise.all([cloService.getById(id), courseService.getAllCourses()])
      .then(([cloData, courseData]) => {
        const clo        = cloData?.result?.[0] ?? cloData?.result ?? cloData;
        const allCourses = Array.isArray(courseData) ? courseData : courseData.result || courseData.results || [];
        setCourses(allCourses);
        setFormData({
          course_code: clo.course_code || clo.course_detail?.code || "",
          clo_number:  String(clo.clo_number || ""),
          description: clo.description || "",
          bt_level:    clo.bt_level || "",
          ga_code:     clo.ga_code || "",
        });
      })
      .catch((err) => showError(getApiError(err)))
      .finally(() => setFetchingId(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        course_code: formData.course_code,
        clo_number:  parseInt(formData.clo_number, 10),
        bt_level:    formData.bt_level,
        description: formData.description.trim(),
        ...(formData.ga_code.trim() && { ga_code: formData.ga_code.trim() }),
      };

      const res = await cloService.update(id, payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Update failed"); return; }
      showSuccess(res?.status?.message || "CLO updated successfully");
      navigate("/clos");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetchingId) return <div className="card"><div className="card-body text-center py-40">Loading…</div></div>;

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-7 col-xl-9 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Edit CLO</h5>
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
                      name="course_code"
                      value={formData.course_code}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* CLO Number */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      CLO Number <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      name="clo_number"
                      value={formData.clo_number}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select --</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>

                  {/* BT Level */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      BT Level <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      name="bt_level"
                      value={formData.bt_level}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select BT Level --</option>
                      {BT_LEVELS.map((grp) => (
                        <optgroup key={grp.group} label={grp.group}>
                          {grp.options.map((opt) => {
                            const code = opt.split(" — ")[0];
                            return <option key={code} value={code}>{opt}</option>;
                          })}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* GA Code */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      GA Code
                      <span className="text-secondary-light fw-normal ms-8 text-xs">optional — e.g. GA1, GA-2</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      name="ga_code"
                      placeholder="e.g. GA1 or GA-2"
                      value={formData.ga_code}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Description
                      <span className="text-secondary-light fw-normal ms-8 text-xs">optional</span>
                    </label>
                    <textarea
                      className="form-control radius-8"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button type="submit" className="btn btn-primary radius-8 py-10 flex-grow-1" disabled={loading}>
                      {loading ? "Saving…" : "Save Changes"}
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

export default CLOEditLayer;
