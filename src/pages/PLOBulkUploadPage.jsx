import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import PLOBulkUploadLayer from "../components/PLOBulkUploadLayer";

const PLOBulkUploadPage = () => (
  <MasterLayout>
    <Breadcrumb title="Bulk Upload PLOs" />
    <PLOBulkUploadLayer />
  </MasterLayout>
);
export default PLOBulkUploadPage;