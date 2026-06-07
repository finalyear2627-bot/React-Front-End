import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { courseService } from "../api/course.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const CourseViewLayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseById(id);
      const c = data?.result?.[0] ?? data?.result ?? data;
      setCourse(c);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      const isActive = course.is_active;
      const res = isActive
        ? await courseService.deactivateCourse(id)
        : await courseService.activateCourse(id);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Action failed");
        return;
      }
      showSuccess(res?.status?.message || `Course ${isActive ? "deactivated" : "activated"} successfully`);
      setCourse((prev) => ({ ...prev, is_active: !isActive }));
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <div className="card"><div className="card-body">Loading...</div></div>;
  }

  if (error || !course) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger">{error || "Course not found"}</div>
          <Link to="/courses" className="btn btn-primary mt-16">Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-12">
                  <h5 className="mb-0">Course Details</h5>
                  <span className={`badge radius-4 ${course.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
                    {course.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="d-flex gap-8">
                  <button
                    onClick={handleToggleStatus}
                    disabled={toggling}
                    className={`btn btn-sm ${course.is_active ? "btn-warning" : "btn-success"}`}
                  >
                    {toggling ? (
                      <span className="spinner-border spinner-border-sm me-4" />
                    ) : (
                      <Icon icon={course.is_active ? "mingcute:pause-circle-line" : "mingcute:play-circle-line"} className="me-4" />
                    )}
                    {course.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <Link to={`/course-edit/${course.id}`} className="btn btn-sm btn-success">
                    <Icon icon="lucide:edit" className="me-4" />
                    Edit
                  </Link>
                  <Link to="/courses" className="btn btn-sm btn-secondary">
                    Back
                  </Link>
                </div>
              </div>

              <div className="card-body">
                <div className="mb-24 pb-24 border-bottom">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">Program</label>
                  <p className="text-md mb-0 fw-medium">
                    {course.program_detail
                      ? `${course.program_detail.code} - ${course.program_detail.name}`
                      : course.program || "N/A"}
                  </p>
                </div>

                <div className="mb-24 pb-24 border-bottom">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">Semester</label>
                  <p className="text-md mb-0 fw-medium">{course.semester ?? "N/A"}</p>
                </div>

                <div className="mb-24 pb-24 border-bottom">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">Course Code</label>
                  <p className="text-md mb-0 fw-medium">{course.code || "N/A"}</p>
                </div>

                <div className="mb-24 pb-24 border-bottom">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">Course Name</label>
                  <p className="text-md mb-0">{course.name || "N/A"}</p>
                </div>

                <div className="row mb-24 pb-24 border-bottom">
                  <div className="col-6">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Course Type</label>
                    <p className="text-md mb-0">{course.course_type || "N/A"}</p>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Course Class</label>
                    <p className="text-md mb-0">{course.course_class || "N/A"}</p>
                  </div>
                </div>

                <div className="row mb-24">
                  <div className="col-6">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Credit Hours (Theory)</label>
                    <p className="text-md mb-0">{course.credit_hours_theory ?? "N/A"}</p>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Credit Hours (Lab)</label>
                    <p className="text-md mb-0">{course.credit_hours_lab ?? "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewLayer;