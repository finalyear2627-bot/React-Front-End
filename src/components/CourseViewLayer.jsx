import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { courseService } from "../api/course.service";
import { showError, getApiError } from "../utils/toast";

const CourseViewLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseById(id);
      const course = data?.result?.[0] ?? data?.result ?? data;
      setCourse(course);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load course");
    } finally {
      setLoading(false);
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
                <h5 className="mb-0">Course Details</h5>
                <div>
                  <Link
                    to={`/course-edit/${course.id}`}
                    className="btn btn-sm btn-success me-8"
                  >
                    <Icon icon="lucide:edit" className="me-2" />
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
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">Course Code</label>
                  <p className="text-md mb-0 fw-medium">{course.code || "N/A"}</p>
                </div>

                <div className="mb-24 pb-24 border-bottom">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">Course Name</label>
                  <p className="text-md mb-0">{course.name || "N/A"}</p>
                </div>

                <div className="mb-24 pb-24 border-bottom">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">Course Class</label>
                  <p className="text-md mb-0">{course.course_class || "N/A"}</p>
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
