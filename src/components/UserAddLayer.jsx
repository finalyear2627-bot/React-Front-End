import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../api/user.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const ROLES = ["ADMIN", "TEACHER", "STUDENT"];

const UserAddLayer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", email: "", first_name: "", last_name: "",
    role: "STUDENT", password: "", confirm_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      showError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await userService.createUser(formData);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Failed to create user");
        return;
      }
      showSuccess(res?.status?.message || "User created successfully");
      navigate("/users");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Add New User</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  <div className="row">
                    <div className="col-6 mb-20">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        First Name <span className="text-danger-600">*</span>
                      </label>
                      <input type="text" className="form-control radius-8" name="first_name"
                        placeholder="John" value={formData.first_name} onChange={handleChange} required />
                    </div>
                    <div className="col-6 mb-20">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Last Name <span className="text-danger-600">*</span>
                      </label>
                      <input type="text" className="form-control radius-8" name="last_name"
                        placeholder="Doe" value={formData.last_name} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Username <span className="text-danger-600">*</span>
                    </label>
                    <input type="text" className="form-control radius-8" name="username"
                      placeholder="john_doe" value={formData.username} onChange={handleChange} required />
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Email <span className="text-danger-600">*</span>
                    </label>
                    <input type="email" className="form-control radius-8" name="email"
                      placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Role <span className="text-danger-600">*</span>
                    </label>
                    <select className="form-control radius-8" name="role" value={formData.role} onChange={handleChange} required>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-6 mb-20">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Password <span className="text-danger-600">*</span>
                      </label>
                      <input type="password" className="form-control radius-8" name="password"
                        placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="col-6 mb-20">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Confirm Password <span className="text-danger-600">*</span>
                      </label>
                      <input type="password" className="form-control radius-8" name="confirm_password"
                        placeholder="••••••••" value={formData.confirm_password} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button type="submit" className="btn btn-primary radius-8 py-10 flex-grow-1" disabled={loading}>
                      {loading ? "Creating..." : "Create User"}
                    </button>
                    <button type="button" onClick={() => navigate("/users")} className="btn btn-outline-secondary radius-8 py-10 flex-grow-1">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAddLayer;