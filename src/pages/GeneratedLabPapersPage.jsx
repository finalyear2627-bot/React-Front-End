import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GeneratedPaperListLayer from "../components/GeneratedPaperListLayer";

const GeneratedLabPapersPage = () => (
  <MasterLayout>
    <Breadcrumb title="Lab Papers" />
    <GeneratedPaperListLayer courseType="LAB" />
  </MasterLayout>
);

export default GeneratedLabPapersPage;
