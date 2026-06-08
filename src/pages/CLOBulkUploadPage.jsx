import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CLOBulkUploadLayer from "../components/CLOBulkUploadLayer";

const CLOBulkUploadPage = () => (
  <MasterLayout>
    <Breadcrumb title="Bulk Upload CLOs" />
    <CLOBulkUploadLayer />
  </MasterLayout>
);
export default CLOBulkUploadPage;