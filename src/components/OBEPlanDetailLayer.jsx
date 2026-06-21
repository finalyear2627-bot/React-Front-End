import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  obePlanService, obeComponentService, obeMappingService,
  obeStudentService, obeMarkService,
} from "../api/obe.service";
import { cloService } from "../api/clo.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const COMPONENT_TYPES = [
  "QUIZ", "ASSIGNMENT", "MIDTERM", "FINAL", "PRESENTATION", "PROJECT", "LAB", "OTHER",
];

const TYPE_COLORS = {
  QUIZ:         "bg-info-focus text-info-main",
  ASSIGNMENT:   "bg-success-focus text-success-main",
  MIDTERM:      "bg-warning-focus text-warning-main",
  FINAL:        "bg-danger-focus text-danger-main",
  PRESENTATION: "bg-primary-100 text-primary-600",
  PROJECT:      "bg-primary-200 text-primary-700",
  LAB:          "bg-neutral-200 text-neutral-600",
  OTHER:        "bg-neutral-100 text-neutral-500",
};

/* ── Small utility ─────────────────────────────────────────────────────────── */
const toList = (d) => {
  const raw = Array.isArray(d) ? d : d?.result || d?.results || d;
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
};

const OBEPlanDetailLayer = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  /* ── State ── */
  const [plan,         setPlan]         = useState(null);
  const [sheet,        setSheet]        = useState(null);
  const [components,   setComponents]   = useState([]);
  const [mappings,     setMappings]     = useState([]);
  const [clos,         setClos]         = useState([]);
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [xlLoading,    setXlLoading]    = useState(false);
  const [activeTab,    setActiveTab]    = useState("components");

  /* marks: { [enrollmentId]: { [componentId]: { id|null, obtained } } } */
  const [marks,        setMarks]        = useState({});
  const [savingMarks,  setSavingMarks]  = useState(false);

  const [newComp,    setNewComp]    = useState({ component_type: "QUIZ", name: "", weight: "", order: "" });
  const [addingComp, setAddingComp] = useState(false);

  const [newMap,     setNewMap]     = useState({ clo: "", component: "", weight: "" });
  const [addingMap,  setAddingMap]  = useState(false);

  const [newStudent,    setNewStudent]    = useState({ serial_no: "", reg_no: "", student_name: "", section: "", semester_name: "" });
  const [addingStudent, setAddingStudent] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const bulkFileRef = useRef(null);

  /* ── Loaders ── */
  const reloadComponents = useCallback(() =>
    obeComponentService.getAll({ plan: id }).then((d) => setComponents(toList(d))).catch(() => {}),
  [id]);

  const reloadMappings = useCallback(() =>
    obeMappingService.getAll({ plan: id }).then((d) => setMappings(toList(d))).catch(() => {}),
  [id]);

  const reloadStudents = useCallback((courseId) => {
    const cid = courseId || plan?.course?.id || plan?.course;
    if (!cid) return;
    obeStudentService.getAll({ course: cid }).then((d) => {
      const list = toList(d);
      setStudents(list);
      // Build marks map from embedded marks
      const map = {};
      list.forEach((enr) => {
        map[enr.id] = {};
        (enr.marks || []).forEach((m) => {
          map[enr.id][m.component] = { id: m.id, obtained: String(m.obtained_marks) };
        });
      });
      setMarks(map);
    }).catch(() => {});
  }, [plan?.course?.id, plan?.course]);

  const refreshSheet = useCallback(() => {
    setSheetLoading(true);
    obePlanService.getSheet(id)
      .then((d) => {
        const raw = d?.result?.[0] || d?.result || d;
        setSheet(raw && typeof raw === "object" ? raw : null);
      })
      .catch(() => setSheet(null))
      .finally(() => setSheetLoading(false));
  }, [id]);

  useEffect(() => {
    Promise.all([
      obePlanService.getById(id),
      obePlanService.getSheet(id).catch(() => null),
      obeComponentService.getAll({ plan: id }),
      obeMappingService.getAll({ plan: id }),
    ]).then(([planData, sheetData, compsData, mapsData]) => {
      const p = planData?.result?.[0] || planData?.result || planData;
      setPlan(p);
      const sheetRaw = sheetData?.result?.[0] || sheetData?.result || sheetData;
      setSheet(sheetRaw && typeof sheetRaw === "object" ? sheetRaw : null);
      setComponents(toList(compsData));
      setMappings(toList(mapsData));

      const courseId = typeof p?.course === "object" ? p?.course?.id : (p?.course_id || p?.course);
      if (courseId) {
        cloService.getAll({ course: courseId }).then((d) => setClos(toList(d))).catch(() => {});
        obeStudentService.getAll({ course: courseId }).then((d) => {
          const list = toList(d);
          setStudents(list);
          const map = {};
          list.forEach((enr) => {
            map[enr.id] = {};
            (enr.marks || []).forEach((m) => {
              map[enr.id][m.component] = { id: m.id, obtained: String(m.obtained_marks) };
            });
          });
          setMarks(map);
        }).catch(() => {});
      }
    }).catch(() => showError("Failed to load OBE plan"))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Component actions ── */
  const addComponent = async () => {
    if (!newComp.name.trim() || !newComp.weight) { showError("Name and weight are required"); return; }
    setAddingComp(true);
    try {
      const res = await obeComponentService.create({
        plan:           parseInt(id, 10),
        component_type: newComp.component_type,
        name:           newComp.name.trim(),
        weight:         parseFloat(newComp.weight),
        order:          parseInt(newComp.order, 10) || components.length + 1,
      });
      showSuccess(res?.status?.message || "Component added");
      setNewComp({ component_type: "QUIZ", name: "", weight: "", order: "" });
      await reloadComponents();
      refreshSheet();
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setAddingComp(false);
    }
  };

  const deleteComponent = async (compId) => {
    if (!window.confirm("Delete this component? All CLO mappings for it will also be removed.")) return;
    try {
      await obeComponentService.delete(compId);
      showSuccess("Component deleted");
      await Promise.all([reloadComponents(), reloadMappings()]);
      refreshSheet();
    } catch (err) {
      showError(getApiError(err));
    }
  };

  /* ── Mapping actions ── */
  const addMapping = async () => {
    if (!newMap.clo || !newMap.component || !newMap.weight) {
      showError("CLO, component, and weight are required"); return;
    }
    setAddingMap(true);
    try {
      const res = await obeMappingService.create({
        clo:       parseInt(newMap.clo, 10),
        component: parseInt(newMap.component, 10),
        weight:    parseFloat(newMap.weight),
      });
      showSuccess(res?.status?.message || "CLO mapping added");
      setNewMap({ clo: "", component: "", weight: "" });
      await reloadMappings();
      refreshSheet();
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setAddingMap(false);
    }
  };

  const deleteMapping = async (mapId) => {
    try {
      await obeMappingService.delete(mapId);
      setMappings((prev) => prev.filter((m) => m.id !== mapId));
      showSuccess("Mapping removed");
      refreshSheet();
    } catch (err) {
      showError(getApiError(err));
    }
  };

  /* ── Student actions ── */
  const addStudent = async () => {
    if (!newStudent.reg_no.trim() || !newStudent.student_name.trim()) {
      showError("Reg No. and Student Name are required"); return;
    }
    const courseId = plan?.course?.id || plan?.course;
    setAddingStudent(true);
    try {
      const res = await obeStudentService.create({
        course:        courseId,
        serial_no:     parseInt(newStudent.serial_no, 10) || students.length + 1,
        reg_no:        newStudent.reg_no.trim(),
        student_name:  newStudent.student_name.trim(),
        section:       newStudent.section.trim(),
        semester_name: newStudent.semester_name.trim(),
      });
      showSuccess(res?.status?.message || "Student added");
      setNewStudent({ serial_no: "", reg_no: "", student_name: "", section: "", semester_name: "" });
      reloadStudents(courseId);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setAddingStudent(false);
    }
  };

  const deleteStudent = async (enrId) => {
    if (!window.confirm("Remove this student?")) return;
    try {
      await obeStudentService.delete(enrId);
      setStudents((prev) => prev.filter((s) => s.id !== enrId));
      showSuccess("Student removed");
    } catch (err) {
      showError(getApiError(err));
    }
  };

  const bulkUploadStudents = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const courseId = plan?.course?.id || plan?.course;
    setBulkUploading(true);
    try {
      const data = await file.arrayBuffer();
      const wb   = XLSX.read(data);
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      if (rows.length === 0) { showError("Excel file is empty"); return; }
      const students = rows.map((r, i) => ({
        serial_no:     parseInt(r["S.No"] ?? r["serial_no"] ?? r["sno"] ?? r["Serial No"] ?? i + 1, 10) || i + 1,
        reg_no:        String(r["Reg No"] ?? r["reg_no"] ?? r["RegNo"] ?? r["Reg.No"] ?? r["Registration No"] ?? "").trim(),
        student_name:  String(r["Student Name"] ?? r["student_name"] ?? r["Name"] ?? r["name"] ?? "").trim(),
        section:       String(r["Section"] ?? r["section"] ?? "").trim(),
        semester_name: String(r["Semester"] ?? r["semester_name"] ?? r["semester"] ?? "").trim(),
      })).filter((s) => s.reg_no || s.student_name);
      if (students.length === 0) { showError("No valid student rows found"); return; }
      const res = await obeStudentService.bulkCreate({ course: courseId, students });
      showSuccess(res?.status?.message || `${students.length} students uploaded`);
      reloadStudents(courseId);
    } catch (err) {
      showError(getApiError(err) || "Failed to parse file");
    } finally {
      setBulkUploading(false);
    }
  };

  /* ── Marks input ── */
  const handleMarkChange = (enrollmentId, componentId, value) => {
    setMarks((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...(prev[enrollmentId] || {}),
        [componentId]: {
          id: prev[enrollmentId]?.[componentId]?.id || null,
          obtained: value,
        },
      },
    }));
  };

  const saveAllMarks = async () => {
    setSavingMarks(true);
    try {
      const payload = [];
      students.forEach((enr) => {
        components.forEach((comp) => {
          const entry = marks[enr.id]?.[comp.id];
          const val   = parseFloat(entry?.obtained ?? 0) || 0;
          payload.push({ enrollment: enr.id, component: comp.id, obtained_marks: val });
        });
      });
      const res = await obeMarkService.bulkSave(payload);
      showSuccess(res?.status?.message || "All marks saved");
      // Reload students to get fresh mark IDs
      const courseId = plan?.course?.id || plan?.course;
      reloadStudents(courseId);
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setSavingMarks(false);
    }
  };

  /* ── Excel download ── */
  const downloadExcel = async () => {
    setXlLoading(true);
    try {
      const resp = await obePlanService.downloadExcel(id);
      const url  = URL.createObjectURL(new Blob([resp.data]));
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `OBE_${plan?.course_code || id}_CLO_Sheet.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showError("Failed to generate Excel");
    } finally {
      setXlLoading(false);
    }
  };

  /* ── Guards ── */
  if (loading) return (
    <div className="card p-40 text-center">
      <Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 32 }} />
      <p className="text-secondary-light mt-12">Loading OBE Plan…</p>
    </div>
  );

  if (!plan) return (
    <div className="card p-40 text-center">
      <p className="text-danger-600">OBE Plan not found.</p>
      <button className="btn btn-outline-secondary mt-16" onClick={() => navigate("/obe-plans")}>Back to Plans</button>
    </div>
  );

  const courseName = plan.course_name || plan.course?.name || `Course #${plan.course?.id || plan.course}`;
  const courseCode = plan.course_code || plan.course?.code || "";

  return (
    <div className="row gy-4">

      {/* ── Header ── */}
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="mb-4">
                OBE Plan —{" "}
                {courseCode && <span className="text-primary-600">{courseCode}</span>}{" "}
                {courseName}
              </h5>
              <span className="text-secondary-light text-sm">Plan ID: {plan.id}</span>
            </div>
            <div className="d-flex gap-8">
              <button
                className="btn btn-success-600 radius-8 d-inline-flex align-items-center gap-1"
                onClick={downloadExcel} disabled={xlLoading}
              >
                {xlLoading
                  ? <><span className="spinner-border spinner-border-sm me-4" /> Generating…</>
                  : <><Icon icon="vscode-icons:file-type-excel" className="text-xl" /> Download CLO Excel</>}
              </button>
              <button className="btn btn-outline-secondary radius-8 d-inline-flex align-items-center gap-1"
                onClick={() => navigate("/obe-plans")}>
                <Icon icon="mingcute:arrow-left-line" /> Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="col-12">
        <ul className="nav nav-tabs nav-tabs-bordered">
          {[
            { key: "components", label: "Components", icon: "solar:clipboard-list-outline" },
            { key: "mappings",   label: "CLO Mappings", icon: "solar:link-outline" },
            { key: "students",   label: `Students (${students.length})`, icon: "solar:users-group-two-rounded-outline" },
            { key: "marks",      label: "Enter Marks", icon: "solar:pen-new-square-outline" },
            { key: "sheet",      label: "OBE Sheet", icon: "solar:chart-square-outline" },
          ].map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                className={`nav-link d-inline-flex align-items-center gap-1 ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                <Icon icon={t.icon} /> {t.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Tab: Components ── */}
      {activeTab === "components" && (
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Assessment Components</h6>
              <span className="badge bg-primary-100 text-primary-600 radius-4">{components.length}</span>
            </div>
            <div className="card-body">
              <div className="row g-2 align-items-end mb-20">
                <div className="col-sm-2">
                  <label className="form-label text-sm fw-semibold mb-4">Type</label>
                  <select className="form-control radius-8" value={newComp.component_type}
                    onChange={(e) => setNewComp((p) => ({ ...p, component_type: e.target.value }))}>
                    {COMPONENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-sm-3">
                  <label className="form-label text-sm fw-semibold mb-4">Name</label>
                  <input className="form-control radius-8" placeholder="e.g. Quiz 01"
                    value={newComp.name}
                    onChange={(e) => setNewComp((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="col-sm-2">
                  <label className="form-label text-sm fw-semibold mb-4">Weight (%)</label>
                  <input type="number" min="0" step="0.01" className="form-control radius-8" placeholder="3.12"
                    value={newComp.weight}
                    onChange={(e) => setNewComp((p) => ({ ...p, weight: e.target.value }))} />
                </div>
                <div className="col-sm-1">
                  <label className="form-label text-sm fw-semibold mb-4">Order</label>
                  <input type="number" min="1" className="form-control radius-8" placeholder="1"
                    value={newComp.order}
                    onChange={(e) => setNewComp((p) => ({ ...p, order: e.target.value }))} />
                </div>
                <div className="col-sm-2">
                  <button className="btn btn-primary-600 radius-8 w-100" onClick={addComponent} disabled={addingComp}>
                    {addingComp ? <span className="spinner-border spinner-border-sm" /> : <><Icon icon="ic:round-plus" /> Add</>}
                  </button>
                </div>
              </div>

              {components.length === 0 ? (
                <p className="text-secondary-light text-sm text-center py-20">No components yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table bordered-table mb-0">
                    <thead>
                      <tr><th>Order</th><th>Type</th><th>Name</th><th>Weight (%)</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {components.map((c) => (
                        <tr key={c.id}>
                          <td className="text-secondary-light">{c.order}</td>
                          <td><span className={`badge radius-4 ${TYPE_COLORS[c.component_type] || ""}`}>{c.component_type}</span></td>
                          <td className="fw-medium">{c.name}</td>
                          <td>{c.weight}</td>
                          <td>
                            <button onClick={() => deleteComponent(c.id)}
                              className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0">
                              <Icon icon="mingcute:delete-2-line" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: CLO Mappings ── */}
      {activeTab === "mappings" && (
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">CLO → Component Mappings</h6>
              <span className="badge bg-success-focus text-success-main radius-4">{mappings.length}</span>
            </div>
            <div className="card-body">
              <div className="row g-2 align-items-end mb-20">
                <div className="col-sm-4">
                  <label className="form-label text-sm fw-semibold mb-4">CLO</label>
                  <select className="form-control radius-8" value={newMap.clo}
                    onChange={(e) => setNewMap((p) => ({ ...p, clo: e.target.value }))}>
                    <option value="">-- Select CLO --</option>
                    {clos.map((c) => (
                      <option key={c.id} value={c.id}>CLO-{c.clo_number}{c.description ? ` — ${c.description.slice(0, 50)}` : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="form-label text-sm fw-semibold mb-4">Component</label>
                  <select className="form-control radius-8" value={newMap.component}
                    onChange={(e) => setNewMap((p) => ({ ...p, component: e.target.value }))}>
                    <option value="">-- Select Component --</option>
                    {components.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.component_type})</option>)}
                  </select>
                </div>
                <div className="col-sm-2">
                  <label className="form-label text-sm fw-semibold mb-4">Weight (%)</label>
                  <input type="number" min="0" step="0.01" className="form-control radius-8" placeholder="3.12"
                    value={newMap.weight} onChange={(e) => setNewMap((p) => ({ ...p, weight: e.target.value }))} />
                </div>
                <div className="col-sm-2">
                  <button className="btn btn-success-600 radius-8 w-100" onClick={addMapping} disabled={addingMap}>
                    {addingMap ? <span className="spinner-border spinner-border-sm" /> : <><Icon icon="ic:round-plus" /> Map</>}
                  </button>
                </div>
              </div>

              {mappings.length === 0 ? (
                <p className="text-secondary-light text-sm text-center py-20">No CLO mappings yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table bordered-table mb-0">
                    <thead>
                      <tr><th>CLO</th><th>Component</th><th>Type</th><th>Weight (%)</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {mappings.map((m) => (
                        <tr key={m.id}>
                          <td><span className="badge bg-info-focus text-info-main radius-4">CLO-{m.clo_number || m.clo?.clo_number || m.clo}</span></td>
                          <td className="fw-medium">{m.component_name || m.component?.name || `#${m.component}`}</td>
                          <td><span className={`badge radius-4 ${TYPE_COLORS[m.component_type] || ""}`}>{m.component_type || "—"}</span></td>
                          <td>{m.weight}</td>
                          <td>
                            <button onClick={() => deleteMapping(m.id)}
                              className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0">
                              <Icon icon="mingcute:delete-2-line" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Students ── */}
      {activeTab === "students" && (
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Student Enrollment</h6>
              <div className="d-flex gap-8 align-items-center">
                <span className="text-secondary-light text-sm">{students.length} enrolled</span>
                <input type="file" accept=".xlsx,.xls,.csv" ref={bulkFileRef} className="d-none"
                  onChange={bulkUploadStudents} />
                <button
                  className="btn btn-outline-success radius-8 btn-sm d-inline-flex align-items-center gap-1"
                  onClick={() => bulkFileRef.current?.click()}
                  disabled={bulkUploading}
                  title="Upload Excel/CSV with columns: S.No, Reg No, Student Name, Section, Semester"
                >
                  {bulkUploading
                    ? <><span className="spinner-border spinner-border-sm me-4" /> Uploading…</>
                    : <><Icon icon="vscode-icons:file-type-excel" className="text-base" /> Bulk Upload Excel</>}
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-2 align-items-end mb-20">
                <div className="col-sm-1">
                  <label className="form-label text-sm fw-semibold mb-4">S.No</label>
                  <input type="number" className="form-control radius-8" placeholder="1"
                    value={newStudent.serial_no}
                    onChange={(e) => setNewStudent((p) => ({ ...p, serial_no: e.target.value }))} />
                </div>
                <div className="col-sm-2">
                  <label className="form-label text-sm fw-semibold mb-4">Reg No.</label>
                  <input className="form-control radius-8" placeholder="32261"
                    value={newStudent.reg_no}
                    onChange={(e) => setNewStudent((p) => ({ ...p, reg_no: e.target.value }))} />
                </div>
                <div className="col-sm-4">
                  <label className="form-label text-sm fw-semibold mb-4">Student Name</label>
                  <input className="form-control radius-8" placeholder="Full Name"
                    value={newStudent.student_name}
                    onChange={(e) => setNewStudent((p) => ({ ...p, student_name: e.target.value }))} />
                </div>
                <div className="col-sm-1">
                  <label className="form-label text-sm fw-semibold mb-4">Section</label>
                  <input className="form-control radius-8" placeholder="A"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent((p) => ({ ...p, section: e.target.value }))} />
                </div>
                <div className="col-sm-2">
                  <label className="form-label text-sm fw-semibold mb-4">Semester</label>
                  <input className="form-control radius-8" placeholder="Fall 2025"
                    value={newStudent.semester_name}
                    onChange={(e) => setNewStudent((p) => ({ ...p, semester_name: e.target.value }))} />
                </div>
                <div className="col-sm-2">
                  <button className="btn btn-primary-600 radius-8 w-100" onClick={addStudent} disabled={addingStudent}>
                    {addingStudent ? <span className="spinner-border spinner-border-sm" /> : <><Icon icon="ic:round-plus" /> Add</>}
                  </button>
                </div>
              </div>

              {students.length === 0 ? (
                <p className="text-secondary-light text-sm text-center py-20">No students enrolled yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table bordered-table mb-0">
                    <thead>
                      <tr><th>S.No</th><th>Reg No.</th><th>Student Name</th><th>Section</th><th>Semester</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id}>
                          <td>{s.serial_no}</td>
                          <td className="fw-medium">{s.reg_no}</td>
                          <td>{s.student_name}</td>
                          <td>{s.section || "—"}</td>
                          <td>{s.semester_name || "—"}</td>
                          <td>
                            <button onClick={() => deleteStudent(s.id)}
                              className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center border-0">
                              <Icon icon="mingcute:delete-2-line" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Enter Marks ── */}
      {activeTab === "marks" && (
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Enter Student Marks</h6>
              <button className="btn btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
                onClick={saveAllMarks} disabled={savingMarks}>
                {savingMarks
                  ? <><span className="spinner-border spinner-border-sm me-4" /> Saving…</>
                  : <><Icon icon="mingcute:save-2-line" /> Save All Marks</>}
              </button>
            </div>
            <div className="card-body">
              {students.length === 0 || components.length === 0 ? (
                <p className="text-secondary-light text-sm text-center py-20">
                  Add students and components first.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table bordered-table mb-0 text-sm">
                    <thead>
                      <tr>
                        <th style={{ minWidth: 50 }}>S.No</th>
                        <th style={{ minWidth: 90 }}>Reg No.</th>
                        <th style={{ minWidth: 180 }}>Student Name</th>
                        {components.map((c) => (
                          <th key={c.id} className="text-center" style={{ minWidth: 90 }}>
                            {c.name}
                            <div className="text-secondary-light fw-normal" style={{ fontSize: 11 }}>{c.weight}%</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((enr) => (
                        <tr key={enr.id}>
                          <td>{enr.serial_no}</td>
                          <td className="fw-medium">{enr.reg_no}</td>
                          <td>{enr.student_name}</td>
                          {components.map((comp) => (
                            <td key={comp.id} className="p-4">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                className="form-control form-control-sm text-center radius-6"
                                style={{ minWidth: 70 }}
                                placeholder="0"
                                value={marks[enr.id]?.[comp.id]?.obtained ?? ""}
                                onChange={(e) => handleMarkChange(enr.id, comp.id, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: OBE Sheet ── */}
      {activeTab === "sheet" && (
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">OBE Assessment Sheet</h6>
              <button className="btn btn-outline-primary radius-8 btn-sm d-inline-flex align-items-center gap-1"
                onClick={refreshSheet} disabled={sheetLoading}>
                {sheetLoading ? <span className="spinner-border spinner-border-sm" /> : <Icon icon="mingcute:refresh-3-line" />}
                Refresh
              </button>
            </div>
            <div className="card-body">
              {sheetLoading && <div className="text-center py-20"><Icon icon="svg-spinners:180-ring" className="text-primary-600" style={{ fontSize: 28 }} /></div>}

              {!sheetLoading && !sheet && (
                <p className="text-secondary-light text-sm text-center py-20">No data yet. Add components and mappings first.</p>
              )}

              {!sheetLoading && sheet && (
                <>
                  {sheet.grand_total != null && (
                    <div className="mb-16">
                      <span className={`badge radius-4 fw-semibold px-16 py-8 ${Math.abs(sheet.grand_total - 100) < 0.01 ? "bg-success-focus text-success-main" : "bg-warning-focus text-warning-main"}`}>
                        Grand Total: {sheet.grand_total}%{Math.abs(sheet.grand_total - 100) > 0.01 && "  (should total 100%)"}
                      </span>
                    </div>
                  )}
                  <div className="row g-4">
                    {sheet.left_table && (
                      <div className="col-lg-5">
                        <p className="fw-semibold text-sm mb-8 text-primary-600">Assessment Breakdown</p>
                        <div className="table-responsive">
                          <table className="table bordered-table mb-0 text-sm">
                            <thead>
                              <tr><th>Assessment</th><th className="text-center">Count</th><th className="text-center">Each (%)</th><th className="text-center">Total (%)</th></tr>
                            </thead>
                            <tbody>
                              {sheet.left_table.map((row, i) => (
                                <tr key={i}>
                                  <td><span className={`badge radius-4 me-6 ${TYPE_COLORS[row.component_type] || ""}`}>{row.component_type}</span>{row.type_label}</td>
                                  <td className="text-center">{row.instances}</td>
                                  <td className="text-center">{row.weight_per_instance}</td>
                                  <td className="text-center fw-semibold">{row.total_weight}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan="3" className="fw-bold">Total</td>
                                <td className="text-center fw-bold text-primary-600">
                                  {sheet.left_table.reduce((s, r) => s + (r.total_weight || 0), 0).toFixed(2)}%
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                    {sheet.right_table && (
                      <div className="col-lg-7">
                        <p className="fw-semibold text-sm mb-8 text-success-main">CLO-wise Distribution</p>
                        <div className="table-responsive">
                          <table className="table bordered-table mb-0 text-sm">
                            <thead>
                              <tr><th>CLO</th><th>Assessments</th><th className="text-center">Total (%)</th></tr>
                            </thead>
                            <tbody>
                              {sheet.right_table.map((row) => (
                                <tr key={row.clo_id}>
                                  <td>
                                    <span className="badge bg-info-focus text-info-main radius-4">CLO-{row.clo_number}</span>
                                    {row.clo_description && (
                                      <span className="d-block text-secondary-light mt-4" style={{ fontSize: 11, maxWidth: 180 }}>
                                        {row.clo_description.slice(0, 60)}{row.clo_description.length > 60 ? "…" : ""}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {row.assessments.length === 0
                                      ? <span className="text-secondary-light" style={{ fontSize: 12 }}>No mappings</span>
                                      : <div className="d-flex flex-wrap gap-4">
                                          {row.assessments.map((a) => (
                                            <span key={a.mapping_id} className={`badge radius-4 ${TYPE_COLORS[a.component_type] || ""}`} title={`${a.name}: ${a.weight}%`}>
                                              {a.name} ({a.weight}%)
                                            </span>
                                          ))}
                                        </div>}
                                  </td>
                                  <td className="text-center fw-semibold">{row.total_weight}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OBEPlanDetailLayer;
