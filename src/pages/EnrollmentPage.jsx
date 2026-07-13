import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import { EnrollmentLayer } from "../components/LmsLayer";
export default function EnrollmentPage() { return <MasterLayout><Breadcrumb title="Student Enrollments" /><EnrollmentLayer /></MasterLayout>; }
