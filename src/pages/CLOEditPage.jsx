import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CLOEditLayer from "../components/CLOEditLayer";

const CLOEditPage = () => (
  <MasterLayout>
    <Breadcrumb title="Edit CLO" />
    <CLOEditLayer />
  </MasterLayout>
);
export default CLOEditPage;