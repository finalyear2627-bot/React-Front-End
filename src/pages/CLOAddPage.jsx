import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CLOAddLayer from "../components/CLOAddLayer";

const CLOAddPage = () => (
  <MasterLayout>
    <Breadcrumb title="Add CLO" />
    <CLOAddLayer />
  </MasterLayout>
);
export default CLOAddPage;