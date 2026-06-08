import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import PLOListLayer from "../components/PLOListLayer";

const PLOListPage = () => (
  <MasterLayout>
    <Breadcrumb title="PLOs" />
    <PLOListLayer />
  </MasterLayout>
);
export default PLOListPage;