import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CLOPLOGeneratorLayer from "../components/CLOPLOGeneratorLayer";

const CLOPLOGeneratorPage = () => (
  <MasterLayout>
    <Breadcrumb title="CLO-PLO Generator" />
    <CLOPLOGeneratorLayer />
  </MasterLayout>
);

export default CLOPLOGeneratorPage;