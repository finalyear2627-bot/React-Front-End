import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedQuizGenerateLayer from "../components/GeneratedQuizGenerateLayer";

const GeneratedQuizGeneratePage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Quiz" />
    <GeneratedQuizGenerateLayer />
  </MasterLayout>
);

export default GeneratedQuizGeneratePage;