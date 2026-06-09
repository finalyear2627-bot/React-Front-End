import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ploService } from "../api/plo.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const PLOListLayer = () => {
  const [plos,          setPlos]         = useState([]);
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

  const fetchPLOs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterProgram) params.program = filterProgram;
      const data = await ploService.getAll(params);
      setPlos(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filterProgram]);

  useEffect(() => { fetchPLOs(); }, [fetchPLOs]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this PLO?")) return;
    try {
      const res = await ploService.delete(id);
      setPlos((prev) => prev.filter((p) => p.id !== id));
      showSuccess(res?.status?.message || "PLO deleted");
    } catch (err) {
      showError(getApiError(err));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(
      "DELETE ALL PLOs?\n\nThis will permanently delete every PLO record and clear all CLO-PLO mappings from the junction table.\n\nThis action cannot be undone. Continue?"
    )) return;
    setClearingAll(true);
    try {
      const res = await ploService.clearAll();
      showSuccess(res?.status?.message || "All PLOs deleted successfully");
      setPlos([]);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setClearingAll(false);
    }
  };

  const filtered = plos.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.description || "").toLowerCase().includes(q);
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const programName = (id) => {
    const p = programs.find((x) => String(x.id) === String(id));
    return p ? `${p.code} - ${p.name}` : id;
  };

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">Program Learning Outcomes (PLOs)</h5>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-danger radius-8 d-inline-flex align-items-center gap-1"
            onClick={handleClearAll}
            disabled={clearingAll}
            title="Delete all PLOs and clear all CLO-PLO mappings"
          >
            {clearingAll
              ? <><span className="spinner-border spinner-border-sm me-4" /> Deleting…</>
              : <><Icon icon="mingcute:delete-2-line" className="text-lg" /> Delete All PLOs</>}
          </button>
          <Link to="/plo-bulk-upload" className="btn btn-sm btn-outline-primary radius-8 d-inline-flex align-items-center gap-1">
            <Icon icon="vscode-icons:file-type-excel" className="text-lg" /> Bulk Upload
          </Link>
          <Link to="/plo-add" className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1">
            <Icon icon="ic:round-plus" className="text-xl" /> Add PLO
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
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Search Description</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control radius-8 ps-36"
                placeholder="Search description…"
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
            <p className="text-secondary-light mt-12">Loading PLOs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No PLOs found.</p>
            <Link to="/plo-add" className="btn btn-sm btn-primary mt-16">Add First PLO</Link>
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th style={{ width: 90 }}>PLO No.</th>
                    <th>Program</th>
                    <th>Description</th>
                    <th style={{ width: 100 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((plo) => (
                    <tr key={plo.id}>
                      <td>{plo.id}</td>
                      <td>
                        <span className="badge bg-primary-100 text-primary-600 radius-4 fw-semibold">
                          PLO-{plo.plo_number}
                        </span>
                      </td>
                      <td className="text-sm">
                        {plo.program_code
                          ? `${plo.program_code}${plo.program_name ? ` - ${plo.program_name}` : ""}`
                          : programName(plo.program)}
                      </td>
                      <td className="text-sm">{plo.description || "N/A"}</td>
                      <td>
                        <Link
                          to={`/plo-edit/${plo.id}`}
                          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </Link>
                        <button
                          onClick={() => handleDelete(plo.id)}
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

export default PLOListLayer;