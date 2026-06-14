import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GAAddLayer from "../components/GAAddLayer";

const GAAddPage = () => (
  <MasterLayout>
    <Breadcrumb title="Add Graduate Attribute" />
    <GAAddLayer />
  </MasterLayout>
);
export default GAAddPage;
