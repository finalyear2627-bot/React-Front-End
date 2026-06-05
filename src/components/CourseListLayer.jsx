import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseService } from "../api/course.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const CourseListLayer = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(Array.isArray(data) ? data : data.result || data.results || []);
      setError("");
    } catch (err) {
      showError(getApiError(err));
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const res = await courseService.deleteCourse(id);
        setCourses(courses.filter((c) => c.id !== id));
        showSuccess(res?.status?.message || "Course deleted successfully");
      } catch (err) {
        showError(getApiError(err));
      }
    }
  };

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Courses</h5>
        <div className="d-flex gap-8">
          <Link
            to="/course-bulk-upload"
            className="btn btn-sm btn-outline-primary radius-8 d-inline-flex align-items-center gap-1"
          >
            <Icon icon="vscode-icons:file-type-excel" className="text-lg" />
            Bulk Upload
          </Link>
          <Link
            to="/course-add"
            className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
          >
            <Icon icon="ic:round-plus" className="text-xl" />
            Add Course
          </Link>
        </div>
      </div>

      {error && (
        <div className="card-body pb-0">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      <div className="card-body">
        {courses.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-secondary-light">No courses found</p>
            <Link to="/course-add" className="btn btn-sm btn-primary mt-16">
              Create First Course
            </Link>
          </div>
        ) : (
          <table className="table bordered-table mb-0">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Code</th>
                <th scope="col">Name</th>
                <th scope="col">Class</th>
                <th scope="col">Theory</th>
                <th scope="col">Lab</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={course.id || index}>
                  <td>{course.id}</td>
                  <td className="fw-medium">{course.code || "N/A"}</td>
                  <td>{course.name || "N/A"}</td>
                  <td>
                    <span className={`badge radius-4 ${
                      course.course_class === "CORE"
                        ? "bg-primary-100 text-primary-600"
                        : course.course_class === "GER"
                        ? "bg-warning-focus text-warning-main"
                        : "bg-success-focus text-success-main"
                    }`}>
                      {course.course_class || "N/A"}
                    </span>
                  </td>
                  <td>{course.credit_hours_theory ?? "N/A"}</td>
                  <td>{course.credit_hours_lab ?? "N/A"}</td>
                  <td>
                    <Link
                      to={`/course-view/${course.id}`}
                      className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                      title="View"
                    >
                      <Icon icon="iconamoon:eye-light" />
                    </Link>
                    <Link
                      to={`/course-edit/${course.id}`}
                      className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                      title="Edit"
                    >
                      <Icon icon="lucide:edit" />
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id)}
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
        )}
      </div>
    </div>
  );
};

export default CourseListLayer;
