import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import { StudentCoursesLayer } from "../components/LmsLayer";
export default function StudentCoursesPage() { return <MasterLayout><Breadcrumb title="My Enrolled Courses" /><StudentCoursesLayer /></MasterLayout>; }
