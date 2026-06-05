import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { tokenService } from "../services/token.service";
import { showError, showSuccess } from "../utils/toast";

const SignInLayer = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("session_expired")) {
      sessionStorage.removeItem("session_expired");
      showError("Your session has expired. Please sign in again.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login/", {
        username,
        password,
      });

      // Save tokens and role from response
      tokenService.setTokens(response.data.access, response.data.refresh);
      localStorage.setItem("user_role", response.data.role || "STUDENT");
      localStorage.setItem("user_id", response.data.user_id || "");
      localStorage.setItem("username", username);

      // Clear form
      setUsername("");
      setPassword("");

      showSuccess("Signed in successfully");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.detail) {
        showError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        showError(err.response.data.non_field_errors[0]);
      } else if (err.response?.status === 401) {
        showError("Invalid username or password");
      } else {
        showError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth bg-base">
      <div className="auth-center py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100">
          <div>
            <h4 className="mb-12">Sign In to your Account</h4>
            <p className="mb-32 text-secondary-light text-lg">
              Welcome back! please enter your detail
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                type="text"
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Email or Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="position-relative mb-20">
              <div className="icon-field">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  type="password"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* REMEMBER / FORGOT */}
            <div className="d-flex justify-content-between gap-2">
              <div className="form-check style-check d-flex align-items-center">
                <input
                  className="form-check-input border border-neutral-300"
                  type="checkbox"
                  id="remember"
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-primary-600 fw-medium">
                Forgot Password?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="mt-32 text-center text-sm">
              <p className="mb-0">
                Don’t have an account?{" "}
                <Link to="/sign-up" className="text-primary-600 fw-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
