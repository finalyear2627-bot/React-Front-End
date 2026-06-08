import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cloService } from "../api/clo.service";
import { courseService } from "../api/course.service";
import { ploService } from "../api/plo.service";
import { programService } from "../api/program.service";
import { showSuccess, showError, showInfo, getApiError } from "../utils/toast";

// ─── template generators (inline — need live course/PLO data) ───────────────

const generateExcelTemplate = (courses, plos, programs) => {
  const activeCourses = courses.filter((c) => c.is_active);

  const plosByProgram = {};
  plos.forEach((p) => {
    const key = String(p.program);
    if (!plosByProgram[key]) plosByProgram[key] = [];
    plosByProgram[key].push(p);
  });

  const progMap = {};
  programs.forEach((p) => { progMap[String(p.id)] = p; });

  // Comment rows (lines starting with # are ignored by most parsers)
  let csv =
    "# CLO-PLO Data Entry Template — generated " + new Date().toLocaleDateString() + "\n" +
    "# Fill in clo_description and mapped_plos for each row.\n" +
    "# mapped_plos format: PLO-1,PLO-2  OR  1,2  (comma-separated PLO numbers)\n" +
    "# Rows with empty clo_description are skipped during import.\n" +
    "#\n";

  // PLO quick-reference block
  csv += "# PLO REFERENCE:\n";
  programs.forEach((prog) => {
    const progPLOs = plosByProgram[String(prog.id)] || [];
    if (progPLOs.length > 0) {
      csv += `# ${prog.code}: ` + progPLOs.map((p) => `PLO-${p.plo_number}="${p.description}"`).join(" | ") + "\n";
    }
  });
  csv += "#\n";

  // Header
  csv += "course_code,course_name,program_code,clo_number,clo_description,mapped_plos\n";

  // One section per active course — 5 pre-filled rows each
  activeCourses.forEach((course) => {
    const pid = String(course.program || course.program_detail?.id || "");
    const prog = progMap[pid];
    const progCode = prog?.code || course.program_code || pid;
    const programPLOs = plosByProgram[pid] || [];
    const firstPLO = programPLOs[0] ? `PLO-${programPLOs[0].plo_number}` : "";

    for (let i = 1; i <= 5; i++) {
      const examplePLO = i === 1 ? firstPLO : "";
      csv +=
        `"${course.code}","${course.name}","${progCode}","${i}","","${examplePLO}"\n`;
    }
  });

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "CLO_PLO_Template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateWordTemplate = (courses, plos, programs) => {
  const activeCourses = courses.filter((c) => c.is_active);

  const plosByProgram = {};
  plos.forEach((p) => {
    const key = String(p.program);
    if (!plosByProgram[key]) plosByProgram[key] = [];
    plosByProgram[key].push(p);
  });

  const coursesByProgram = {};
  activeCourses.forEach((c) => {
    const key = String(c.program || c.program_detail?.id || "other");
    if (!coursesByProgram[key]) coursesByProgram[key] = [];
    coursesByProgram[key].push(c);
  });

  let body = `
    <h1 style="color:#1a3a6e;border-bottom:3px solid #1a3a6e;padding-bottom:8px">
      CLO–PLO Data Entry Template
    </h1>
    <p style="color:#555;font-size:10pt">
      Generated: ${new Date().toLocaleDateString()}
      &nbsp;|&nbsp; Fill in <em>CLO Description</em> and <em>Mapped PLOs</em> columns.
      &nbsp;|&nbsp; After filling, transfer data to <strong>CLO_PLO_Template.csv</strong> and upload via the Generator page.
    </p>
    <hr/>
  `;

  programs.forEach((prog) => {
    const pid = String(prog.id);
    const progCourses = coursesByProgram[pid] || [];
    if (progCourses.length === 0) return;
    const progPLOs = plosByProgram[pid] || [];

    body += `<h2 style="background:#1a3a6e;color:white;padding:8px 14px;margin-top:28pt">${prog.code} — ${prog.name}</h2>`;

    // PLO reference table
    if (progPLOs.length > 0) {
      body += `
        <h3 style="color:#1a3a6e;margin-bottom:4pt">Program Learning Outcomes (PLO Reference)</h3>
        <table border="1" cellpadding="5" cellspacing="0"
          style="border-collapse:collapse;width:100%;margin-bottom:14pt;font-size:10pt">
          <thead>
            <tr style="background:#dce8ff">
              <th style="width:70pt;text-align:center">PLO No.</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${progPLOs
              .map(
                (p) => `<tr>
                  <td style="text-align:center;font-weight:bold">PLO-${p.plo_number}</td>
                  <td>${p.description}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `;
    } else {
      body += `<p style="color:#999;font-style:italic;margin-bottom:10pt">No PLOs defined for this program yet. Add PLOs before filling CLOs.</p>`;
    }

    // Course tables
    progCourses.forEach((course) => {
      body += `
        <h4 style="color:#2d5a27;margin-top:14pt;margin-bottom:3pt">
          ${course.code} &mdash; ${course.name}
          <span style="font-weight:normal;color:#888;font-size:9pt">&nbsp;(${course.course_type})</span>
        </h4>
        <table border="1" cellpadding="5" cellspacing="0"
          style="border-collapse:collapse;width:100%;margin-bottom:16pt;font-size:10pt">
          <thead>
            <tr style="background:#f0faf0">
              <th style="width:56pt;text-align:center">CLO No.</th>
              <th>CLO Description</th>
              <th style="width:110pt;text-align:center">Mapped PLOs<br/><small style="font-weight:normal">(e.g. PLO-1,PLO-2)</small></th>
            </tr>
          </thead>
          <tbody>
            ${[1, 2, 3, 4, 5]
              .map(
                (i) => `<tr style="height:22pt">
                  <td style="text-align:center;color:#555">CLO-${i}</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `;
    });

    body += `<p style="page-break-after:always"></p>`;
  });

  const html = `<html
    xmlns:o='urn:schemas-microsoft-com:office:office'
    xmlns:w='urn:schemas-microsoft-com:office:word'
    xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'><title>CLO-PLO Template</title>
      <style>
        body  { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 2cm; }
        table { width: 100%; }
        th, td { border: 1px solid #b0b0b0; padding: 5px 8px; }
      </style>
    </head>
    <body>${body}</body>
  </html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "CLO_PLO_Template.doc");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ─── Main component ──────────────────────────────────────────────────────────

const CLOPLOGeneratorLayer = () => {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [courses,   setCourses]   = useState([]);
  const [plos,      setPlos]      = useState([]);
  const [programs,  setPrograms]  = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const [loading,   setLoading]   = useState(true);

  const [rawFile,      setRawFile]      = useState(null);
  const [fileName,     setFileName]     = useState("");
  const [dragOver,     setDragOver]     = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [fileError,    setFileError]    = useState("");
  const [done,         setDone]         = useState(false);

  useEffect(() => {
    Promise.all([
      courseService.getAllCourses(),
      ploService.getAll(),
      programService.getAllPrograms(),
    ])
      .then(([cData, pData, prData]) => {
        setCourses(Array.isArray(cData) ? cData : cData.result || cData.results || []);
        setPlos(Array.isArray(pData)   ? pData : pData.result || pData.results || []);
        setPrograms(Array.isArray(prData) ? prData : prData.result || prData.results || []);
        setDataReady(true);
      })
      .catch((err) => showError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const activeCourseCount = courses.filter((c) => c.is_active).length;

  // ── File handling ────────────────────────────────────────────────────────
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

  const resetFile = () => {
    setRawFile(null); setFileName(""); setUploadResult(null);
    setFileError(""); setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!rawFile) return;
    setUploading(true); setUploadResult(null);
    try {
      const res = await cloService.bulkImport(rawFile);
      setUploadResult(res);
      setDone(true);
      if (res?.status?.code === 0) showSuccess(res?.status?.message || "CLOs imported successfully");
      else showInfo(res?.status?.message || "Import completed with issues");
    } catch (err) {
      const msg =
        err?.response?.data?.status?.message ||
        err?.response?.data?.detail ||
        err?.message || "Upload failed";
      showError(msg); setFileError(msg);
    } finally {
      setUploading(false);
    }
  };

  const resultRows = Array.isArray(uploadResult?.result) ? uploadResult.result : [];

  // ── Stats ────────────────────────────────────────────────────────────────
  const statCard = (icon, label, value, color) => (
    <div className="col-sm-6 col-md-3">
      <div className={`card radius-8 border-0`} style={{ background: `var(--${color}-50, #f5f5f5)` }}>
        <div className="card-body p-16 d-flex align-items-center gap-12">
          <div className={`w-40-px h-40-px rounded-circle d-inline-flex align-items-center justify-content-center bg-${color}-100`}>
            <Icon icon={icon} className={`text-${color}-600 text-xl`} />
          </div>
          <div>
            <p className="text-secondary-light text-sm mb-0">{label}</p>
            <h6 className="fw-semibold mb-0">{value}</h6>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Page header ── */}
      <div className="card mb-24">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="card-title mb-4">CLO-PLO Generator</h5>
            <p className="text-secondary-light text-sm mb-0">
              Download templates, fill in CLO data for all courses, then upload to import.
            </p>
          </div>
          <span className="badge bg-danger-focus text-danger-main radius-4 px-12 py-8 fw-semibold">
            <Icon icon="solar:shield-keyhole-outline" className="me-4" /> ADMIN ONLY
          </span>
        </div>

        {/* Stats row */}
        <div className="card-body">
          {loading ? (
            <div className="text-center py-20">
              <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 28 }} />
            </div>
          ) : (
            <div className="row g-3">
              {statCard("solar:book-outline",            "Programs",       programs.length,                      "primary")}
              {statCard("solar:notebook-outline",        "Active Courses",  activeCourseCount,                    "success")}
              {statCard("solar:diploma-outline",         "PLOs Defined",   plos.length,                          "info")}
              {statCard("solar:clipboard-list-outline",  "PLO-less Progs", programs.filter(p => !plos.some(x => String(x.program) === String(p.id))).length, "warning")}
            </div>
          )}
        </div>
      </div>

      {/* ── Step 1: Download templates ── */}
      <div className="card mb-24">
        <div className="card-header">
          <h6 className="card-title mb-0 d-flex align-items-center gap-8">
            <span className="w-24-px h-24-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-xs fw-bold">1</span>
            Download Templates
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">

            {/* Excel Template */}
            <div className="col-md-6">
              <div className="border radius-8 p-20 h-100">
                <div className="d-flex align-items-start gap-12 mb-12">
                  <div className="w-40-px h-40-px rounded-circle bg-success-focus d-inline-flex align-items-center justify-content-center flex-shrink-0">
                    <Icon icon="vscode-icons:file-type-excel" style={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-4">Excel Template (.csv)</h6>
                    <p className="text-secondary-light text-sm mb-0">
                      Pre-filled with <strong>{activeCourseCount} active courses</strong> (5 CLO rows each).
                      PLO reference included as comments. Fill in descriptions &amp; mapped PLOs.
                    </p>
                  </div>
                </div>
                <ul className="text-secondary-light text-sm mb-16 ps-20">
                  <li><strong>course_code</strong> — pre-filled</li>
                  <li><strong>course_name</strong> — pre-filled</li>
                  <li><strong>program_code</strong> — pre-filled</li>
                  <li><strong>clo_number</strong> — pre-filled (1–5)</li>
                  <li><strong>clo_description</strong> — <em>fill this in</em></li>
                  <li><strong>mapped_plos</strong> — e.g. <code>PLO-1,PLO-2</code></li>
                </ul>
                <button
                  onClick={() => generateExcelTemplate(courses, plos, programs)}
                  disabled={!dataReady || loading}
                  className="btn btn-success radius-8 d-inline-flex align-items-center gap-8"
                >
                  <Icon icon="vscode-icons:file-type-excel" className="text-lg" />
                  Download CLO_PLO_Template.csv
                </button>
              </div>
            </div>

            {/* Word Template */}
            <div className="col-md-6">
              <div className="border radius-8 p-20 h-100">
                <div className="d-flex align-items-start gap-12 mb-12">
                  <div className="w-40-px h-40-px rounded-circle bg-primary-100 d-inline-flex align-items-center justify-content-center flex-shrink-0">
                    <Icon icon="vscode-icons:file-type-word" style={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-4">Word Template (.doc)</h6>
                    <p className="text-secondary-light text-sm mb-0">
                      Full document with a table per course, PLO reference for each program.
                      Use for planning and documentation. Transfer final data to the CSV to upload.
                    </p>
                  </div>
                </div>
                <ul className="text-secondary-light text-sm mb-16 ps-20">
                  <li>One section per program</li>
                  <li>PLO reference table at top of each section</li>
                  <li>Per-course CLO table (5 rows with Code / Description / Mapped PLOs)</li>
                  <li>Page-break between programs</li>
                </ul>
                <button
                  onClick={() => generateWordTemplate(courses, plos, programs)}
                  disabled={!dataReady || loading}
                  className="btn btn-primary radius-8 d-inline-flex align-items-center gap-8"
                >
                  <Icon icon="vscode-icons:file-type-word" className="text-lg" />
                  Download CLO_PLO_Template.doc
                </button>
              </div>
            </div>

          </div>

          {!loading && plos.length === 0 && (
            <div className="alert alert-warning radius-8 mt-16 d-flex align-items-start gap-8">
              <Icon icon="solar:danger-triangle-outline" className="text-xl flex-shrink-0 mt-1" />
              <span>
                No PLOs are defined yet. The templates will be generated without PLO references.
                <strong> Add PLOs first</strong> for a more useful template.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 2: Upload filled file ── */}
      <div className="card mb-24">
        <div className="card-header">
          <h6 className="card-title mb-0 d-flex align-items-center gap-8">
            <span className="w-24-px h-24-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-xs fw-bold">2</span>
            Upload Filled Template
          </h6>
        </div>
        <div className="card-body">
          <div className="alert alert-info radius-8 d-flex align-items-start gap-8 mb-20">
            <Icon icon="solar:info-circle-outline" className="text-xl flex-shrink-0 mt-1" />
            <div className="text-sm">
              <strong>Before uploading:</strong>
              <ul className="mb-0 mt-4 ps-16">
                <li>Delete comment rows (lines starting with <code>#</code>) from the CSV, or leave them — the backend skips them.</li>
                <li>Leave empty <code>clo_description</code> rows — they will be skipped automatically.</li>
                <li>Inactive courses and courses whose semester is inactive will be skipped with a reason shown in the results.</li>
              </ul>
            </div>
          </div>

          {!fileName ? (
            <div
              className="rounded-12 p-40 text-center"
              style={{
                border: `2px dashed ${dragOver ? "#4361ee" : "#d0d5dd"}`,
                background: dragOver ? "#f0f3ff" : "transparent",
                cursor: "pointer",
              }}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
            >
              <Icon icon="solar:upload-linear" style={{ fontSize: 48 }} className="text-secondary-light mb-12" />
              <p className="text-primary-light fw-semibold mb-4">Click to upload or drag &amp; drop</p>
              <p className="text-secondary-light text-sm mb-0">.csv, .xlsx, .xls supported</p>
              <input
                ref={fileRef} type="file" accept=".csv,.xlsx,.xls" hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="d-flex align-items-center gap-12 p-16 bg-success-focus radius-8 border border-success-200 mb-16">
              <Icon icon="vscode-icons:file-type-excel" style={{ fontSize: 28 }} />
              <span className="text-success-main fw-semibold flex-grow-1">{fileName}</span>
              <button className="btn btn-sm btn-danger-600 radius-8" onClick={resetFile}>
                <Icon icon="mingcute:delete-2-line" />
              </button>
            </div>
          )}

          {fileError && <div className="alert alert-danger mt-12 radius-8">{fileError}</div>}

          {rawFile && !done && (
            <div className="d-flex gap-12 mt-16">
              <button
                className="btn btn-primary radius-8 px-32 py-11"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <><span className="spinner-border spinner-border-sm me-8" />Importing…</>
                ) : (
                  <><Icon icon="solar:upload-bold" className="me-6" />Import CLOs</>
                )}
              </button>
              <button className="btn btn-outline-secondary radius-8 px-32" onClick={resetFile} disabled={uploading}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 3: Results ── */}
      {done && uploadResult && (
        <div className="card">
          <div className="card-header">
            <h6 className="card-title mb-0 d-flex align-items-center gap-8">
              <span className="w-24-px h-24-px rounded-circle bg-primary-600 text-white d-inline-flex align-items-center justify-content-center text-xs fw-bold">3</span>
              Import Results
            </h6>
          </div>
          <div className="card-body">
            <div className={`alert ${uploadResult?.status?.code === 0 ? "alert-success" : "alert-warning"} mb-16 radius-8`}>
              <strong>{uploadResult?.status?.message || "Import complete"}</strong>
            </div>

            {resultRows.length > 0 && (
              <div className="table-responsive mb-16" style={{ maxHeight: 400, overflowY: "auto" }}>
                <table className="table bordered-table mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Course</th>
                      <th>CLO No.</th>
                      <th>Status</th>
                      <th>Message / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultRows.map((r, i) => (
                      <tr key={i}>
                        <td className="text-secondary-light">{i + 1}</td>
                        <td className="fw-medium">{r.course_code || "-"}</td>
                        <td>{r.clo_number || "-"}</td>
                        <td>
                          {r.success !== false
                            ? <span className="badge bg-success-focus text-success-main radius-4">Imported</span>
                            : <span className="badge bg-danger-focus text-danger-main radius-4">Skipped</span>}
                        </td>
                        <td className="text-sm text-secondary-light">
                          {r.message || r.error || r.reason || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary badges */}
            {resultRows.length > 0 && (
              <div className="d-flex gap-12 mb-20">
                <span className="badge bg-success-focus text-success-main radius-4 px-12 py-6">
                  {resultRows.filter((r) => r.success !== false).length} Imported
                </span>
                <span className="badge bg-danger-focus text-danger-main radius-4 px-12 py-6">
                  {resultRows.filter((r) => r.success === false).length} Skipped
                </span>
              </div>
            )}

            <div className="d-flex gap-12">
              <button className="btn btn-primary radius-8 px-32 py-11" onClick={() => navigate("/clos")}>
                View CLO List
              </button>
              <button className="btn btn-outline-secondary radius-8 px-32" onClick={resetFile}>
                Upload Another File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CLOPLOGeneratorLayer;