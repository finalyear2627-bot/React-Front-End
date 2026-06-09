import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedQuizListLayer from "../components/GeneratedQuizListLayer";

const GeneratedQuizListPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generated Quizzes" />
    <GeneratedQuizListLayer />
  </MasterLayout>
);

export default GeneratedQuizListPage;