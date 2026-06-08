import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedPaperListLayer from "../components/GeneratedPaperListLayer";

const GeneratedPaperListPage = () => (
  <MasterLayout>
    <Breadcrumb title="Generated Papers" />
    <GeneratedPaperListLayer />
  </MasterLayout>
);

export default GeneratedPaperListPage;