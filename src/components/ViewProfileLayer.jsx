import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { authService } from "../api/auth.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const ViewProfileLayer = () => {
  const userRole = localStorage.getItem("user_role");
  const isStudent = userRole === "STUDENT";
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "password" ? "change-password" : "edit-profile"
  );

  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "", role: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  const [pwdForm, setPwdForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const username = localStorage.getItem("username") || "N/A";

  useEffect(() => {
    authService.getProfile()
      .then((data) => {
        const p = data?.result?.[0] ?? data?.result ?? data;
        const role = p.role || p.user_role || "";
        // keep localStorage in sync with what the API says
        if (role) localStorage.setItem("user_role", role);
        setProfile({
          first_name: p.first_name || "",
          last_name:  p.last_name  || "",
          email:      p.email      || "",
          role,
        });
      })
      .catch((err) => showError(getApiError(err)))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await authService.updateProfile(profile);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Failed to update profile");
        return;
      }
      showSuccess(res?.status?.message || "Profile updated successfully");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      showError("New passwords do not match");
      return;
    }
    setPwdSaving(true);
    try {
      const res = await authService.changePassword(pwdForm);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Failed to change password");
        return;
      }
      showSuccess(res?.status?.message || "Password changed successfully");
      setPwdForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setPwdSaving(false);
    }
  };

  const togglePwd = (field) =>
    setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }));

  const ROLE_BADGE = {
    ADMIN:   "bg-danger-focus text-danger-main",
    TEACHER: "bg-primary-100 text-primary-600",
    STUDENT: "bg-success-focus text-success-main",
  };

  return (
    <div className="row gy-4">
      {/* Left Panel */}
      <div className="col-lg-4">
        <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100">
          <img src="assets/images/user-grid/user-grid-bg1.png" alt="" className="w-100 object-fit-cover" />
          <div className="pb-24 ms-16 mb-24 me-16 mt--100">
            <div className="text-center border border-top-0 border-start-0 border-end-0 pb-16">
              <div
                className="border br-white border-width-2-px w-200-px h-200-px rounded-circle d-inline-flex align-items-center justify-content-center bg-primary-100 mx-auto"
                style={{ fontSize: 64 }}
              >
                <Icon icon="solar:user-bold" className="text-primary-600" />
              </div>
              <h6 className="mb-4 mt-16">
                {profileLoading ? "..." : `${profile.first_name} ${profile.last_name}`.trim() || username}
              </h6>
              <span className="text-secondary-light mb-8 d-block">
                {profileLoading ? "" : profile.email}
              </span>
              <span className={`badge radius-4 ${ROLE_BADGE[profile.role] || "bg-neutral-200 text-neutral-600"}`}>
                {profile.role || "..."}
              </span>
            </div>
            <div className="mt-24">
              <h6 className="text-xl mb-16">Account Info</h6>
              <ul>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-md fw-semibold text-primary-light">Username</span>
                  <span className="w-70 text-secondary-light fw-medium">: {username}</span>
                </li>
                <li className="d-flex align-items-center gap-1 mb-12">
                  <span className="w-30 text-md fw-semibold text-primary-light">Email</span>
                  <span className="w-70 text-secondary-light fw-medium">
                    : {profileLoading ? "..." : profile.email || "N/A"}
                  </span>
                </li>
                <li className="d-flex align-items-center gap-1">
                  <span className="w-30 text-md fw-semibold text-primary-light">Role</span>
                  <span className="w-70 text-secondary-light fw-medium">: {profile.role || "..."}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="col-lg-8">
        <div className="card h-100">
          <div className="card-body p-24">
            {/* Tabs */}
            <ul className="nav border-gradient-tab nav-pills mb-20 d-inline-flex" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link d-flex align-items-center px-24 ${activeTab === "edit-profile" ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab("edit-profile")}
                >
                  Edit Profile
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link d-flex align-items-center px-24 ${activeTab === "change-password" ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab("change-password")}
                >
                  Change Password
                </button>
              </li>
            </ul>

            {/* Edit Profile Tab */}
            {activeTab === "edit-profile" && (
              profileLoading ? (
                <div className="text-center py-40">Loading profile...</div>
              ) : (
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="mb-20">
                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                          First Name <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8"
                          name="first_name"
                          placeholder="Enter first name"
                          value={profile.first_name}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="mb-20">
                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                          Last Name <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control radius-8"
                          name="last_name"
                          placeholder="Enter last name"
                          value={profile.last_name}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="mb-20">
                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                          Email {!isStudent && <span className="text-danger-600">*</span>}
                          {isStudent && <span className="text-secondary-light text-xs ms-4">(read-only)</span>}
                        </label>
                        <input
                          type="email"
                          className={`form-control radius-8 ${isStudent ? "bg-neutral-100" : ""}`}
                          name="email"
                          placeholder="Enter email address"
                          value={profile.email}
                          onChange={isStudent ? undefined : handleProfileChange}
                          readOnly={isStudent}
                          required={!isStudent}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      type="button"
                      className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                      onClick={() => window.location.reload()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                      disabled={profileSaving}
                    >
                      {profileSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )
            )}

            {/* Change Password Tab */}
            {activeTab === "change-password" && (
              <form onSubmit={handlePwdSubmit}>
                <div className="mb-20">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Current Password <span className="text-danger-600">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPwd.current ? "text" : "password"}
                      className="form-control radius-8"
                      name="current_password"
                      placeholder="Enter current password"
                      value={pwdForm.current_password}
                      onChange={handlePwdChange}
                      required
                    />
                    <span
                      className={`toggle-password ${showPwd.current ? "ri-eye-off-line" : "ri-eye-line"} cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                      onClick={() => togglePwd("current")}
                    />
                  </div>
                </div>

                <div className="mb-20">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                    New Password <span className="text-danger-600">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPwd.new ? "text" : "password"}
                      className="form-control radius-8"
                      name="new_password"
                      placeholder="Enter new password"
                      value={pwdForm.new_password}
                      onChange={handlePwdChange}
                      required
                    />
                    <span
                      className={`toggle-password ${showPwd.new ? "ri-eye-off-line" : "ri-eye-line"} cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                      onClick={() => togglePwd("new")}
                    />
                  </div>
                </div>

                <div className="mb-20">
                  <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                    Confirm New Password <span className="text-danger-600">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPwd.confirm ? "text" : "password"}
                      className="form-control radius-8"
                      name="confirm_password"
                      placeholder="Confirm new password"
                      value={pwdForm.confirm_password}
                      onChange={handlePwdChange}
                      required
                    />
                    <span
                      className={`toggle-password ${showPwd.confirm ? "ri-eye-off-line" : "ri-eye-line"} cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                      onClick={() => togglePwd("confirm")}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                    onClick={() => setPwdForm({ current_password: "", new_password: "", confirm_password: "" })}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                    disabled={pwdSaving}
                  >
                    {pwdSaving ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfileLayer;
