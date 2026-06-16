import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { semesterService } from "../api/semester.service";
import { courseService } from "../api/course.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const SemesterViewLayer = () => {
  const { id } = useParams();
  const userRole = localStorage.getItem("user_role");

  const [semester,    setSemester]    = useState(null);
  const [courses,     setCourses]     = useState([]);
  const [allCourses,  setAllCourses]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [togglingId,  setTogglingId]  = useState(null);
  const [courseType,  setCourseType]  = useState("");

  // Assign-courses modal state
  const [showModal,     setShowModal]     = useState(false);
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [replaceMode,   setReplaceMode]   = useState(false);
  const [assigning,     setAssigning]     = useState(false);
  const [courseSearch,  setCourseSearch]  = useState("");

  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const modalRef = useRef(null);

  const fetchSemester = async () => {
    try {
      const data = await semesterService.getById(id);
      const sem  = data?.result?.[0] ?? data?.result ?? data;
      setSemester(sem);
    } catch (err) {
      showError(getApiError(err));
    }
  };

  const fetchCourses = async (type = courseType) => {
    try {
      const params = {};
      if (type) params.course_type = type;
      const data = await semesterService.getCourses(id, params);
      setCourses(Array.isArray(data) ? data : data.result || data.results || []);
    } catch (err) {
      showError(getApiError(err));
    }
  };

  useEffect(() => {
    Promise.all([fetchSemester(), fetchCourses()])
      .finally(() => setLoading(false));

    courseService
      .getAllCourses()
      .then((d) => setAllCourses(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => {});
  }, [id]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleCourseTypeFilter = (type) => {
    setCourseType(type);
    setPage(1);
    fetchCourses(type);
  };

  const handleToggleSemester = async () => {
    if (!semester) return;
    setTogglingId("sem");
    try {
      const res = semester.is_active
        ? await semesterService.deactivate(id)
        : await semesterService.activate(id);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Action failed"); return; }
      showSuccess(res?.status?.message || `Semester ${semester.is_active ? "deactivated" : "activated"} (and all linked courses)`);
      setSemester((prev) => ({ ...prev, is_active: !prev.is_active }));
      fetchCourses(courseType);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  // Assign courses
  const openModal = () => {
    setSelectedIds([]);
    setCourseSearch("");
    setReplaceMode(false);
    setShowModal(true);
  };

  const toggleCourseSelect = (cid) => {
    setSelectedIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) { showError("Select at least one course"); return; }
    setAssigning(true);
    try {
      const res = await semesterService.assignCourses(id, selectedIds, replaceMode);
      if (res?.status?.code !== 0) { showError(res?.status?.message || "Assignment failed"); return; }
      showSuccess(res?.status?.message || "Courses assigned successfully");
      setShowModal(false);
      fetchCourses(courseType);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setAssigning(false);
    }
  };

  const filteredAllCourses = allCourses.filter((c) => {
    if (!courseSearch) return true;
    const q = courseSearch.toLowerCase();
    return (
      (c.code || "").toLowerCase().includes(q) ||
      (c.name || "").toLowerCase().includes(q)
    );
  });

  const paginated = courses.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-40">
          <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
        </div>
      </div>
    );
  }

  if (!semester) {
    return (
      <div className="card">
        <div className="card-body text-center py-40">
          <p className="text-danger-main">Semester not found.</p>
          <Link to="/semesters" className="btn btn-sm btn-outline-secondary mt-16">Back to List</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Details Card */}
      <div className="card mb-24">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0">Semester Details</h5>
          <div className="d-flex gap-2 flex-wrap">
            {userRole === "ADMIN" && (
              <Link to={`/semester-edit/${id}`} className="btn btn-sm btn-success radius-8 d-inline-flex align-items-center gap-1">
                <Icon icon="lucide:edit" /> Edit
              </Link>
            )}
            {userRole === "ADMIN" && (
            <button
              onClick={handleToggleSemester}
              disabled={togglingId === "sem"}
              className={`btn btn-sm radius-8 d-inline-flex align-items-center gap-1 ${semester.is_active ? "btn-warning" : "btn-success"}`}
            >
              {togglingId === "sem"
                ? <span className="spinner-border spinner-border-sm me-1" style={{ width: 14, height: 14 }} />
                : <Icon icon={semester.is_active ? "mingcute:pause-circle-line" : "mingcute:play-circle-line"} />
              }
              {semester.is_active ? "Deactivate" : "Activate"}
            </button>
            )}
            
            <Link to="/semesters" className="btn btn-sm btn-outline-secondary radius-8">
              Back to List
            </Link>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-sm-6 col-md-3">
              <p className="text-secondary-light text-sm mb-4">Name</p>
              <p className="fw-semibold mb-0">{semester.name || "N/A"}</p>
            </div>
            <div className="col-sm-6 col-md-3">
              <p className="text-secondary-light text-sm mb-4">Program</p>
              <p className="fw-semibold mb-0">
                {semester.program_code
                  ? `${semester.program_code} - ${semester.program_name || ""}`
                  : semester.program || "N/A"}
              </p>
            </div>
            <div className="col-sm-6 col-md-3">
              <p className="text-secondary-light text-sm mb-4">Study Year</p>
              <p className="fw-semibold mb-0">{semester.study_year ? `Year ${semester.study_year}` : "N/A"}</p>
            </div>
            <div className="col-sm-6 col-md-3">
              <p className="text-secondary-light text-sm mb-4">Status</p>
              <span className={`badge radius-4 ${semester.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                {semester.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Card */}
      {userRole === "ADMIN" && (
      <div className="card basic-data-table">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0">Courses in this Semester</h5>
          <button
            onClick={openModal}
            className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
          >
            <Icon icon="ic:round-plus" className="text-xl" /> Assign Courses
          </button>
        </div>

        {/* Course type filter */}
        <div className="card-body pb-0">
          <div className="d-flex gap-2 flex-wrap">
            {["", "THEORY", "LAB"].map((t) => (
              <button
                key={t}
                onClick={() => handleCourseTypeFilter(t)}
                className={`btn btn-sm radius-8 ${courseType === t ? "btn-primary-600" : "btn-outline-secondary"}`}
              >
                {t || "All"}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body">
          {courses.length === 0 ? (
            <div className="text-center py-40">
              <p className="text-secondary-light">No courses assigned to this semester yet.</p>
              <button onClick={openModal} className="btn btn-sm btn-primary mt-16">Assign Courses</button>
            </div>
          ) : (
            <React.Fragment>
              <div className="table-responsive" style={{ overflowX: "auto" }}>
                <table className="table bordered-table mb-0">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Class</th>
                      <th>Theory Hrs</th>
                      <th>Lab Hrs</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-medium">{c.code || "N/A"}</td>
                        <td>{c.name || "N/A"}</td>
                        <td>
                          <span className={`badge radius-4 ${c.course_type === "THEORY" ? "bg-info-focus text-info-main" : "bg-warning-focus text-warning-main"}`}>
                            {c.course_type || "N/A"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge radius-4 ${
                            c.course_class === "CORE"   ? "bg-primary-100 text-primary-600"
                            : c.course_class === "GER" ? "bg-purple-light text-purple"
                            : "bg-success-focus text-success-main"
                          }`}>
                            {c.course_class || "N/A"}
                          </span>
                        </td>
                        <td>{c.credit_hours_theory ?? "N/A"}</td>
                        <td>{c.credit_hours_lab    ?? "N/A"}</td>
                        <td>
                          <span className={`badge radius-4 ${c.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                            {c.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                total={courses.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </React.Fragment>
          )}
        </div>
      </div>
      )}
      {/* Assign Courses Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable" ref={modalRef}>
            <div className="modal-content radius-12">
              <div className="modal-header border-bottom py-16 px-24">
                <h5 className="modal-title">Assign Courses to Semester</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body p-24">
                {/* Search */}
                <div className="position-relative mb-16">
                  <input
                    type="text"
                    className="form-control radius-8 ps-36"
                    placeholder="Search by code or name…"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                  <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light" style={{ left: 10, pointerEvents: "none" }} />
                </div>

                {/* Replace toggle */}
                <div className="form-check mb-16">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="replaceMode"
                    checked={replaceMode}
                    onChange={(e) => setReplaceMode(e.target.checked)}
                  />
                  <label className="form-check-label text-sm" htmlFor="replaceMode">
                    Replace existing courses (unlink all current, then assign selected)
                  </label>
                </div>

                {/* Course list */}
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {filteredAllCourses.length === 0 ? (
                    <p className="text-secondary-light text-center py-20">No courses found.</p>
                  ) : (
                    filteredAllCourses.map((c) => (
                      <div
                        key={c.id}
                        className={`d-flex align-items-center gap-12 p-12 radius-8 mb-8 cursor-pointer border ${selectedIds.includes(c.id) ? "border-primary-600 bg-primary-50" : "border-transparent"}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleCourseSelect(c.id)}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input mt-0 flex-shrink-0"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleCourseSelect(c.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: 18, height: 18 }}
                        />
                        <div className="flex-grow-1">
                          <span className="fw-medium me-8">{c.code}</span>
                          <span className="text-secondary-light">{c.name}</span>
                        </div>
                        <div className="d-flex gap-1">
                          <span className={`badge radius-4 text-xs ${c.course_type === "THEORY" ? "bg-info-focus text-info-main" : "bg-warning-focus text-warning-main"}`}>
                            {c.course_type}
                          </span>
                          <span className={`badge radius-4 text-xs ${c.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                            {c.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedIds.length > 0 && (
                  <p className="text-primary-600 text-sm mt-12 mb-0">
                    <Icon icon="material-symbols:check-circle-outline" className="me-4" />
                    {selectedIds.length} course{selectedIds.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
              <div className="modal-footer border-top py-16 px-24 d-flex gap-2">
                <button className="btn btn-outline-secondary radius-8" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary radius-8"
                  onClick={handleAssign}
                  disabled={assigning || selectedIds.length === 0}
                >
                  {assigning ? "Assigning…" : `Assign ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterViewLayer;