import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GAEditLayer from "../components/GAEditLayer";

const GAEditPage = () => (
  <MasterLayout>
    <Breadcrumb title="Edit Graduate Attribute" />
    <GAEditLayer />
  </MasterLayout>
);
export default GAEditPage;
