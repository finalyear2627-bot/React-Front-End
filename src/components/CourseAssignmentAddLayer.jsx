import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { userService } from "../api/user.service";
import { courseService } from "../api/course.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const TYPE_BADGE = {
  THEORY: "bg-primary-100 text-primary-600",
  LAB:    "bg-warning-focus text-warning-main",
};

/* ─── reusable searchable single-select ─── */
const SearchableSelect = ({ options, value, onChange, placeholder, renderOption, renderSelected, searchKeys }) => {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const ref                 = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const visible = options.filter((o) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return searchKeys.some((k) => String(o[k] || "").toLowerCase().includes(q));
  });

  const selected = options.find((o) => String(o.id) === String(value));

  return (
    <div className="position-relative" ref={ref}>
      <div
        className={`form-control radius-8 d-flex align-items-center justify-content-between gap-2 cursor-pointer ${open ? "border-primary" : ""}`}
        style={{ minHeight: 42 }}
        onClick={() => setOpen((o) => !o)}
      >
        {selected
          ? <span className="text-sm flex-grow-1">{renderSelected(selected)}</span>
          : <span className="text-secondary-light text-sm">{placeholder}</span>
        }
        <div className="d-flex align-items-center gap-1 flex-shrink-0">
          {selected && (
            <span onClick={(e) => { e.stopPropagation(); onChange(""); }} className="text-secondary-light" style={{ cursor: "pointer" }}>
              <Icon icon="material-symbols:close" />
            </span>
          )}
          <Icon icon={open ? "mingcute:up-line" : "mingcute:down-line"} className="text-secondary-light" />
        </div>
      </div>

      {open && (
        <div className="position-absolute w-100 bg-base border radius-8 shadow-sm" style={{ top: "calc(100% + 4px)", zIndex: 9999, maxHeight: 280, display: "flex", flexDirection: "column" }}>
          <div className="p-8 border-bottom">
            <div className="position-relative">
              <input
                type="text"
                className="form-control radius-8 ps-36 py-6"
                placeholder="Search…"
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light" style={{ left: 10, pointerEvents: "none" }} />
              {query && (
                <span className="position-absolute top-50 translate-middle-y cursor-pointer text-secondary-light" style={{ right: 10 }}
                  onClick={(e) => { e.stopPropagation(); setQuery(""); }}>
                  <Icon icon="material-symbols:close" />
                </span>
              )}
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {visible.length === 0
              ? <div className="text-center text-secondary-light py-16 text-sm">No results</div>
              : visible.map((o) => (
                <div key={o.id}
                  className={`px-16 py-10 cursor-pointer hover-bg-primary-50 text-sm ${String(value) === String(o.id) ? "bg-primary-50 fw-semibold" : ""}`}
                  style={{ borderBottom: "1px solid var(--bs-border-color,#dee2e6)" }}
                  onClick={() => { onChange(o.id); setOpen(false); setQuery(""); }}
                >
                  {renderOption(o)}
                </div>
              ))
            }
          </div>
          <div className="px-12 py-6 border-top text-secondary-light" style={{ fontSize: 11 }}>
            {visible.length} result{visible.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── main component ─── */
const CourseAssignmentAddLayer = () => {
  const navigate    = useNavigate();
  const dropdownRef = useRef(null);

  const [teachers,    setTeachers]    = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [teacherId,   setTeacherId]   = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // multi-select course ids
  const [loading,     setLoading]     = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // course dropdown state
  const [courseOpen,   setCourseOpen]   = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");

  useEffect(() => {
    Promise.all([userService.getAllUsers(), courseService.getAllCourses()])
      .then(([uData, cData]) => {
        const allUsers   = Array.isArray(uData) ? uData : uData.result || uData.results || [];
        const allCourses = Array.isArray(cData) ? cData : cData.result || cData.results || [];
        setTeachers(allUsers.filter((u) => u.role === "TEACHER"));
        setCourses(allCourses);
      })
      .catch((err) => showError(getApiError(err)))
      .finally(() => setDataLoading(false));
  }, []);

  // close course dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setCourseOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const visibleCourses = courses
    .filter((c) => !typeFilter || c.course_type === typeFilter)
    .filter((c) => {
      const q = courseSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        (c.code || "").toLowerCase().includes(q) ||
        (c.name || "").toLowerCase().includes(q) ||
        String(c.semester || "").includes(q)
      );
    });

  const toggleCourse = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeCourse = (id) => setSelectedIds((prev) => prev.filter((x) => x !== id));

  const selectedCourses = courses.filter((c) => selectedIds.includes(c.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) { showError("Please select a teacher"); return; }
    if (selectedIds.length === 0) { showError("Please select at least one course"); return; }

    setLoading(true);
    let successCount = 0;
    let failCount    = 0;

    for (const courseId of selectedIds) {
      try {
        const res = await courseAssignmentService.create({
          teacher: parseInt(teacherId),
          course:  courseId,
        });
        if (res?.status?.code !== 0) { failCount++; }
        else { successCount++; }
      } catch (_) {
        failCount++;
      }
    }

    setLoading(false);

    if (successCount > 0) showSuccess(`${successCount} course${successCount > 1 ? "s" : ""} assigned successfully`);
    if (failCount   > 0) showError(`${failCount} assignment${failCount > 1 ? "s" : ""} failed (may already be assigned)`);
    if (successCount > 0) navigate("/course-assignments");
  };

  if (dataLoading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-7 col-xl-9 col-lg-11">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Assign Course to Teacher</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  {/* ── Teacher (searchable) ── */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Teacher <span className="text-danger-600">*</span>
                    </label>
                    <SearchableSelect
                      options={teachers}
                      value={teacherId}
                      onChange={setTeacherId}
                      placeholder="— Search & select teacher —"
                      searchKeys={["first_name", "last_name", "username", "email"]}
                      renderOption={(t) => (
                        <div>
                          <span className="fw-medium">{`${t.first_name} ${t.last_name}`.trim() || t.username}</span>
                          <span className="text-secondary-light ms-8 text-sm">({t.username})</span>
                        </div>
                      )}
                      renderSelected={(t) => `${`${t.first_name} ${t.last_name}`.trim() || t.username} (${t.username})`}
                    />
                    {teachers.length === 0 && (
                      <small className="text-danger-600">No teachers found. Add users with Teacher role first.</small>
                    )}
                  </div>

                  {/* ── Course type quick-filter ── */}
                  <div className="mb-12">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Filter by Type
                    </label>
                    <div className="d-flex gap-2">
                      {["", "THEORY", "LAB"].map((t) => (
                        <button key={t} type="button"
                          className={`btn btn-sm radius-8 ${typeFilter === t ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => { setTypeFilter(t); setCourseSearch(""); }}
                        >
                          {t || "All"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Courses multi-select dropdown ── */}
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Courses <span className="text-danger-600">*</span>
                      {selectedIds.length > 0 && (
                        <span className="badge bg-primary-600 text-white ms-8 radius-4">{selectedIds.length} selected</span>
                      )}
                    </label>

                    {/* Selected chips */}
                    {selectedCourses.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mb-8">
                        {selectedCourses.map((c) => (
                          <span key={c.id} className={`badge radius-4 d-inline-flex align-items-center gap-1 py-6 px-10 ${TYPE_BADGE[c.course_type] || "bg-neutral-200 text-neutral-600"}`}>
                            <span>{c.code}: {c.name}</span>
                            <Icon icon="material-symbols:close" className="cursor-pointer" style={{ fontSize: 13 }}
                              onClick={() => removeCourse(c.id)} />
                          </span>
                        ))}
                        <button type="button" className="btn btn-sm btn-outline-danger radius-4 py-2 px-8"
                          onClick={() => setSelectedIds([])}>
                          Clear all
                        </button>
                      </div>
                    )}

                    {/* Dropdown trigger */}
                    <div className="position-relative" ref={dropdownRef}>
                      <div
                        className={`form-control radius-8 d-flex align-items-center justify-content-between gap-2 cursor-pointer ${courseOpen ? "border-primary" : ""}`}
                        style={{ minHeight: 42 }}
                        onClick={() => setCourseOpen((o) => !o)}
                      >
                        <span className="text-secondary-light text-sm">
                          {selectedIds.length === 0
                            ? "— Click to select courses —"
                            : `${selectedIds.length} course${selectedIds.length > 1 ? "s" : ""} selected — click to add more`
                          }
                        </span>
                        <Icon icon={courseOpen ? "mingcute:up-line" : "mingcute:down-line"} className="text-secondary-light flex-shrink-0" />
                      </div>

                      {/* Dropdown panel */}
                      {courseOpen && (
                        <div className="position-absolute w-100 bg-base border radius-8 shadow-sm"
                          style={{ top: "calc(100% + 4px)", zIndex: 9999, maxHeight: 320, display: "flex", flexDirection: "column" }}>

                          {/* Search inside dropdown */}
                          <div className="p-8 border-bottom">
                            <div className="position-relative">
                              <input
                                type="text"
                                className="form-control radius-8 ps-36 py-6"
                                placeholder="Search by code, name or semester…"
                                value={courseSearch}
                                autoFocus
                                onChange={(e) => setCourseSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Icon icon="ion:search-outline" className="position-absolute top-50 translate-middle-y text-secondary-light"
                                style={{ left: 10, pointerEvents: "none" }} />
                              {courseSearch && (
                                <span className="position-absolute top-50 translate-middle-y cursor-pointer text-secondary-light" style={{ right: 10 }}
                                  onClick={(e) => { e.stopPropagation(); setCourseSearch(""); }}>
                                  <Icon icon="material-symbols:close" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* List with checkboxes */}
                          <div style={{ overflowY: "auto", flex: 1 }}>
                            {visibleCourses.length === 0
                              ? <div className="text-center text-secondary-light py-16 text-sm">No courses found</div>
                              : visibleCourses.map((c) => {
                                const checked = selectedIds.includes(c.id);
                                return (
                                  <div key={c.id}
                                    className={`px-16 py-10 d-flex align-items-center gap-12 cursor-pointer hover-bg-primary-50 ${checked ? "bg-primary-50" : ""}`}
                                    style={{ borderBottom: "1px solid var(--bs-border-color,#dee2e6)" }}
                                    onClick={() => toggleCourse(c.id)}
                                  >
                                    <input type="checkbox" className="form-check-input flex-shrink-0 mt-0"
                                      checked={checked} onChange={() => toggleCourse(c.id)}
                                      onClick={(e) => e.stopPropagation()} />
                                    <span className={`badge radius-4 flex-shrink-0 ${TYPE_BADGE[c.course_type] || ""}`}>
                                      {c.course_type}
                                    </span>
                                    <div className="overflow-hidden">
                                      <div className="fw-medium text-sm text-truncate">{c.code}: {c.name}</div>
                                      <div className="text-secondary-light" style={{ fontSize: 11 }}>
                                        Semester {c.semester} &nbsp;·&nbsp; {c.course_class}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            }
                          </div>

                          {/* Footer */}
                          <div className="px-12 py-8 border-top d-flex justify-content-between align-items-center">
                            <span className="text-secondary-light" style={{ fontSize: 11 }}>
                              {visibleCourses.length} shown · {selectedIds.length} selected
                            </span>
                            <button type="button" className="btn btn-xs btn-primary radius-4 py-4 px-12 text-sm"
                              onClick={() => setCourseOpen(false)}>
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button type="submit" className="btn btn-primary radius-8 py-10 flex-grow-1" disabled={loading}>
                      {loading
                        ? `Assigning ${selectedIds.length} course${selectedIds.length > 1 ? "s" : ""}…`
                        : `Assign ${selectedIds.length > 0 ? selectedIds.length : ""} Course${selectedIds.length > 1 ? "s" : ""}`
                      }
                    </button>
                    <button type="button" onClick={() => navigate("/course-assignments")}
                      className="btn btn-outline-secondary radius-8 py-10 flex-grow-1">
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

export default CourseAssignmentAddLayer;
