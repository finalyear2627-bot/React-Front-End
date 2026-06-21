import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import OBEPlanDetailLayer from "../components/OBEPlanDetailLayer";

const OBEPlanDetailPage = () => (
  <MasterLayout>
    <Breadcrumb title="OBE Plan Detail" />
    <OBEPlanDetailLayer />
  </MasterLayout>
);
export default OBEPlanDetailPage;
