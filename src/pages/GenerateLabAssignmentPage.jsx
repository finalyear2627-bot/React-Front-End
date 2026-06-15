import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedAssignmentGenerateLayer from "../components/GeneratedAssignmentGenerateLayer";

const GenerateLabAssignmentPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Lab Assignment" />
    <GeneratedAssignmentGenerateLayer courseType="LAB" />
  </MasterLayout>
);

export default GenerateLabAssignmentPage;
