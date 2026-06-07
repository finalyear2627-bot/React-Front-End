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
