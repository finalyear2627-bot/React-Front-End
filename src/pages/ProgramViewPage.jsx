import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ProgramViewLayer from "../components/ProgramViewLayer";

const ProgramViewPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Programs - View" />
        <ProgramViewLayer />
      </MasterLayout>
    </>
  );
};

export default ProgramViewPage;
