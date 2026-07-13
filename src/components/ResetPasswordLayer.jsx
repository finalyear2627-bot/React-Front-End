import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../api/auth.service";
import { getApiError, showError, showSuccess } from "../utils/toast";
import AuthBrandPanel from "./AuthBrandPanel";

const INVALID_LINK_MESSAGE = "This password reset link is invalid or has expired.";

const ResetPasswordLayer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [form, setForm] = useState({ new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [invalidLink, setInvalidLink] = useState(!uid || !token);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.new_password !== form.confirm_password) {
      showError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await authService.resetPassword({ uid, token, ...form });
      if (response?.status?.code !== undefined && response.status.code !== 0) {
        setInvalidLink(true);
        return;
      }
      showSuccess("Your password has been reset. Please sign in.");
      navigate("/sign-in", { replace: true });
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        setInvalidLink(true);
      } else {
        showError(getApiError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <AuthBrandPanel />
      <main style={{ flex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "linear-gradient(160deg, #f0f6ff 0%, #f8fafc 50%, #eef4ff 100%)" }}>
        <div style={{ width: "100%", maxWidth: 430 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #dbeafe, #ede9fe)", display: "grid", placeItems: "center" }}><Icon icon="solar:lock-password-outline" style={{ fontSize: 19, color: "#3b82f6" }} /></span><span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>Password recovery</span></div>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", lineHeight: 1.2, margin: "0 0 12px" }}>Reset Password</h2>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0, lineHeight: 1.6 }}>Choose a new password for your account.</p>
          </div>
          <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px 28px", boxShadow: "0 8px 40px rgba(15,23,42,0.10)", border: "1px solid rgba(226,232,240,0.8)" }}>
            {invalidLink ? <div className="alert alert-danger radius-12 mb-0">{INVALID_LINK_MESSAGE}</div> : <form onSubmit={handleSubmit}>
              <div className="mb-20"><label className="form-label fw-semibold">New Password</label><div className="icon-field"><span className="icon top-50 translate-middle-y"><Icon icon="solar:lock-password-outline" /></span><input type="password" className="form-control h-56-px bg-neutral-50 radius-12" value={form.new_password} onChange={(e) => setForm((current) => ({ ...current, new_password: e.target.value }))} required autoComplete="new-password" /></div></div>
              <div className="mb-20"><label className="form-label fw-semibold">Confirm Password</label><div className="icon-field"><span className="icon top-50 translate-middle-y"><Icon icon="solar:lock-password-outline" /></span><input type="password" className="form-control h-56-px bg-neutral-50 radius-12" value={form.confirm_password} onChange={(e) => setForm((current) => ({ ...current, confirm_password: e.target.value }))} required autoComplete="new-password" /></div></div>
              <button type="submit" className="btn btn-primary text-sm px-12 py-16 w-100 radius-12" disabled={loading}>{loading ? "Resetting…" : "Reset Password"}</button>
            </form>}
            <div className="text-center mt-24"><Link to="/sign-in" className="text-primary-600 fw-bold">Back to Sign In</Link></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordLayer;
