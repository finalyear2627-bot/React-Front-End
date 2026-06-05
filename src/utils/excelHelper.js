export const downloadCourseTemplate = () => {
  const headers = [
    "code",
    "name",
    "course_class",
    "credit_hours_theory",
    "credit_hours_lab",
    "program_code",
    "pre_requisites",
    "co_requisites",
  ];
  const sampleData = [
    ["CMC111", "Programming Fundamentals", "CORE", "3", "0", "BSCS", "", ""],
    ["CMC112", "Data Structures", "CORE", "3", "1", "BSCS", "CMC111", ""],
    ["CMC113", "Database Systems", "CORE", "3", "1", "BSCS", "CMC111", "CMC112"],
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
            if (cells.length >= 2 && cells[0] && cells[1]) {
              return {
                code: cells[0],
                name: cells[1],
                course_class: cells[2] || "CORE",
                credit_hours_theory: cells[3] ? parseInt(cells[3], 10) || 0 : 0,
                credit_hours_lab: cells[4] ? parseInt(cells[4], 10) || 0 : 0,
                program_code: cells[5] || "",
                pre_requisites: cells[6] || "",
                co_requisites: cells[7] || "",
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
