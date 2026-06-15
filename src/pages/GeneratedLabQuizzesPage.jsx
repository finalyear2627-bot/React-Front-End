import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedQuizListLayer from "../components/GeneratedQuizListLayer";

const GeneratedLabQuizzesPage = () => (
  <MasterLayout>
    <Breadcrumb title="Lab Quizzes" />
    <GeneratedQuizListLayer courseType="LAB" />
  </MasterLayout>
);

export default GeneratedLabQuizzesPage;
