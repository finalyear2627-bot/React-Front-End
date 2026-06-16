import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedPaperListLayer from "../components/GeneratedPaperListLayer";

const GeneratedTheoryPapersPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generated Theory Papers" />
    <GeneratedPaperListLayer courseType="THEORY" />
  </MasterLayout>
);

export default GeneratedTheoryPapersPage;
