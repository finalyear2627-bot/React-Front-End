import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedPaperGenerateLayer from "../components/GeneratedPaperGenerateLayer";

const GeneratedPaperGeneratePage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Assessment Paper" />
    <GeneratedPaperGenerateLayer />
  </MasterLayout>
);

export default GeneratedPaperGeneratePage;