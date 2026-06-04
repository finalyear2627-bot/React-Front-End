import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { programService } from "../api/program.service";

const ProgramEditLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const data = await programService.getProgramById(id);
      setFormData(data);
      setError("");
    } catch (err) {
      console.error("Error fetching program:", err);
      setError("Failed to load program");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await programService.updateProgram(id, formData);
      navigate("/programs");
    } catch (err) {
      console.error("Error updating program:", err);
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || "Failed to update program");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card h-100 p-0 radius-12">
        <div className="card-body p-24">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Edit Program</h5>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-danger mb-20">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-20">
                    <label htmlFor="code" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Program Code <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="code"
                      name="code"
                      placeholder="e.g., BSSE"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-20">
                    <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Program Name <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="name"
                      name="name"
                      placeholder="e.g., BS Software Engineering"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button
                      type="submit"
                      className="btn btn-primary radius-8 py-10 flex-grow-1"
                      disabled={submitting}
                    >
                      {submitting ? "Updating..." : "Update Program"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/programs")}
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

export default ProgramEditLayer;

