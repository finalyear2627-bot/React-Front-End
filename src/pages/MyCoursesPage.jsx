import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import MyCourseListLayer from "../components/MyCourseListLayer";

const MyCoursesPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="My Courses" />
        <MyCourseListLayer />
      </MasterLayout>
    </>
  );
};

export default MyCoursesPage;
