import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CLOPLOStatementLayer from "../components/CLOPLOStatementLayer";

const CLOPLOStatementPage = () => (
  <MasterLayout>
    <Breadcrumb title="CLO-PLO Statement" />
    <CLOPLOStatementLayer />
  </MasterLayout>
);
export default CLOPLOStatementPage;