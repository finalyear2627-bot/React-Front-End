export const downloadCourseTemplate = () => {
  const headers = [
    "semester",
    "code",
    "name",
    "course_type",
    "course_class",
    "credit_hours_theory",
    "credit_hours_lab",
    "program_code",
    "pre_requisites",
    "co_requisites",
  ];
  const sampleData = [
    ["1", "CMC111",   "Programming Fundamentals",       "THEORY", "CORE", "3", "0", "BSCS", "",       "CMC111-L"],
    ["1", "CMC111-L", "Programming Fundamentals (Lab)", "LAB",    "CORE", "0", "1", "BSCS", "",       ""],
    ["2", "CMC112",   "Data Structures",                "THEORY", "CORE", "3", "0", "BSCS", "CMC111", "CMC112-L"],
  ];

  let csvContent = headers.join(",") + "\n";
  sampleData.forEach((row) => {
    csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "Courses_Template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCourseFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split("\n").filter((line) => line.trim());
        const dataRows = lines.slice(1);
        const courses = dataRows
          .map((line) => {
            const cells = line.split(",").map((cell) => cell.replace(/"/g, "").trim());
            // Need at least semester, code, name
            if (cells.length >= 3 && cells[1] && cells[2]) {
              return {
                semester:            cells[0] ? parseInt(cells[0], 10) || 1 : 1,
                code:                cells[1],
                name:                cells[2],
                course_type:         cells[3] || "THEORY",
                course_class:        cells[4] || "CORE",
                credit_hours_theory: cells[5] ? parseInt(cells[5], 10) || 0 : 0,
                credit_hours_lab:    cells[6] ? parseInt(cells[6], 10) || 0 : 0,
                program_code:        cells[7] || "",
                pre_requisites:      cells[8] || "",
                co_requisites:       cells[9] || "",
              };
            }
            return null;
          })
          .filter((item) => item !== null);
        resolve(courses);
      } catch (error) {
        reject(new Error("Failed to parse file: " + error.message));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

export const downloadExcelTemplate = () => {
  // Create CSV template (Excel compatible)
  const headers = ["Code", "Name"];
  const sampleData = [
    ["BSSE", "BS Software Engineering"],
    ["BCS", "BS Computer Science"],
    ["BIT", "BS Information Technology"],
  ];

  // Create CSV content
  let csvContent = headers.join(",") + "\n";
  sampleData.forEach((row) => {
    csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "Programs_Template.csv");
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ─── PLO template ───────────────────────────────────────────────────────────

export const downloadPLOTemplate = () => {
  const headers = ["program_code", "plo_number", "description"];
  const sampleData = [
    ["BSCS", "1", "Apply knowledge of computing to solve real-world problems"],
    ["BSCS", "2", "Design and implement software systems meeting specified requirements"],
    ["BSCS", "3", "Demonstrate effective communication skills in technical contexts"],
  ];
  let csv = headers.join(",") + "\n";
  sampleData.forEach((r) => { csv += r.map((c) => `"${c}"`).join(",") + "\n"; });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "PLOs_Template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ─── CLO template ───────────────────────────────────────────────────────────

export const downloadCLOTemplate = () => {
  const headers = ["course_code", "clo_number", "description", "mapped_plos"];
  const sampleData = [
    ["CMC111",   "1", "Write syntactically correct programs in a high-level language", "PLO-1,PLO-2"],
    ["CMC111",   "2", "Trace and debug logic errors in small programs",                "PLO-1"],
    ["CMC111",   "3", "Describe basic programming constructs clearly in writing",       "PLO-3"],
    ["CMC111-L", "1", "Implement programs using arrays and functions in the lab",      "PLO-1,PLO-2"],
  ];
  let csv = headers.join(",") + "\n";
  sampleData.forEach((r) => { csv += r.map((c) => `"${c}"`).join(",") + "\n"; });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "CLOs_Template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ─── CLO-PLO Statement Word export ──────────────────────────────────────────

export const exportCLOPLOStatementWord = (courseName, rows) => {
  const tableRows = rows
    .map(
      (r) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px 10px;font-weight:600">CLO-${r.clo_number || r.clo}</td>
        <td style="border:1px solid #ccc;padding:6px 10px">${r.description || r.clo_description || ""}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:center">
          ${(r.mapped_plos || []).join(", ")}
        </td>
      </tr>`
    )
    .join("");

  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
    xmlns:w='urn:schemas-microsoft-com:office:word'
    xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>CLO-PLO Statement</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 2cm; }
      h1   { font-size: 16pt; color: #1a3a6e; }
      h2   { font-size: 13pt; color: #333; margin-top: 18pt; }
      table { border-collapse: collapse; width: 100%; }
      th { background: #1a3a6e; color: #fff; padding: 8px 10px; border: 1px solid #1a3a6e; text-align: left; }
    </style></head>
    <body>
      <h1>CLO-PLO Statement</h1>
      <h2>Course: ${courseName}</h2>
      <table>
        <thead>
          <tr>
            <th style="width:12%">CLO</th>
            <th style="width:66%">Description</th>
            <th style="width:22%;text-align:center">Mapped PLOs</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
  </html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", `CLO_PLO_Statement_${courseName.replace(/\s+/g, "_")}.doc`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split("\n").filter((line) => line.trim());

        // Skip header row
        const dataRows = lines.slice(1);
        const programs = dataRows
          .map((line) => {
            const cells = line.split(",").map((cell) => cell.replace(/"/g, "").trim());
            if (cells.length >= 2 && cells[0] && cells[1]) {
              return {
                code: cells[0],
                name: cells[1],
              };
            }
            return null;
          })
          .filter((item) => item !== null);

        resolve(programs);
      } catch (error) {
        reject(new Error("Failed to parse file: " + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};
