import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ProgramBulkUploadLayer from "../components/ProgramBulkUploadLayer";

const ProgramBulkUploadPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Programs - Bulk Upload" />
        <ProgramBulkUploadLayer />
      </MasterLayout>
    </>
  );
};

export default ProgramBulkUploadPage;