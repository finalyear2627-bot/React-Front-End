import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import PLOAddLayer from "../components/PLOAddLayer";

const PLOAddPage = () => (
  <MasterLayout>
    <Breadcrumb title="Add PLO" />
    <PLOAddLayer />
  </MasterLayout>
);
export default PLOAddPage;