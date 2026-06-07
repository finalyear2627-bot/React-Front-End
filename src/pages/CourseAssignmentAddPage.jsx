import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CourseAssignmentAddLayer from "../components/CourseAssignmentAddLayer";

const CourseAssignmentAddPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Course Assignments - Assign" />
        <CourseAssignmentAddLayer />
      </MasterLayout>
    </>
  );
};

export default CourseAssignmentAddPage;
