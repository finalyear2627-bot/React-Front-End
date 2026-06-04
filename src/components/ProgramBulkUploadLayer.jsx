import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { programService } from "../api/program.service";
import { downloadExcelTemplate, parseExcelFile } from "../utils/excelHelper";

const ProgramBulkUploadLayer = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [parseError, setParseError] = useState("");
  const [done, setDone] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setParseError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }
    setParseError("");
    setResults([]);
    setDone(false);
    setFileName(file.name);
    try {
      const data = await parseExcelFile(file);
      if (data.length === 0) {
        setParseError("No data rows found in the file. Make sure to fill in data below the header row.");
        setParsedData([]);
      } else {
        setParsedData(data);
      }
    } catch (err) {
      setParseError(err.message || "Failed to parse file");
      setParsedData([]);
    }
  };

  const handleFileInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemoveFile = () => {
    setParsedData([]);
    setFileName("");
    setResults([]);
    setParseError("");
    setDone(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    setUploading(true);
    setResults([]);
    try {
      const res = await programService.bulkCreatePrograms(parsedData);
      setResults(res);
      setDone(true);
    } catch (err) {
      setParseError("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom py-16 px-24 d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Bulk Upload Programs</h5>
        <button
          type="button"
          onClick={() => navigate("/programs")}
          className="btn btn-sm btn-outline-secondary radius-8"
        >
          <Icon icon="ep:arrow-left" className="me-4" />
          Back to List
        </button>
      </div>

      <div className="card-body p-24">
        {/* Step 1 — Download Template */}
        <div className="mb-32">
          <div className="d-flex align-items-center gap-12 mb-8">
            <span className="w-28-px h-28-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-sm fw-bold">1</span>
            <h6 className="mb-0 text-primary-light">Download Excel Template</h6>
          </div>
          <p className="text-secondary-light text-sm ms-40 mb-12">
            Download the template file, fill in your program data, then upload it below.
            The file has two columns: <strong>Code</strong> and <strong>Name</strong>.
          </p>
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="btn btn-outline-primary radius-8 d-inline-flex align-items-center gap-8 ms-40"
          >
            <Icon icon="vscode-icons:file-type-excel" className="text-xl" />
            Download Template (.csv)
          </button>
        </div>

        {/* Step 2 — Upload File */}
        <div className="mb-32">
          <div className="d-flex align-items-center gap-12 mb-8">
            <span className="w-28-px h-28-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-sm fw-bold">2</span>
            <h6 className="mb-0 text-primary-light">Upload Filled File</h6>
          </div>

          {!fileName ? (
            <div
              className={`ms-40 border-2 border-dashed rounded-12 p-32 text-center cursor-pointer ${dragOver ? "border-primary-600 bg-primary-50" : "border-neutral-300"}`}
              style={{ border: "2px dashed", borderColor: dragOver ? "#4361ee" : "#d0d5dd" }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon icon="solar:upload-linear" className="text-4xl text-secondary-light mb-12" style={{ fontSize: 40 }} />
              <p className="text-primary-light fw-semibold mb-4">Click to upload or drag & drop</p>
              <p className="text-secondary-light text-sm">.csv, .xlsx, .xls supported</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                hidden
                onChange={handleFileInputChange}
              />
            </div>
          ) : (
            <div className="ms-40 d-flex align-items-center gap-12 p-16 bg-success-focus radius-8 border border-success-200">
              <Icon icon="vscode-icons:file-type-excel" className="text-2xl" style={{ fontSize: 28 }} />
              <span className="text-success-main fw-semibold flex-grow-1">{fileName}</span>
              <button
                type="button"
                className="btn btn-sm btn-danger-600 radius-8"
                onClick={handleRemoveFile}
              >
                <Icon icon="mingcute:delete-2-line" />
              </button>
            </div>
          )}

          {parseError && (
            <div className="ms-40 alert alert-danger mt-12 radius-8">{parseError}</div>
          )}
        </div>

        {/* Step 3 — Preview & Submit */}
        {parsedData.length > 0 && !done && (
          <div className="mb-32">
            <div className="d-flex align-items-center gap-12 mb-8">
              <span className="w-28-px h-28-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-sm fw-bold">3</span>
              <h6 className="mb-0 text-primary-light">
                Preview Data
                <span className="badge bg-primary-600 text-white ms-8 radius-4 text-xs fw-normal">{parsedData.length} rows</span>
              </h6>
            </div>

            <div className="ms-40 table-responsive mb-16" style={{ maxHeight: 320, overflowY: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, i) => (
                    <tr key={i}>
                      <td className="text-secondary-light">{i + 1}</td>
                      <td className="fw-medium">{row.code}</td>
                      <td>{row.name}</td>
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
                  <>
                    <span className="spinner-border spinner-border-sm me-8" role="status" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:upload-bold" className="me-6" />
                    Upload {parsedData.length} Programs
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary radius-8 px-32"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {done && results.length > 0 && (
          <div className="ms-40">
            <div className="d-flex gap-16 mb-16">
              {successCount > 0 && (
                <div className="d-flex align-items-center gap-8 text-success-main">
                  <Icon icon="material-symbols:check-circle" className="text-xl" />
                  <span className="fw-semibold">{successCount} created successfully</span>
                </div>
              )}
              {failCount > 0 && (
                <div className="d-flex align-items-center gap-8 text-danger-main">
                  <Icon icon="material-symbols:error" className="text-xl" />
                  <span className="fw-semibold">{failCount} failed</span>
                </div>
              )}
            </div>

            <div className="table-responsive" style={{ maxHeight: 320, overflowY: "auto" }}>
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td className="fw-medium">{r.code}</td>
                      <td>
                        {r.success ? (
                          <span className="badge bg-success-focus text-success-main radius-4">Success</span>
                        ) : (
                          <span className="badge bg-danger-focus text-danger-main radius-4">Failed</span>
                        )}
                      </td>
                      <td className="text-sm text-secondary-light">{r.success ? "Created" : r.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex gap-12 mt-16">
              <button
                type="button"
                className="btn btn-primary radius-8 px-32 py-11"
                onClick={() => navigate("/programs")}
              >
                Go to Programs List
              </button>
              {failCount > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary radius-8 px-32"
                  onClick={handleRemoveFile}
                >
                  Upload Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramBulkUploadLayer;