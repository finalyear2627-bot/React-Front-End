import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import SemesterListLayer from "../components/SemesterListLayer";

const SemesterListPage = () => (
  <MasterLayout>
    <Breadcrumb title="Semesters" />
    <SemesterListLayer />
  </MasterLayout>
);

export default SemesterListPage;