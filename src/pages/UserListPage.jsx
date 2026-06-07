import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import UserListLayer from "../components/UserListLayer";

const UserListPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Users - List" />
        <UserListLayer />
      </MasterLayout>
    </>
  );
};

export default UserListPage;