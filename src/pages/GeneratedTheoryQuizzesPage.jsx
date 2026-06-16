import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedQuizListLayer from "../components/GeneratedQuizListLayer";

const GeneratedTheoryQuizzesPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generated Theory Quizzes" />
    <GeneratedQuizListLayer courseType="THEORY" />
  </MasterLayout>
);

export default GeneratedTheoryQuizzesPage;
