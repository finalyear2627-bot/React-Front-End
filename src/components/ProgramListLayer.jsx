import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { programService } from "../api/program.service";

const ProgramListLayer = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await programService.getAllPrograms();
      setPrograms(Array.isArray(data) ? data : data.results || []);
      setError("");
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await programService.deleteProgram(id);
        setPrograms(programs.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Error deleting program:", err);
        alert("Failed to delete program");
      }
    }
  };

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Programs</h5>
        <Link
          to="/program-add"
          className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
        >
          <Icon icon="ic:round-plus" className="text-xl" />
          Add Program
        </Link>
      </div>

      {error && (
        <div className="card-body">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      <div className="card-body">
        {programs.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No programs found</p>
            <Link to="/program-add" className="btn btn-sm btn-primary mt-16">
              Create First Program
            </Link>
          </div>
        ) : (
          <table className="table bordered-table mb-0">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Code</th>
                <th scope="col">Name</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program, index) => (
                <tr key={program.id || index}>
                  <td>{program.id}</td>
                  <td className="fw-medium">{program.code || "N/A"}</td>
                  <td>{program.name || "N/A"}</td>
                  <td>
                    <Link
                      to={`/program-view/${program.id}`}
                      className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                      title="View"
                    >
                      <Icon icon="iconamoon:eye-light" />
                    </Link>
                    <Link
                      to={`/program-edit/${program.id}`}
                      className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                      title="Edit"
                    >
                      <Icon icon="lucide:edit" />
                    </Link>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                      title="Delete"
                    >
                      <Icon icon="mingcute:delete-2-line" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProgramListLayer;

