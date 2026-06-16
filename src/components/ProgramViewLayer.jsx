import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { programService } from "../api/program.service";
import { showError, getApiError } from "../utils/toast";

const ProgramViewLayer = () => {
  const userRole = localStorage.getItem("user_role");
  const navigate = useNavigate();
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const data = await programService.getProgramById(id);
      const program = data?.result?.[0] ?? data?.result ?? data;
      setProgram(program);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load program");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">Loading...</div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger">{error || "Program not found"}</div>
          <Link to="/programs" className="btn btn-primary mt-16">
            Back to Programs
          </Link>
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
              <div className="card-header border-bottom py-16 px-24 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Program Details</h5>
                
                  <div>
                    {userRole === "ADMIN" && (
                    <Link
                      to={`/program-edit/${program.id}`}
                      className="btn btn-sm btn-success me-8"
                    >
                      <Icon icon="lucide:edit" className="me-2" />
                    Edit
                  </Link>
                  )}
                  <Link to="/programs" className="btn btn-sm btn-secondary">
                    Back
                  </Link>
                </div>
              </div>

              <div className="card-body">
                <div className="mb-24 pb-24 border-bottom">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Program Code
                  </label>
                  <p className="text-md mb-0 fw-medium">{program.code || "N/A"}</p>
                </div>

                <div className="mb-24">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Program Name
                  </label>
                  <p className="text-md mb-0">{program.name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramViewLayer;

