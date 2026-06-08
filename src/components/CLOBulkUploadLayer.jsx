import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cloService } from "../api/clo.service";
import { downloadCLOTemplate } from "../utils/excelHelper";
import { showSuccess, showError, showInfo } from "../utils/toast";

const CLOBulkUploadLayer = () => {
  const navigate = useNavigate();
  const fileRef  = useRef(null);
  const [rawFile,      setRawFile]      = useState(null);
  const [fileName,     setFileName]     = useState("");
  const [dragOver,     setDragOver]     = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [fileError,    setFileError]    = useState("");
  const [done,         setDone]         = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setFileError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }
    setFileError(""); setUploadResult(null); setDone(false);
    setFileName(file.name); setRawFile(file);
  };

  const reset = () => {
    setRawFile(null); setFileName(""); setUploadResult(null);
    setFileError(""); setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!rawFile) return;
    setUploading(true); setUploadResult(null);
    try {
      const res = await cloService.bulkImport(rawFile);
      setUploadResult(res); setDone(true);
      if (res?.status?.code === 0) showSuccess(res?.status?.message || "CLOs uploaded successfully");
      else showInfo(res?.status?.message || "Upload completed with issues");
    } catch (err) {
      const msg = err?.response?.data?.status?.message || err?.response?.data?.detail || err?.message || "Upload failed";
      showError(msg); setFileError(msg);
    } finally {
      setUploading(false);
    }
  };

  const resultRows = Array.isArray(uploadResult?.result) ? uploadResult.result : [];

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom py-16 px-24 d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Bulk Upload CLOs</h5>
        <button onClick={() => navigate("/clos")} className="btn btn-sm btn-outline-secondary radius-8">
          <Icon icon="ep:arrow-left" className="me-4" /> Back to List
        </button>
      </div>

      <div className="card-body p-24">
        {/* Step 1 */}
        <div className="mb-32">
          <div className="d-flex align-items-center gap-12 mb-8">
            <span className="w-28-px h-28-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-sm fw-bold">1</span>
            <h6 className="mb-0 text-primary-light">Download CSV Template</h6>
          </div>
          <p className="text-secondary-light text-sm ms-40 mb-4">
            Download <strong>CLOs_Template.csv</strong> and fill in CLO data. Required columns:
          </p>
          <ul className="text-secondary-light text-sm ms-40 mb-12">
            <li><strong>course_code</strong> — Course code (e.g., CMC111)</li>
            <li><strong>clo_number</strong> — CLO number (e.g., 1, 2, 3…)</li>
            <li><strong>description</strong> — CLO description text</li>
            <li><strong>mapped_plos</strong> — PLO labels, comma-separated (e.g., <code>PLO-1,PLO-2</code> or <code>1,2</code>)</li>
          </ul>
          <div className="alert alert-info radius-8 text-sm ms-40 mb-12 d-flex align-items-start gap-8">
            <Icon icon="solar:info-circle-outline" className="text-xl flex-shrink-0 mt-1" />
            <span>
              Rows with an inactive course or inactive semester are skipped automatically.
              The upload result will show the reason for each skipped row.
            </span>
          </div>
          <button onClick={downloadCLOTemplate} className="btn btn-outline-primary radius-8 d-inline-flex align-items-center gap-8 ms-40">
            <Icon icon="vscode-icons:file-type-excel" className="text-xl" /> Download CLOs_Template.csv
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
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
            >
              <Icon icon="solar:upload-linear" style={{ fontSize: 40 }} className="text-secondary-light mb-12" />
              <p className="text-primary-light fw-semibold mb-4">Click to upload or drag & drop</p>
              <p className="text-secondary-light text-sm">.csv, .xlsx, .xls supported</p>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" hidden onChange={(e) => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="ms-40 d-flex align-items-center gap-12 p-16 bg-success-focus radius-8 border border-success-200">
              <Icon icon="vscode-icons:file-type-excel" style={{ fontSize: 28 }} />
              <span className="text-success-main fw-semibold flex-grow-1">{fileName}</span>
              <button className="btn btn-sm btn-danger-600 radius-8" onClick={reset}>
                <Icon icon="mingcute:delete-2-line" />
              </button>
            </div>
          )}
          {fileError && <div className="ms-40 alert alert-danger mt-12 radius-8">{fileError}</div>}
        </div>

        {/* Step 3 */}
        {rawFile && !done && (
          <div className="mb-32">
            <div className="d-flex align-items-center gap-12 mb-8">
              <span className="w-28-px h-28-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-sm fw-bold">3</span>
              <h6 className="mb-0 text-primary-light">Upload to Server</h6>
            </div>
            <div className="ms-40 d-flex gap-12">
              <button className="btn btn-primary radius-8 px-32 py-11" onClick={handleUpload} disabled={uploading}>
                {uploading
                  ? <><span className="spinner-border spinner-border-sm me-8" />Uploading…</>
                  : <><Icon icon="solar:upload-bold" className="me-6" />Upload CLOs</>}
              </button>
              <button className="btn btn-outline-secondary radius-8 px-32" onClick={reset} disabled={uploading}>Cancel</button>
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
                    <tr><th>#</th><th>Course</th><th>CLO No.</th><th>Status</th><th>Message</th></tr>
                  </thead>
                  <tbody>
                    {resultRows.map((r, i) => (
                      <tr key={i}>
                        <td className="text-secondary-light">{i + 1}</td>
                        <td>{r.course_code || "-"}</td>
                        <td>{r.clo_number || "-"}</td>
                        <td>
                          {r.success !== false
                            ? <span className="badge bg-success-focus text-success-main radius-4">Success</span>
                            : <span className="badge bg-danger-focus text-danger-main radius-4">Skipped</span>}
                        </td>
                        <td className="text-sm text-secondary-light">{r.message || r.error || r.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="d-flex gap-12">
              <button className="btn btn-primary radius-8 px-32 py-11" onClick={() => navigate("/clos")}>Go to CLO List</button>
              <button className="btn btn-outline-secondary radius-8 px-32" onClick={reset}>Upload Another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CLOBulkUploadLayer;