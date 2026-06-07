import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../api/user.service";
import { showSuccess, showError, getApiError } from "../utils/toast";

const ROLES = ["ADMIN", "TEACHER", "STUDENT"];

const UserEditLayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({ email: "", first_name: "", last_name: "", role: "STUDENT" });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    userService.getUserById(id)
      .then((data) => {
        const user = data?.result?.[0] ?? data?.result ?? data;
        setUsername(user.username || "");
        setFormData({
          email:      user.email      || "",
          first_name: user.first_name || "",
          last_name:  user.last_name  || "",
          role:       user.role       || "STUDENT",
        });
      })
      .catch((err) => { showError(getApiError(err)); navigate("/users"); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await userService.updateUser(id, formData);
      if (res?.status?.code !== 0) {
        showError(res?.status?.message || "Failed to update user");
        return;
      }
      showSuccess(res?.status?.message || "User updated successfully");
      navigate("/users");
    } catch (err) {
      showError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-8 col-lg-10">
            <div className="card border">
              <div className="card-header border-bottom py-16 px-24">
                <h5 className="mb-0">Edit User — <span className="text-secondary-light fw-normal">{username}</span></h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>

                  <div className="row">
                    <div className="col-6 mb-20">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        First Name <span className="text-danger-600">*</span>
                      </label>
                      <input type="text" className="form-control radius-8" name="first_name"
                        value={formData.first_name} onChange={handleChange} required />
                    </div>
                    <div className="col-6 mb-20">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Last Name <span className="text-danger-600">*</span>
                      </label>
                      <input type="text" className="form-control radius-8" name="last_name"
                        value={formData.last_name} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Email <span className="text-danger-600">*</span></label>
                    <input type="email" className="form-control radius-8" name="email"
                      value={formData.email} onChange={handleChange} required />
                  </div>

                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Role <span className="text-danger-600">*</span></label>
                    <select className="form-control radius-8" name="role" value={formData.role} onChange={handleChange} required>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="d-flex gap-3 pt-20">
                    <button type="submit" className="btn btn-primary radius-8 py-10 flex-grow-1" disabled={submitting}>
                      {submitting ? "Updating..." : "Update User"}
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

export default UserEditLayer;