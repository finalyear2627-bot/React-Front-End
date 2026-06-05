import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CourseEditLayer from "../components/CourseEditLayer";

const CourseEditPage = () => (
  <MasterLayout>
    <Breadcrumb title="Courses - Edit" />
    <CourseEditLayer />
  </MasterLayout>
);

export default CourseEditPage;