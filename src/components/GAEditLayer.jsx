import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gaService } from "../api/ga.service";
import { programService } from "../api/program.service";
import { ploService } from "../api/plo.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const GA_NAMES = [
  "Individual and Teamwork",
  "Communication",
  "Computing Professionalism and Society",
  "Ethics",
  "Life-long Learning",
];

const GAEditLayer = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [formData,      setFormData]      = useState({ program: "", ga_number: "", name: "", description: "" });
  const [programs,      setPrograms]      = useState([]);
  const [availablePLOs, setAvailablePLOs] = useState([]);
  const [selectedPLOs,  setSelectedPLOs]  = useState([]);
  const [loadingPLOs,   setLoadingPLOs]   = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [fetchingId,    setFetchingId]    = useState(true);

  useEffect(() => {
    Promise.all([gaService.getById(id), programService.getAllPrograms()])
      .then(([gaData, progData]) => {
        const ga = gaData?.result?.[0] ?? gaData?.result ?? gaData;
        const programId = String(ga.program || "");
        setFormData({
          program:     programId,
          ga_number:   String(ga.ga_number || ""),
          name:        ga.name || "",
          description: ga.description || "",
        });
        setPrograms(Array.isArray(progData) ? progData : progData.result || progData.results || []);

        const mapped = (ga.mapped_plos || []).map((p) => (typeof p === "object" ? p.id : p));
        setSelectedPLOs(mapped);

        if (programId) {
          setLoadingPLOs(true);
          return ploService.getAll({ program: programId }).then((data) => {
            setAvailablePLOs(Array.isArray(data) ? data : data.result || data.results || []);
          });
        }
      })
      .catch((err) => showError(getApiError(err)))
      .finally(() => { setFetchingId(false); setLoadingPLOs(false); });
  }, [id]);

  const handleProgramChange = async (programId) => {
    setFormData((prev) => ({ ...prev, program: programId }));
    setSelectedPLOs([]);
    setAvailablePLOs([]);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePLO = (ploId) => {
    setSelectedPLOs((prev) =>
      prev.includes(ploId) ? prev.filter((x) => x !== ploId) : [...prev, ploId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        program:     parseInt(formData.program, 10),
        ga_number:   parseInt(formData.ga_number, 10),
        name:        formData.name.trim(),
        description: formData.description.trim(),
        mapped_plos: selectedPLOs,
      };
      const res = await gaService.update(id, payload);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Update failed"); return; }
      showSuccess(res?.status?.message || "GA updated successfully");
      navigate("/gas");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const isCustomName = formData.name && !GA_NAMES.includes(formData.name);

  if (fetchingId) return <div className="card"><div className="card-body text-center py-40">Loading…</div></div>;

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-7 col-xl-9 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Edit Graduate Attribute (GA)</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Program <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      name="program"
                      value={formData.program}
                      onChange={(e) => handleProgramChange(e.target.value)}
                      required
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      GA Number <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control radius-8"
                      name="ga_number"
                      min="1"
                      value={formData.ga_number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      GA Name <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      name="name"
                      value={isCustomName ? "__custom__" : formData.name}
                      onChange={(e) => {
                        if (e.target.value !== "__custom__") {
                          setFormData((prev) => ({ ...prev, name: e.target.value }));
                        } else {
                          setFormData((prev) => ({ ...prev, name: "" }));
                        }
                      }}
                      required={!isCustomName}
                    >
                      <option value="">-- Select GA Name --</option>
                      {GA_NAMES.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                      <option value="__custom__">Other (type below)</option>
                    </select>
                    {isCustomName && (
                      <input
                        type="text"
                        className="form-control radius-8 mt-8"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter custom GA name…"
                        required
                      />
                    )}
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Description <span className="text-danger-600">*</span>
                    </label>
                    <textarea
                      className="form-control radius-8"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      required
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
                    {!formData.program ? (
                      <p className="text-secondary-light text-sm">Select a program first to load available PLOs.</p>
                    ) : loadingPLOs ? (
                      <p className="text-secondary-light text-sm">Loading PLOs…</p>
                    ) : availablePLOs.length === 0 ? (
                      <div className="alert alert-info radius-8 text-sm mb-0">
                        No PLOs found for this program.
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
                      {loading ? "Saving…" : "Save Changes"}
                    </button>
                    <button type="button" onClick={() => navigate("/gas")} className="btn btn-outline-secondary radius-8 py-10 flex-grow-1">
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

export default GAEditLayer;
