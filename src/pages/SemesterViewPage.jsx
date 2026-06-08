import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import SemesterViewLayer from "../components/SemesterViewLayer";

const SemesterViewPage = () => (
  <MasterLayout>
    <Breadcrumb title="Semester Details" />
    <SemesterViewLayer />
  </MasterLayout>
);

export default SemesterViewPage;