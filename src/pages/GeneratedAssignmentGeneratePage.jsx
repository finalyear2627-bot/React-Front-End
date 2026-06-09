import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedAssignmentGenerateLayer from "../components/GeneratedAssignmentGenerateLayer";

const GeneratedAssignmentGeneratePage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Assignment" />
    <GeneratedAssignmentGenerateLayer />
  </MasterLayout>
);

export default GeneratedAssignmentGeneratePage;