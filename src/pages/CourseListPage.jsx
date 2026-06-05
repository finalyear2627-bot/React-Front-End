import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CourseListLayer from "../components/CourseListLayer";

const CourseListPage = () => (
  <MasterLayout>
    <Breadcrumb title="Courses - List" />
    <CourseListLayer />
  </MasterLayout>
);

export default CourseListPage;