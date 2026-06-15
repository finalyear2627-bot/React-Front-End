import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedAssignmentGenerateLayer from "../components/GeneratedAssignmentGenerateLayer";

const GenerateTheoryAssignmentPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Theory Assignment" />
    <GeneratedAssignmentGenerateLayer courseType="THEORY" />
  </MasterLayout>
);

export default GenerateTheoryAssignmentPage;
