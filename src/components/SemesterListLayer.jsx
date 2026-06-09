import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { semesterService } from "../api/semester.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const SemesterListLayer = () => {
  const userRole = localStorage.getItem("user_role");
  const [semesters,  setSemesters]  = useState([]);
  const [programs,   setPrograms]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const [filterProgram,    setFilterProgram]    = useState("");
  const [filterStudyYear,  setFilterStudyYear]  = useState("");
  const [filterStatus,     setFilterStatus]     = useState("");
  const [search,           setSearch]           = useState("");

  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    programService
      .getAllPrograms()
      .then((d) => setPrograms(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => {});
  }, []);

  const fetchSemesters = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterProgram)   params.program    = filterProgram;
      if (filterStudyYear) params.study_year = filterStudyYear;
      if (filterStatus !== "") params.is_active = filterStatus;
      const data = await semesterService.getAll(params);
      setSemesters(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filterProgram, filterStudyYear, filterStatus]);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);

  const handleToggle = async (sem) => {
    setTogglingId(sem.id);
    try {
      const res = sem.is_active
        ? await semesterService.deactivate(sem.id)
        : await semesterService.activate(sem.id);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Action failed"); return; }
      showSuccess(res?.status?.message || `Semester ${sem.is_active ? "deactivated" : "activated"} successfully`);
      setSemesters((prev) =>
        prev.map((s) => s.id === sem.id ? { ...s, is_active: !sem.is_active } : s)
      );
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this semester?")) return;
    try {
      const res = await semesterService.delete(id);
      setSemesters((prev) => prev.filter((s) => s.id !== id));
      showSuccess(res?.status?.message || "Semester deleted");
    } catch (err) {
      showError(getApiError(err));
    }
  };

  const resetFilters = () => {
    setFilterProgram(""); setFilterStudyYear(""); setFilterStatus(""); setSearch(""); setPage(1);
  };
  const hasFilter = filterProgram || filterStudyYear || filterStatus !== "" || search;

  const filtered = semesters.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.name || "").toLowerCase().includes(q);
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card basic-data-table">
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">Semesters</h5>
        {userRole === "ADMIN" && (
          <Link
            to="/semester-add"
            className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
          >
            <Icon icon="ic:round-plus" className="text-xl" /> Add Semester
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card-body pb-0">
        <div className="row g-2 align-items-end">
          <div className="col-sm-4 col-md-3">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Search Name</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control radius-8 ps-36"
                placeholder="Semester name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light" style={{ left: 10, pointerEvents: "none" }} />
            </div>
          </div>

          <div className="col-sm-4 col-md-3">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Program</label>
            <select
              className="form-control form-select radius-8"
              value={filterProgram}
              onChange={(e) => { setFilterProgram(e.target.value); setPage(1); }}
            >
              <option value="">All Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="col-sm-4 col-md-2">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Study Year</label>
            <select
              className="form-control form-select radius-8"
              value={filterStudyYear}
              onChange={(e) => { setFilterStudyYear(e.target.value); setPage(1); }}
            >
              <option value="">All Years</option>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>

          <div className="col-sm-4 col-md-2">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Status</label>
            <select
              className="form-control form-select radius-8"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="col-sm-auto">
            <label className="form-label text-sm mb-4 d-block invisible">x</label>
            <button
              className="btn btn-outline-secondary radius-8"
              onClick={resetFilters}
              disabled={!hasFilter}
              title="Clear filters"
            >
              <Icon icon="material-symbols:filter-alt-off-outline" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">
            <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
            <p className="text-secondary-light mt-12">Loading semesters…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">
              {hasFilter ? "No semesters match the current filters." : "No semesters found."}
            </p>
            {hasFilter
              ? <button className="btn btn-sm btn-outline-secondary mt-16" onClick={resetFilters}>Clear Filters</button>
              : userRole === "ADMIN" && <Link to="/semester-add" className="btn btn-sm btn-primary mt-16">Create First Semester</Link>
            }
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Study Year</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((sem) => (
                    <tr key={sem.id}>
                      <td>{sem.id}</td>
                      <td className="fw-medium">{sem.name || "N/A"}</td>
                      <td>
                        {sem.program_name || sem.program_code
                          ? `${sem.program_code || ""} ${sem.program_name || ""}`.trim()
                          : sem.program || "N/A"}
                      </td>
                      <td>{sem.study_year ? `Year ${sem.study_year}` : "N/A"}</td>
                      <td>
                        <span className={`badge radius-4 ${sem.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                          {sem.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/semester-view/${sem.id}`}
                          className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="View"
                        >
                          <Icon icon="iconamoon:eye-light" />
                        </Link>
                        <Link
                          to={`/semester-edit/${sem.id}`}
                          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </Link>
                        <button
                          onClick={() => handleToggle(sem)}
                          disabled={togglingId === sem.id}
                          className={`w-32-px h-32-px me-8 rounded-circle d-inline-flex align-items-center justify-content-center border-0 ${sem.is_active ? "bg-warning-focus text-warning-main" : "bg-success-focus text-success-main"}`}
                          title={sem.is_active ? "Deactivate" : "Activate"}
                        >
                          {togglingId === sem.id
                            ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                            : <Icon icon={sem.is_active ? "mingcute:pause-circle-line" : "mingcute:play-circle-line"} />
                          }
                        </button>
                        <button
                          onClick={() => handleDelete(sem.id)}
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
            </div>
            <TablePagination
              total={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default SemesterListLayer;