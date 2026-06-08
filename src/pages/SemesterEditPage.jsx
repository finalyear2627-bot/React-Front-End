import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import SemesterEditLayer from "../components/SemesterEditLayer";

const SemesterEditPage = () => (
  <MasterLayout>
    <Breadcrumb title="Edit Semester" />
    <SemesterEditLayer />
  </MasterLayout>
);

export default SemesterEditPage;