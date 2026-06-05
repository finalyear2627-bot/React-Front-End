import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const ProgramAddLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ code: "", name: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await programService.createProgram(formData);
      const msg = res?.status?.message || "Program created successfully";
      showSuccess(msg);
      navigate("/programs");
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
                <h5 className="mb-0">Add New Program</h5>
              </div>
              <div className="card-body">
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
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Program"}
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

export default ProgramAddLayer;
