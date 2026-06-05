import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CourseBulkUploadLayer from "../components/CourseBulkUploadLayer";

const CourseBulkUploadPage = () => (
  <MasterLayout>
    <Breadcrumb title="Courses - Bulk Upload" />
    <CourseBulkUploadLayer />
  </MasterLayout>
);

export default CourseBulkUploadPage;