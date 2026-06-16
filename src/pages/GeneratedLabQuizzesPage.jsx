import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedQuizListLayer from "../components/GeneratedQuizListLayer";

const GeneratedLabQuizzesPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generated Lab Quizzes" />
    <GeneratedQuizListLayer courseType="LAB" />
  </MasterLayout>
);

export default GeneratedLabQuizzesPage;
