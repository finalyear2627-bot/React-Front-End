import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CourseDocumentLayer from "../components/CourseDocumentLayer";

const CourseDocumentsPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Course Documents" />
      <CourseDocumentLayer />
    </MasterLayout>
  );
};

export default CourseDocumentsPage;
