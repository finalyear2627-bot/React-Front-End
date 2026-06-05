import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CourseViewLayer from "../components/CourseViewLayer";

const CourseViewPage = () => (
  <MasterLayout>
    <Breadcrumb title="Courses - View" />
    <CourseViewLayer />
  </MasterLayout>
);

export default CourseViewPage;