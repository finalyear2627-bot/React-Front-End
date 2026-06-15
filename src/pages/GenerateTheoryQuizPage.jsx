import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedQuizGenerateLayer from "../components/GeneratedQuizGenerateLayer";

const GenerateTheoryQuizPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Theory Quiz" />
    <GeneratedQuizGenerateLayer courseType="THEORY" />
  </MasterLayout>
);

export default GenerateTheoryQuizPage;
