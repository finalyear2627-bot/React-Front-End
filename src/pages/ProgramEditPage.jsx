import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ProgramEditLayer from "../components/ProgramEditLayer";

const ProgramEditPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Programs - Edit" />
        <ProgramEditLayer />
      </MasterLayout>
    </>
  );
};

export default ProgramEditPage;
