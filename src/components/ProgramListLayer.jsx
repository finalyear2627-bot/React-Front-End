import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const ProgramListLayer = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_role");
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await programService.getAllPrograms();
      setPrograms(Array.isArray(data) ? data : data.result || data.results || []);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        const res = await programService.deleteProgram(id);
        setPrograms(programs.filter((p) => p.id !== id));
        showSuccess(res?.status?.message || "Program deleted successfully");
      } catch (err) {
        showError(getApiError(err));
      }
    }
  };

  const paginated = programs.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Programs</h5>
        <div className="d-flex gap-8">
          {userRole === "ADMIN" && (
            <Link
              to="/program-bulk-upload"
              className="btn btn-sm btn-outline-primary radius-8 d-inline-flex align-items-center gap-1"
            >
              <Icon icon="vscode-icons:file-type-excel" className="text-lg" />
              Bulk Upload
            </Link>
          )}
          {userRole === "ADMIN" && (
            <Link
              to="/program-add"
              className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
            >
              <Icon icon="ic:round-plus" className="text-xl" />
              Add Program
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="card-body pb-0">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      <div className="card-body">
        {programs.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No programs found</p>
            {userRole === "ADMIN" && (
              <Link to="/program-add" className="btn btn-sm btn-primary mt-16">
                Create First Program
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive">
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
                  {paginated.map((program, index) => (
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              total={programs.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProgramListLayer;