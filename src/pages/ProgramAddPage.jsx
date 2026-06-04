import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ProgramAddLayer from "../components/ProgramAddLayer";

const ProgramAddPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Programs - Add" />
        <ProgramAddLayer />
      </MasterLayout>
    </>
  );
};

export default ProgramAddPage;
