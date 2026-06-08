import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CLOListLayer from "../components/CLOListLayer";

const CLOListPage = () => (
  <MasterLayout>
    <Breadcrumb title="CLOs" />
    <CLOListLayer />
  </MasterLayout>
);
export default CLOListPage;