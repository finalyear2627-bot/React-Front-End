import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { semesterService } from "../api/semester.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const SemesterAddLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name:       "",
    program:    "",
    study_year: "",
  });
  const [programs, setPrograms] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    programService
      .getAllPrograms()
      .then((d) => setPrograms(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name:       formData.name.trim(),
        program:    parseInt(formData.program, 10),
        study_year: parseInt(formData.study_year, 10),
      };
      const res = await semesterService.create(payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Failed to create"); return; }
      showSuccess(res?.status?.message || "Semester created successfully");
      navigate("/semesters");
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
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Add New Semester</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  {/* Name */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Semester Name <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      name="name"
                      placeholder="e.g., Fall 2024 / Spring 2025"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Program */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Program <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Study Year */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Study Year <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      name="study_year"
                      value={formData.study_year}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Year --</option>
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button
                      type="submit"
                      className="btn btn-primary radius-8 py-10 flex-grow-1"
                      disabled={loading}
                    >
                      {loading ? "Creating…" : "Create Semester"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/semesters")}
                      className="btn btn-outline-secondary radius-8 py-10 flex-grow-1"
                    >
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

export default SemesterAddLayer;