import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ProgramListLayer from "../components/ProgramListLayer";

const ProgramListPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Programs - List" />
        <ProgramListLayer />
      </MasterLayout>
    </>
  );
};

export default ProgramListPage;
