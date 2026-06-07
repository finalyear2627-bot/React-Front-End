import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CourseAssignmentListLayer from "../components/CourseAssignmentListLayer";

const CourseAssignmentListPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Course Assignments - List" />
        <CourseAssignmentListLayer />
      </MasterLayout>
    </>
  );
};

export default CourseAssignmentListPage;
