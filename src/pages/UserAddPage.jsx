import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import UserAddLayer from "../components/UserAddLayer";

const UserAddPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Users - Add" />
        <UserAddLayer />
      </MasterLayout>
    </>
  );
};

export default UserAddPage;