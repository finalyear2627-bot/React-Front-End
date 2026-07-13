import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import { StudentTasksLayer } from "../components/LmsLayer";
export default function StudentTasksPage() { return <MasterLayout><Breadcrumb title="My Assessments" /><StudentTasksLayer /></MasterLayout>; }
