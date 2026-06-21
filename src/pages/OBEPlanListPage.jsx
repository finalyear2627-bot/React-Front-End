import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import OBEPlanListLayer from "../components/OBEPlanListLayer";

const OBEPlanListPage = () => (
  <MasterLayout>
    <Breadcrumb title="OBE Assessment Plans" />
    <OBEPlanListLayer />
  </MasterLayout>
);
export default OBEPlanListPage;
