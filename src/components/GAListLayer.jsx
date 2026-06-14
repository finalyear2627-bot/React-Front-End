import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { gaService } from "../api/ga.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const GAListLayer = () => {
  const [gas,           setGas]          = useState([]);
  const [programs,      setPrograms]     = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [clearingAll,   setClearingAll]  = useState(false);
  const [filterProgram, setFilterProgram] = useState("");
  const [search,        setSearch]       = useState("");
  const [page,          setPage]         = useState(1);
  const [pageSize,      setPageSize]     = useState(10);

  useEffect(() => {
    programService
      .getAllPrograms()
      .then((d) => setPrograms(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => {});
  }, []);

  const fetchGAs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterProgram) params.program = filterProgram;
      const data = await gaService.getAll(params);
      setGas(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filterProgram]);

  useEffect(() => { fetchGAs(); }, [fetchGAs]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this GA?")) return;
    try {
      const res = await gaService.delete(id);
      setGas((prev) => prev.filter((g) => g.id !== id));
      showSuccess(res?.status?.message || "GA deleted");
    } catch (err) {
      showError(getApiError(err));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(
      "DELETE ALL Graduate Attributes?\n\nThis will permanently delete every GA record. This action cannot be undone. Continue?"
    )) return;
    setClearingAll(true);
    try {
      const res = await gaService.clearAll();
      showSuccess(res?.status?.message || "All GAs deleted successfully");
      setGas([]);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setClearingAll(false);
    }
  };

  const programName = (id) => {
    const p = programs.find((x) => String(x.id) === String(id));
    return p ? `${p.code} - ${p.name}` : id;
  };

  const filtered = gas.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (g.name || "").toLowerCase().includes(q) ||
      (g.description || "").toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">Graduate Attributes (GAs)</h5>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-danger radius-8 d-inline-flex align-items-center gap-1"
            onClick={handleClearAll}
            disabled={clearingAll}
            title="Delete all Graduate Attributes"
          >
            {clearingAll
              ? <><span className="spinner-border spinner-border-sm me-4" /> Deleting…</>
              : <><Icon icon="mingcute:delete-2-line" className="text-lg" /> Delete All GAs</>}
          </button>
          <Link to="/ga-bulk-upload" className="btn btn-sm btn-outline-primary radius-8 d-inline-flex align-items-center gap-1">
            <Icon icon="vscode-icons:file-type-excel" className="text-lg" /> Bulk Upload
          </Link>
          <Link to="/ga-add" className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1">
            <Icon icon="ic:round-plus" className="text-xl" /> Add GA
          </Link>
        </div>
      </div>

      <div className="card-body pb-0">
        <div className="row g-2 align-items-end">
          <div className="col-sm-5 col-md-4">
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
          <div className="col-sm-5 col-md-4">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Search</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control radius-8 ps-36"
                placeholder="Search name or description…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light" style={{ left: 10, pointerEvents: "none" }} />
            </div>
          </div>
          <div className="col-sm-auto">
            <label className="form-label text-sm mb-4 d-block invisible">x</label>
            <button
              className="btn btn-outline-secondary radius-8"
              onClick={() => { setFilterProgram(""); setSearch(""); setPage(1); }}
              disabled={!filterProgram && !search}
            >
              <Icon icon="material-symbols:filter-alt-off-outline" />
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">
            <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
            <p className="text-secondary-light mt-12">Loading GAs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No Graduate Attributes found.</p>
            <Link to="/ga-add" className="btn btn-sm btn-primary mt-16">Add First GA</Link>
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th style={{ width: 90 }}>GA No.</th>
                    <th>Program</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th style={{ width: 120 }}>Mapped PLOs</th>
                    <th style={{ width: 100 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((ga) => (
                    <tr key={ga.id}>
                      <td>{ga.id}</td>
                      <td>
                        <span className="badge bg-info-100 text-info-600 radius-4 fw-semibold">
                          GA-{ga.ga_number}
                        </span>
                      </td>
                      <td className="text-sm">
                        {ga.program_code
                          ? `${ga.program_code}${ga.program_name ? ` - ${ga.program_name}` : ""}`
                          : programName(ga.program)}
                      </td>
                      <td className="text-sm fw-semibold">{ga.name || "—"}</td>
                      <td className="text-sm">{ga.description || "N/A"}</td>
                      <td className="text-sm">
                        {ga.mapped_plos && ga.mapped_plos.length > 0
                          ? ga.mapped_plos.map((p) => (
                              <span key={p.id ?? p} className="badge bg-primary-100 text-primary-600 radius-4 me-4 mb-4 text-xs">
                                PLO-{p.plo_number ?? p}
                              </span>
                            ))
                          : <span className="text-secondary-light">—</span>}
                      </td>
                      <td>
                        <Link
                          to={`/ga-edit/${ga.id}`}
                          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </Link>
                        <button
                          onClick={() => handleDelete(ga.id)}
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

export default GAListLayer;
