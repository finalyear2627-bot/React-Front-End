import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import RolePermissionEditLayer from "../components/RolePermissionEditLayer";

const RolePermissionEditPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Role Permissions - Edit" />
        <RolePermissionEditLayer />
      </MasterLayout>
    </>
  );
};

export default RolePermissionEditPage;