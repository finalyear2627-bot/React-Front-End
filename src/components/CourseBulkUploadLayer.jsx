import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../api/course.service";
import { downloadCourseTemplate, parseCourseFile } from "../utils/excelHelper";
import { showSuccess, showError, showInfo } from "../utils/toast";

const CourseBulkUploadLayer = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [rawFile, setRawFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [parseError, setParseError] = useState("");
  const [done, setDone] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setParseError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }
    setParseError("");
    setUploadResult(null);
    setDone(false);
    setFileName(file.name);
    setRawFile(file);
    try {
      const data = await parseCourseFile(file);
      if (data.length === 0) {
        setParseError("No data rows found. Make sure to fill in data below the header row.");
        setParsedData([]);
      } else {
        setParsedData(data);
      }
    } catch (err) {
      setParseError(err.message || "Failed to parse file");
      setParsedData([]);
    }
  };

  const handleFileInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemoveFile = () => {
    setRawFile(null);
    setParsedData([]);
    setFileName("");
    setUploadResult(null);
    setParseError("");
    setDone(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!rawFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await courseService.bulkUploadCourses(rawFile);
      setUploadResult(res);
      setDone(true);
      if (res?.status?.code === 0) {
        showSuccess(res?.status?.message || "Courses uploaded successfully");
      } else {
        showInfo(res?.status?.message || "Upload completed with some issues");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.status?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Upload failed";
      showError(msg);
      setParseError(msg);
    } finally {
      setUploading(false);
    }
  };

  const resultRows = Array.isArray(uploadResult?.result) ? uploadResult.result : [];

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom py-16 px-24 d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Bulk Upload Courses</h5>
        <button
          type="button"
          onClick={() => navigate("/courses")}
          className="btn btn-sm btn-outline-secondary radius-8"
        >
          <Icon icon="ep:arrow-left" className="me-4" />
          Back to List
        </button>
      </div>

      <div className="card-body p-24">
        {/* Step 1 */}
        <div className="mb-32">
          <div className="d-flex align-items-center gap-12 mb-8">
            <span className="w-28-px h-28-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-sm fw-bold">1</span>
            <h6 className="mb-0 text-primary-light">Download Excel Template</h6>
          </div>
          <p className="text-secondary-light text-sm ms-40 mb-4">
            Download <strong>Courses_Template.csv</strong> and fill in your course data. Each row = one course (Theory and Lab are <strong>separate rows</strong> e.g. CMC111 and CMC111-L).
          </p>
          <ul className="text-secondary-light text-sm ms-40 mb-12">
            <li><strong>semester</strong> — Semester number (e.g., 1)</li>
            <li><strong>code</strong> — Course code (e.g., CMC111 or CMC111-L)</li>
            <li><strong>name</strong> — Course name</li>
            <li><strong>course_type</strong> — THEORY or LAB</li>
            <li><strong>course_class</strong> — CORE, GER, or ELECTIVE</li>
            <li><strong>credit_hours_theory</strong> — Theory credit hours (0 for LAB rows)</li>
            <li><strong>credit_hours_lab</strong> — Lab credit hours (0 for THEORY rows)</li>
            <li><strong>program_code</strong> — Program code (e.g., BSCS)</li>
            <li><strong>pre_requisites</strong> — Comma-separated course codes (optional)</li>
            <li><strong>co_requisites</strong> — Comma-separated course codes (optional)</li>
          </ul>
          <button
            type="button"
            onClick={downloadCourseTemplate}
            className="btn btn-outline-primary radius-8 d-inline-flex align-items-center gap-8 ms-40"
          >
            <Icon icon="vscode-icons:file-type-excel" className="text-xl" />
            Download Courses_Template.csv
          </button>
        </div>

        {/* Step 2 */}
        <div className="mb-32">
          <div className="d-flex align-items-center gap-12 mb-8">
            <span className="w-28-px h-28-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-sm fw-bold">2</span>
            <h6 className="mb-0 text-primary-light">Upload Filled File</h6>
          </div>

          {!fileName ? (
            <div
              className="ms-40 rounded-12 p-32 text-center cursor-pointer"
              style={{ border: `2px dashed ${dragOver ? "#4361ee" : "#d0d5dd"}`, background: dragOver ? "#f0f3ff" : "transparent" }}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon icon="solar:upload-linear" style={{ fontSize: 40 }} className="text-secondary-light mb-12" />
              <p className="text-primary-light fw-semibold mb-4">Click to upload or drag & drop</p>
              <p className="text-secondary-light text-sm">.csv, .xlsx, .xls supported</p>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" hidden onChange={handleFileInputChange} />
            </div>
          ) : (
            <div className="ms-40 d-flex align-items-center gap-12 p-16 bg-success-focus radius-8 border border-success-200">
              <Icon icon="vscode-icons:file-type-excel" style={{ fontSize: 28 }} />
              <span className="text-success-main fw-semibold flex-grow-1">{fileName}</span>
              <button type="button" className="btn btn-sm btn-danger-600 radius-8" onClick={handleRemoveFile}>
                <Icon icon="mingcute:delete-2-line" />
              </button>
            </div>
          )}

          {parseError && <div className="ms-40 alert alert-danger mt-12 radius-8">{parseError}</div>}
        </div>

        {/* Step 3 — Preview */}
        {parsedData.length > 0 && !done && (
          <div className="mb-32">
            <div className="d-flex align-items-center gap-12 mb-8">
              <span className="w-28-px h-28-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-sm fw-bold">3</span>
              <h6 className="mb-0 text-primary-light">
                Preview Data
                <span className="badge bg-primary-600 text-white ms-8 radius-4 text-xs fw-normal">{parsedData.length} rows</span>
              </h6>
            </div>

            <div className="ms-40 table-responsive mb-16" style={{ maxHeight: 300, overflowY: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sem</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Class</th>
                    <th>Theory</th>
                    <th>Lab</th>
                    <th>Program</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, i) => (
                    <tr key={i}>
                      <td className="text-secondary-light">{i + 1}</td>
                      <td>{row.semester}</td>
                      <td className="fw-medium">{row.code}</td>
                      <td>{row.name}</td>
                      <td>{row.course_type}</td>
                      <td>{row.course_class}</td>
                      <td>{row.credit_hours_theory}</td>
                      <td>{row.credit_hours_lab}</td>
                      <td>{row.program_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ms-40 d-flex gap-12">
              <button
                type="button"
                className="btn btn-primary radius-8 px-32 py-11"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <><span className="spinner-border spinner-border-sm me-8" role="status" />Uploading...</>
                ) : (
                  <><Icon icon="solar:upload-bold" className="me-6" />Upload {parsedData.length} Courses</>
                )}
              </button>
              <button type="button" className="btn btn-outline-secondary radius-8 px-32" onClick={handleRemoveFile} disabled={uploading}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {done && uploadResult && (
          <div className="ms-40">
            <div className={`alert ${uploadResult?.status?.code === 0 ? "alert-success" : "alert-warning"} mb-16 radius-8`}>
              <strong>{uploadResult?.status?.message || "Upload complete"}</strong>
            </div>

            {resultRows.length > 0 && (
              <div className="table-responsive mb-16" style={{ maxHeight: 300, overflowY: "auto" }}>
                <table className="table bordered-table mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultRows.map((r, i) => (
                      <tr key={i}>
                        <td className="text-secondary-light">{i + 1}</td>
                        <td className="fw-medium">{r.code || r.course_code || "-"}</td>
                        <td>{r.name || "-"}</td>
                        <td>
                          {r.success !== false
                            ? <span className="badge bg-success-focus text-success-main radius-4">Success</span>
                            : <span className="badge bg-danger-focus text-danger-main radius-4">Failed</span>}
                        </td>
                        <td className="text-sm text-secondary-light">{r.message || r.error || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex gap-12">
              <button type="button" className="btn btn-primary radius-8 px-32 py-11" onClick={() => navigate("/courses")}>
                Go to Courses List
              </button>
              <button type="button" className="btn btn-outline-secondary radius-8 px-32" onClick={handleRemoveFile}>
                Upload Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseBulkUploadLayer;
