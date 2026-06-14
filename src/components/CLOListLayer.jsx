import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { cloService } from "../api/clo.service";
import { courseService } from "../api/course.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const CLOListLayer = () => {
  const [clos,         setClos]         = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [clearingAll,  setClearingAll]  = useState(false);
  const [filterCourse, setFilterCourse] = useState("");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  useEffect(() => {
    courseService
      .getAllCourses()
      .then((d) => setCourses(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => {});
  }, []);

  const fetchCLOs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCourse) params.course = filterCourse;
      const data = await cloService.getAll(params);
      setClos(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filterCourse]);

  useEffect(() => { fetchCLOs(); }, [fetchCLOs]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this CLO?")) return;
    try {
      const res = await cloService.delete(id);
      setClos((prev) => prev.filter((c) => c.id !== id));
      showSuccess(res?.status?.message || "CLO deleted");
    } catch (err) {
      showError(getApiError(err));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(
      "DELETE ALL CLOs?\n\nThis will permanently delete every CLO record including all their PLO mapping entries from the junction table.\n\nThis action cannot be undone. Continue?"
    )) return;
    setClearingAll(true);
    try {
      const res = await cloService.clearAll();
      showSuccess(res?.status?.message || "All CLOs deleted successfully");
      setClos([]);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setClearingAll(false);
    }
  };

  const filtered = clos.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.description || "").toLowerCase().includes(q);
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">Course Learning Outcomes (CLOs)</h5>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-danger radius-8 d-inline-flex align-items-center gap-1"
            onClick={handleClearAll}
            disabled={clearingAll}
            title="Delete all CLOs and their PLO mappings"
          >
            {clearingAll
              ? <><span className="spinner-border spinner-border-sm me-4" /> Deleting…</>
              : <><Icon icon="mingcute:delete-2-line" className="text-lg" /> Delete All CLOs</>}
          </button>
          <Link to="/clo-bulk-upload" className="btn btn-sm btn-outline-primary radius-8 d-inline-flex align-items-center gap-1">
            <Icon icon="vscode-icons:file-type-excel" className="text-lg" /> Bulk Upload
          </Link>
          <Link to="/clo-add" className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1">
            <Icon icon="ic:round-plus" className="text-xl" /> Add CLO
          </Link>
        </div>
      </div>

      <div className="card-body pb-0">
        <div className="row g-2 align-items-end">
          <div className="col-sm-5 col-md-4">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Course</label>
            <select
              className="form-control form-select radius-8"
              value={filterCourse}
              onChange={(e) => { setFilterCourse(e.target.value); setPage(1); }}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
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
              onClick={() => { setFilterCourse(""); setSearch(""); setPage(1); }}
              disabled={!filterCourse && !search}
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
            <p className="text-secondary-light mt-12">Loading CLOs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No CLOs found.</p>
            <Link to="/clo-add" className="btn btn-sm btn-primary mt-16">Add First CLO</Link>
          </div>
        ) : (
          <React.Fragment>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th style={{ width: 90 }}>CLO No.</th>
                    <th>Course</th>
                    <th>Description</th>
                    <th style={{ width: 100 }}>BT Level</th>
                    <th style={{ width: 120 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((clo) => (
                    <tr key={clo.id}>
                      <td>{clo.id}</td>
                      <td>
                        <span className="badge bg-info-focus text-info-main radius-4 fw-semibold">
                          CLO-{clo.clo_number}
                        </span>
                      </td>
                      <td className="text-sm fw-medium">
                        {clo.course_code || clo.course || "N/A"}
                      </td>
                      <td className="text-sm">{clo.description || "N/A"}</td>
                      <td>
                        {clo.bt_level
                          ? <span className="badge bg-warning-focus text-warning-main radius-4 fw-semibold">{clo.bt_level}</span>
                          : <span className="text-secondary-light">—</span>}
                      </td>
                      <td>
                        <Link
                          to={`/clo-edit/${clo.id}`}
                          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </Link>
                        <button
                          onClick={() => handleDelete(clo.id)}
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

export default CLOListLayer;