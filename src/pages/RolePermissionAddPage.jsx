import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import RolePermissionAddLayer from "../components/RolePermissionAddLayer";

const RolePermissionAddPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Role Permissions - Add" />
        <RolePermissionAddLayer />
      </MasterLayout>
    </>
  );
};

export default RolePermissionAddPage;