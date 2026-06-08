import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { semesterService } from "../api/semester.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const SemesterAddLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name:            "",
    program:         "",
    study_year:      "",
    semester_number: "",
    start_date:      "",
    end_date:        "",
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
        name:            formData.name.trim(),
        program:         parseInt(formData.program, 10),
        study_year:      formData.study_year.trim(),
        semester_number: parseInt(formData.semester_number, 10),
        ...(formData.start_date && { start_date: formData.start_date }),
        ...(formData.end_date   && { end_date:   formData.end_date   }),
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

                  {/* Semester Name */}
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

                  {/* Study Year + Semester Number side by side */}
                  <div className="row g-3 mb-20">
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Study Year <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control radius-8"
                        name="study_year"
                        placeholder="e.g., 2024-2025"
                        value={formData.study_year}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Semester Number <span className="text-danger-600">*</span>
                      </label>
                      <select
                        className="form-control radius-8"
                        name="semester_number"
                        value={formData.semester_number}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Select --</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>Semester {n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Start Date + End Date */}
                  <div className="row g-3 mb-20">
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="form-control radius-8"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="form-control radius-8"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                      />
                    </div>
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