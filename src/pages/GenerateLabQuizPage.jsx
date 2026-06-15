import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedQuizGenerateLayer from "../components/GeneratedQuizGenerateLayer";

const GenerateLabQuizPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generate Lab Quiz" />
    <GeneratedQuizGenerateLayer courseType="LAB" />
  </MasterLayout>
);

export default GenerateLabQuizPage;
