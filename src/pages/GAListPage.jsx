import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GAListLayer from "../components/GAListLayer";

const GAListPage = () => (
  <MasterLayout>
    <Breadcrumb title="Graduate Attributes" />
    <GAListLayer />
  </MasterLayout>
);
export default GAListPage;
