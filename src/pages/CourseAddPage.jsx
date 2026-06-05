import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CourseAddLayer from "../components/CourseAddLayer";

const CourseAddPage = () => (
  <MasterLayout>
    <Breadcrumb title="Courses - Add" />
    <CourseAddLayer />
  </MasterLayout>
);

export default CourseAddPage;