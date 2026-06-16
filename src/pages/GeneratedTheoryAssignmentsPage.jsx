import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedAssignmentListLayer from "../components/GeneratedAssignmentListLayer";

const GeneratedTheoryAssignmentsPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generated Theory Assignments" />
    <GeneratedAssignmentListLayer courseType="THEORY" />
  </MasterLayout>
);

export default GeneratedTheoryAssignmentsPage;
