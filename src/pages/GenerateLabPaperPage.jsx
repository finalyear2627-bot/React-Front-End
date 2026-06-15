import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratePaperLabLayer from "../components/GeneratePaperLabLayer";

const GenerateLabPaperPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Lab Paper" />
    <GeneratePaperLabLayer />
  </MasterLayout>
);

export default GenerateLabPaperPage;
