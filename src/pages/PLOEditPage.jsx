import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import PLOEditLayer from "../components/PLOEditLayer";

const PLOEditPage = () => (
  <MasterLayout>
    <Breadcrumb title="Edit PLO" />
    <PLOEditLayer />
  </MasterLayout>
);
export default PLOEditPage;