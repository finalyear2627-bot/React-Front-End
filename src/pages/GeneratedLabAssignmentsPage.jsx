import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedAssignmentListLayer from "../components/GeneratedAssignmentListLayer";

const GeneratedLabAssignmentsPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generated Lab Assignments" />
    <GeneratedAssignmentListLayer courseType="LAB" />
  </MasterLayout>
);

export default GeneratedLabAssignmentsPage;
