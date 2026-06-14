import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import GABulkUploadLayer from "../components/GABulkUploadLayer";

const GABulkUploadPage = () => (
  <MasterLayout>
    <Breadcrumb title="Bulk Upload GAs" />
    <GABulkUploadLayer />
  </MasterLayout>
);
export default GABulkUploadPage;
