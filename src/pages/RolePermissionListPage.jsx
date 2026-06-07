import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import RolePermissionListLayer from "../components/RolePermissionListLayer";

const RolePermissionListPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Role Permissions - List" />
        <RolePermissionListLayer />
      </MasterLayout>
    </>
  );
};

export default RolePermissionListPage;