import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { obePlanService } from "../api/obe.service";
import { courseService } from "../api/course.service";
import { courseAssignmentService } from "../api/courseAssignment.service";
import { showSuccess, showError, getApiError } from "../utils/toast";
import TablePagination from "./TablePagination";

const OBEPlanListLayer = () => {
  const [plans,          setPlans]          = useState([]);
  const [courses,        setCourses]        = useState([]);
  const [loadingPlans,   setLoadingPlans]   = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [creating,       setCreating]       = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [page,           setPage]           = useState(1);
  const [pageSize,       setPageSize]       = useState(10);

  /* ── Load plans independently ── */
  useEffect(() => {
    obePlanService.getAll()
      .then((d) => setPlans(Array.isArray(d) ? d : d.result || d.results || []))
      .catch(() => showError("Failed to load OBE plans"))
      .finally(() => setLoadingPlans(false));
  }, []);

  /* ── Load courses independently ── */
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const norm = (a) => ({
      id:   a.course_id ?? (typeof a.course === "object" ? a.course?.id : a.course) ?? a.id,
      code: a.course_code || a.course?.code || a.code || "",
      name: a.course_name || a.course?.name || a.name || "",
    });

    const promise = role === "TEACHER"
      ? courseAssignmentService.getMyCourses()
          .then((d) => {
            const raw  = Array.isArray(d) ? d : d.result || d.results || [];
            const list = Array.isArray(raw) ? raw : [raw];
            return list
              .filter((a) => a.is_active !== false)
              .map(norm)
              .filter((c) => c.id != null && c.id !== "");
          })
      : courseService.getAllCourses()
          .then((d) => {
            const raw  = Array.isArray(d) ? d : d.result || d.results || [];
            const list = Array.isArray(raw) ? raw : [raw];
            return list.filter((c) => c.is_active !== false).map(norm);
          });

    promise
      .then((list) => {
        console.log("[OBE] courses loaded:", list);
        setCourses(list);
      })
      .catch((err) => {
        console.error("[OBE] course load error:", err);
        showError("Failed to load courses");
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  const handleCreate = async () => {
    if (!selectedCourse) { showError("Please select a course"); return; }
    setCreating(true);
    try {
      const res  = await obePlanService.create({ course: parseInt(selectedCourse, 10) });
      const plan = res?.result?.[0] || res?.result || res;
      showSuccess(res?.status?.message || "OBE Plan created");
      if (plan?.id) {
        setPlans((prev) => prev.find((p) => p.id === plan.id) ? prev : [plan, ...prev]);
      }
      setSelectedCourse("");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this OBE Plan?")) return;
    try {
      await obePlanService.delete(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      showSuccess("OBE Plan deleted");
    } catch (err) {
      showError(getApiError(err));
    }
  };

  const loading    = loadingPlans || loadingCourses;
  const paginated  = plans.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="card-title mb-0">OBE Assessment Plans</h5>
      </div>

      {/* Create new plan */}
      <div className="card-body pb-0">
        <div className="d-flex gap-12 align-items-end flex-wrap">
          <div className="flex-grow-1">
            <label className="form-label text-sm fw-semibold text-primary-light mb-4">
              Select Course to Create Plan
            </label>
            {loadingCourses ? (
              <div className="placeholder-glow"><span className="placeholder col-12 radius-8" style={{ height: 38 }} /></div>
            ) : (
              <select
                className="form-control radius-8"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            )}
          </div>
          <button
            className="btn btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
            onClick={handleCreate}
            disabled={creating || !selectedCourse || loadingCourses}
          >
            {creating
              ? <><span className="spinner-border spinner-border-sm me-4" /> Creating…</>
              : <><Icon icon="ic:round-plus" className="text-xl" /> Create Plan</>}
          </button>
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-40">
            <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
            <p className="text-secondary-light mt-12">Loading…</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-40">
            <Icon icon="solar:document-add-outline" className="text-secondary-light" style={{ fontSize: 48 }} />
            <p className="text-secondary-light mt-12">No OBE plans yet. Select a course above to create one.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Type</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((plan) => (
                    <tr key={plan.id}>
                      <td className="text-secondary-light">{plan.id}</td>
                      <td className="fw-semibold">{plan.course_code || plan.course?.code || "—"}</td>
                      <td>{plan.course_name || plan.course?.name || "—"}</td>
                      <td>
                        <span className={`badge radius-4 ${(plan.course_type || plan.course?.course_type) === "LAB"
                          ? "bg-warning-focus text-warning-main"
                          : "bg-primary-100 text-primary-600"}`}>
                          {plan.course_type || plan.course?.course_type || "THEORY"}
                        </span>
                      </td>
                      <td className="text-secondary-light text-sm">
                        {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <Link
                          to={`/obe-plan/${plan.id}`}
                          className="w-32-px h-32-px me-8 bg-info-focus text-info-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          title="View / Edit Plan"
                        >
                          <Icon icon="lucide:eye" />
                        </Link>
                        <button
                          onClick={() => handleDelete(plan.id)}
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
              total={plans.length}
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

export default OBEPlanListLayer;
