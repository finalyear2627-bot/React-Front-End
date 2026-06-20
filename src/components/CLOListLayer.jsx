import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { cloService } from "../api/clo.service";
import { courseService } from "../api/course.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const CLOListLayer = () => {
  const [clos,         setClos]         = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [programs,     setPrograms]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [clearingAll,  setClearingAll]  = useState(false);

  // filters
  const [search,         setSearch]         = useState("");
  const [filterCode,     setFilterCode]     = useState("");
  const [filterProgram,  setFilterProgram]  = useState("");
  const [filterType,     setFilterType]     = useState("");
  const [filterClass,    setFilterClass]    = useState("");
  const [filterCourse,   setFilterCourse]   = useState("");

  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  useEffect(() => {
    courseService
      .getAllCourses()
      .then((d) => setCourses(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => {});
    programService
      .getAllPrograms()
      .then((d) => setPrograms(Array.isArray(d) ? d : d.result || d.results || []))
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

  const resetFilters = () => {
    setSearch(""); setFilterCode(""); setFilterProgram("");
    setFilterType(""); setFilterClass(""); setFilterCourse(""); setPage(1);
  };

  const hasFilter = search || filterCode || filterProgram || filterType || filterClass || filterCourse;

  // Build set of matching course IDs based on program/type/class/code filters
  const matchingCourseIds = (() => {
    if (!filterProgram && !filterType && !filterClass && !filterCode) return null; // no course-level filter
    return new Set(
      courses
        .filter((c) => {
          if (filterProgram) {
            const pid = c.program_id || (typeof c.program === "object" ? c.program?.id : c.program);
            if (String(pid) !== String(filterProgram)) return false;
          }
          if (filterType && c.course_type !== filterType) return false;
          if (filterClass && c.course_class !== filterClass) return false;
          if (filterCode && !c.code?.toLowerCase().includes(filterCode.toLowerCase())) return false;
          return true;
        })
        .map((c) => c.id)
    );
  })();

  const filtered = clos.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!(c.description || "").toLowerCase().includes(q)) return false;
    }
    if (filterCourse && String(c.course) !== String(filterCourse) && String(c.course_id) !== String(filterCourse)) return false;
    if (matchingCourseIds !== null) {
      const cid = c.course_id || c.course;
      if (!matchingCourseIds.has(cid) && !matchingCourseIds.has(Number(cid))) return false;
    }
    return true;
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

          {/* Search description */}
          <div className="col-sm-4 col-md-3">
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

          {/* Course Code */}
          <div className="col-sm-4 col-md-2">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Code</label>
            <input
              type="text"
              className="form-control radius-8"
              placeholder="e.g. CS101"
              value={filterCode}
              onChange={(e) => { setFilterCode(e.target.value); setPage(1); }}
            />
          </div>

          {/* Program */}
          <div className="col-sm-4 col-md-2">
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

          {/* Type */}
          <div className="col-sm-4 col-md-2">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Type</label>
            <select
              className="form-control form-select radius-8"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="THEORY">Theory</option>
              <option value="LAB">Lab</option>
            </select>
          </div>

          {/* Class */}
          <div className="col-sm-4 col-md-2">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">Class</label>
            <select
              className="form-control form-select radius-8"
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}
            >
              <option value="">All Classes</option>
              <option value="CORE">Core</option>
              <option value="GER">GER</option>
              <option value="ELECTIVE">Elective</option>
            </select>
          </div>

          {/* Clear */}
          <div className="col-sm-auto col-md-1">
            <label className="form-label text-sm mb-4 d-block invisible">x</label>
            <button
              className="btn btn-outline-secondary radius-8 w-100"
              onClick={resetFilters}
              disabled={!hasFilter}
              title="Clear filters"
            >
              <Icon icon="material-symbols:filter-alt-off-outline" />
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilter && (
          <div className="d-flex flex-wrap gap-2 mt-12 mb-0">
            {search && (
              <span className="badge bg-primary-100 text-primary-600 radius-4 d-flex align-items-center gap-1">
                "{search}"
                <Icon icon="material-symbols:close" style={{ cursor: "pointer" }} onClick={() => { setSearch(""); setPage(1); }} />
              </span>
            )}
            {filterCode && (
              <span className="badge bg-info-focus text-info-main radius-4 d-flex align-items-center gap-1">
                Code: {filterCode}
                <Icon icon="material-symbols:close" style={{ cursor: "pointer" }} onClick={() => { setFilterCode(""); setPage(1); }} />
              </span>
            )}
            {filterProgram && (
              <span className="badge bg-success-focus text-success-main radius-4 d-flex align-items-center gap-1">
                {programs.find((p) => String(p.id) === String(filterProgram))?.code || "Program"}
                <Icon icon="material-symbols:close" style={{ cursor: "pointer" }} onClick={() => { setFilterProgram(""); setPage(1); }} />
              </span>
            )}
            {filterType && (
              <span className="badge bg-warning-focus text-warning-main radius-4 d-flex align-items-center gap-1">
                {filterType}
                <Icon icon="material-symbols:close" style={{ cursor: "pointer" }} onClick={() => { setFilterType(""); setPage(1); }} />
              </span>
            )}
            {filterClass && (
              <span className="badge bg-neutral-200 text-neutral-600 radius-4 d-flex align-items-center gap-1">
                {filterClass}
                <Icon icon="material-symbols:close" style={{ cursor: "pointer" }} onClick={() => { setFilterClass(""); setPage(1); }} />
              </span>
            )}
          </div>
        )}
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
                    <th style={{ width: 90 }}>BT Level</th>
                    <th style={{ width: 80 }}>GA</th>
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
                        {clo.ga_code
                          ? <span className="badge bg-purple-focus text-purple radius-4 fw-semibold">{clo.ga_code}</span>
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