import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedPaperGenerateLayer from "../components/GeneratedPaperGenerateLayer";

const GenerateTheoryPaperPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Theory Paper" />
    <GeneratedPaperGenerateLayer />
  </MasterLayout>
);

export default GenerateTheoryPaperPage;
