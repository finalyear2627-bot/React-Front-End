import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedAssignmentListLayer from "../components/GeneratedAssignmentListLayer";

const GeneratedAssignmentListPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generated Assignments" />
    <GeneratedAssignmentListLayer />
  </MasterLayout>
);

export default GeneratedAssignmentListPage;