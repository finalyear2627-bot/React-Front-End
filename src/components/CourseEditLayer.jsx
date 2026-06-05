import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courseService } from "../api/course.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const COURSE_CLASSES = ["CORE", "GER", "ELECTIVE"];

const CourseEditLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    program: "",
    code: "",
    name: "",
    course_class: "CORE",
    credit_hours_theory: "",
    credit_hours_lab: "",
  });
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      courseService.getCourseById(id),
      programService.getAllPrograms(),
    ])
      .then(([courseData, programData]) => {
        const course = courseData?.result?.[0] ?? courseData?.result ?? courseData;
        setFormData({
          program: course.program ?? "",
          code: course.code || "",
          name: course.name || "",
          course_class: course.course_class || "CORE",
          credit_hours_theory: course.credit_hours_theory ?? "",
          credit_hours_lab: course.credit_hours_lab ?? "",
        });
        setPrograms(Array.isArray(programData) ? programData : programData.result || programData.results || []);
      })
      .catch((err) => {
        showError(getApiError(err));
        navigate("/courses");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        program: parseInt(formData.program, 10),
        credit_hours_theory: parseInt(formData.credit_hours_theory, 10) || 0,
        credit_hours_lab: parseInt(formData.credit_hours_lab, 10) || 0,
      };
      const res = await courseService.updateCourse(id, payload);
      showSuccess(res?.status?.message || "Course updated successfully");
      navigate("/courses");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card h-100 p-0 radius-12">
        <div className="card-body p-24 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Edit Course</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-20">
                    <label htmlFor="program" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Program <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-20">
                    <label htmlFor="code" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Course Code <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="code"
                      name="code"
                      placeholder="e.g., CMC111"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-20">
                    <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Course Name <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control radius-8"
                      id="name"
                      name="name"
                      placeholder="e.g., Programming Fundamentals"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-20">
                    <label htmlFor="course_class" className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Course Class <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8"
                      id="course_class"
                      name="course_class"
                      value={formData.course_class}
                      onChange={handleInputChange}
                      required
                    >
                      {COURSE_CLASSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-6 mb-20">
                      <label htmlFor="credit_hours_theory" className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Credit Hours (Theory) <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control radius-8"
                        id="credit_hours_theory"
                        name="credit_hours_theory"
                        placeholder="e.g., 3"
                        min="0"
                        max="6"
                        value={formData.credit_hours_theory}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-6 mb-20">
                      <label htmlFor="credit_hours_lab" className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Credit Hours (Lab) <span className="text-danger-600">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control radius-8"
                        id="credit_hours_lab"
                        name="credit_hours_lab"
                        placeholder="e.g., 1"
                        min="0"
                        max="6"
                        value={formData.credit_hours_lab}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button
                      type="submit"
                      className="btn btn-primary radius-8 py-10 flex-grow-1"
                      disabled={submitting}
                    >
                      {submitting ? "Updating..." : "Update Course"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/courses")}
                      className="btn btn-outline-secondary radius-8 py-10 flex-grow-1"
                    >
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

export default CourseEditLayer;
