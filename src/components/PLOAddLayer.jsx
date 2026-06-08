import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ploService } from "../api/plo.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const PLOAddLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ program: "", plo_number: "", description: "" });
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
        program:    parseInt(formData.program, 10),
        plo_number: parseInt(formData.plo_number, 10),
        description: formData.description.trim(),
      };
      const res = await ploService.create(payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Create failed"); return; }
      showSuccess(res?.status?.message || "PLO created successfully");
      navigate("/plos");
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
                <h5 className="mb-0">Add New PLO</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Program <span className="text-danger-600">*</span>
                    </label>
                    <select className="form-control radius-8" name="program" value={formData.program} onChange={handleChange} required>
                      <option value="">-- Select Program --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      PLO Number <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control radius-8"
                      name="plo_number"
                      placeholder="e.g., 1"
                      min="1"
                      value={formData.plo_number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Description <span className="text-danger-600">*</span>
                    </label>
                    <textarea
                      className="form-control radius-8"
                      name="description"
                      rows={4}
                      placeholder="Describe what students should achieve…"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button type="submit" className="btn btn-primary radius-8 py-10 flex-grow-1" disabled={loading}>
                      {loading ? "Creating…" : "Create PLO"}
                    </button>
                    <button type="button" onClick={() => navigate("/plos")} className="btn btn-outline-secondary radius-8 py-10 flex-grow-1">
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

export default PLOAddLayer;