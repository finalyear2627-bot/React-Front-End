import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../api/auth.service";
import { getApiError, showError, showSuccess } from "../utils/toast";
import AuthBrandPanel from "./AuthBrandPanel";

const SUCCESS_MESSAGE = "If an account matches this email, a password reset link has been sent.";

const ForgotPasswordLayer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      showSuccess(SUCCESS_MESSAGE);
    } catch (error) {
      showError(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-page">
      <style>{`
        .recovery-page { min-height: 100vh; display: flex; font-family: Inter, Segoe UI, sans-serif; background: #f8fbff; }
        .recovery-content { flex: 1; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px; background: linear-gradient(130deg,#fff 0%,#f0f6ff 100%); }
        .recovery-form { width: 100%; max-width: 430px; }.recovery-kicker { display: flex; gap: 10px; align-items: center; color: #5069ff; font-weight: 700; font-size: 13px; margin-bottom: 16px; }.recovery-kicker i { font-style: normal; width: 36px; height: 36px; display: grid; place-items: center; background: #e6edff; border-radius: 10px; }
        .recovery-form h2 { color: #071b4c; font-size: 39px; line-height: 1.15; letter-spacing: -1px; margin-bottom: 12px; font-weight: 800; }.recovery-form > p { color: #60708c; line-height: 1.55; margin-bottom: 30px; }
        .recovery-card { background: #fff; border-radius: 24px; padding: 32px; box-shadow: 0 15px 35px rgba(16,44,100,.12); }.recovery-card label { color: #071b4c; font-size: 13px; font-weight: 700; margin-bottom: 10px; display: block; }.recovery-input { height: 52px; border: 0; border-radius: 13px; background: #eaf1ff; width: 100%; padding: 0 16px 0 45px; outline: none; }.recovery-input:focus { box-shadow: 0 0 0 3px rgba(56,105,255,.2); }.recovery-input-wrap { position: relative; }.recovery-input-wrap svg { position: absolute; top: 17px; left: 15px; color: #8296b9; font-size: 19px; }.recovery-submit { width: 100%; height: 52px; margin-top: 26px; border: 0; border-radius: 13px; background: linear-gradient(100deg,#1d65ed,#4a88fb); color: #fff; font-size: 15px; font-weight: 700; box-shadow: 0 7px 15px rgba(29,101,237,.25); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1; }.recovery-submit:disabled { opacity: .7; }.recovery-back { margin-top: 22px; display: block; text-align: center; font-weight: 700; font-size: 14px; color: #1760ed; text-decoration: none; }.recovery-message { margin: 0; line-height: 1.5; }
        @media (max-width: 900px) { .recovery-content { width: 100%; padding: 28px 20px; }.recovery-form h2 { font-size: 34px; } }
      `}</style>
      <AuthBrandPanel />
      <main className="recovery-content">
        <div className="recovery-form">
          <div className="recovery-kicker"><i><Icon icon="solar:lock-password-outline" /></i>Password recovery</div>
          <h2>Forgot your password?</h2>
          <p>Enter your email address and we will send you a link to reset your password.</p>
          <div className="recovery-card">
            {success ? <div className="alert alert-success recovery-message" role="status">{SUCCESS_MESSAGE}</div> : <form onSubmit={handleSubmit}>
              <label htmlFor="forgot-email">Email address</label>
              <div className="recovery-input-wrap"><Icon icon="mage:email" /><input id="forgot-email" type="email" className="recovery-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
              <button type="submit" className="recovery-submit" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
            </form>}
            <Link to="/sign-in" className="recovery-back">Back to Sign In</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordLayer;
