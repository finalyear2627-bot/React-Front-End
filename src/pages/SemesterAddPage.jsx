import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import SemesterAddLayer from "../components/SemesterAddLayer";

const SemesterAddPage = () => (
  <MasterLayout>
    <Breadcrumb title="Add Semester" />
    <SemesterAddLayer />
  </MasterLayout>
);

export default SemesterAddPage;