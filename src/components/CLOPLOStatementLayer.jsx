import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { cloService } from "../api/clo.service";
import { courseService } from "../api/course.service";
import { showError, getApiError } from "../utils/toast";
import { exportCLOPLOStatementWord } from "../utils/excelHelper";

const CLOPLOStatementLayer = () => {
  const { courseId } = useParams();
  const [rows,      setRows]      = useState([]);
  const [course,    setCourse]    = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      cloService.getCLOPLOStatement(courseId),
      courseService.getCourseById(courseId),
    ])
      .then(([stmtData, courseData]) => {
        const stmts  = Array.isArray(stmtData) ? stmtData : stmtData?.result || stmtData?.results || [];
        const c      = courseData?.result?.[0] ?? courseData?.result ?? courseData;
        setRows(stmts);
        setCourse(c);
      })
      .catch((err) => showError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleWordExport = () => {
    const name = course ? `${course.code} - ${course.name}` : `Course ${courseId}`;
    exportCLOPLOStatementWord(name, rows);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-40">
          <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
          <p className="text-secondary-light mt-12">Loading statement…</p>
        </div>
      </div>
    );
  }

  const courseName = course ? `${course.code} - ${course.name}` : `Course ${courseId}`;

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h5 className="card-title mb-4">CLO-PLO Statement</h5>
          <p className="text-secondary-light text-sm mb-0">{courseName}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            onClick={handleWordExport}
            disabled={rows.length === 0}
            className="btn btn-sm btn-outline-primary radius-8 d-inline-flex align-items-center gap-1"
          >
            <Icon icon="vscode-icons:file-type-word" className="text-lg" />
            Export Word (.doc)
          </button>
          <Link to="/clos" className="btn btn-sm btn-outline-secondary radius-8">
            Back to CLOs
          </Link>
        </div>
      </div>

      {/* Course info strip */}
      {course && (
        <div className="card-body pb-0">
          <div className="d-flex flex-wrap gap-3">
            <span className="badge bg-primary-100 text-primary-600 radius-4 text-sm px-12 py-6">
              {course.code}
            </span>
            <span className={`badge radius-4 text-sm px-12 py-6 ${course.course_type === "THEORY" ? "bg-info-focus text-info-main" : "bg-warning-focus text-warning-main"}`}>
              {course.course_type}
            </span>
            <span className={`badge radius-4 text-sm px-12 py-6 ${course.is_active ? "bg-success-focus text-success-main" : "bg-danger-focus text-danger-main"}`}>
              {course.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      )}

      <div className="card-body">
        {rows.length === 0 ? (
          <div className="text-center py-40">
            <Icon icon="solar:clipboard-list-outline" className="text-secondary-light" style={{ fontSize: 48 }} />
            <p className="text-secondary-light mt-12">No CLOs found for this course.</p>
            <Link to="/clo-add" className="btn btn-sm btn-primary mt-16">Add CLO</Link>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table className="table bordered-table mb-0">
              <thead>
                <tr className="bg-base">
                  <th style={{ width: 100 }}>CLO</th>
                  <th>CLO Description</th>
                  <th style={{ width: 200 }}>Mapped PLOs</th>
                  <th style={{ width: 220 }}>PLO Description(s)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const ploLabels = row.mapped_plos || row.plo_labels || [];
                  const ploDescs  = row.plo_descriptions || [];
                  return (
                    <tr key={idx}>
                      <td>
                        <span className="badge bg-info-focus text-info-main radius-4 fw-semibold">
                          CLO-{row.clo_number || row.clo}
                        </span>
                      </td>
                      <td className="text-sm">{row.description || row.clo_description || "—"}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {ploLabels.length > 0
                            ? ploLabels.map((label, i) => (
                                <span key={i} className="badge bg-primary-100 text-primary-600 radius-4 text-xs">
                                  {label}
                                </span>
                              ))
                            : <span className="text-secondary-light text-sm">—</span>}
                        </div>
                      </td>
                      <td className="text-sm text-secondary-light">
                        {ploDescs.length > 0
                          ? ploDescs.map((d, i) => <div key={i} className="mb-4">{d}</div>)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="card-footer border-top py-12 px-24 d-flex justify-content-between align-items-center">
          <span className="text-secondary-light text-sm">{rows.length} CLO{rows.length !== 1 ? "s" : ""}</span>
          <button onClick={handleWordExport} className="btn btn-sm btn-primary radius-8 d-inline-flex align-items-center gap-1">
            <Icon icon="vscode-icons:file-type-word" className="text-lg" /> Export Word (.doc)
          </button>
        </div>
      )}
    </div>
  );
};

export default CLOPLOStatementLayer;