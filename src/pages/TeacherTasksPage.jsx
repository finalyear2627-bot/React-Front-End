import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import { TeacherTasksLayer } from "../components/LmsLayer";
export default function TeacherTasksPage() { return <MasterLayout><Breadcrumb title="Course Tasks & Submissions" /><TeacherTasksLayer /></MasterLayout>; }
