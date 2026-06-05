import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const SignUpLayer = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("STUDENT");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("All fields are required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      let endpoint;
      if (role === "TEACHER") {
        endpoint = "/accounts/auth/register/teacher/";
      } else if (role === "ADMIN") {
        endpoint = "/accounts/auth/register/admin/";
      } else {
        endpoint = "/accounts/auth/register/student/";
      }

      const registerResponse = await axiosInstance.post(endpoint, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // After registration, login automatically
      const loginEndpoint = role === "ADMIN"
        ? "/auth/login/admin/"
        : role === "TEACHER"
        ? "/auth/login/teacher/"
        : "/auth/login/";

      const loginResponse = await axiosInstance.post(loginEndpoint, {
        username: formData.username,
        password: formData.password,
      });

      // Save tokens and role
      localStorage.setItem("access_token", loginResponse.data.access);
      localStorage.setItem("refresh_token", loginResponse.data.refresh);
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_id", loginResponse.data.user_id || "");
      localStorage.setItem("username", formData.username);

      navigate("/dashboard");
    } catch (err) {
      console.error("SIGNUP ERROR:", err.response?.data);
      const errorMessage = err.response?.data?.username?.[0] ||
                          err.response?.data?.email?.[0] ||
                          err.response?.data?.password?.[0] ||
                          "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='' />
        </div>
      </div>
      <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <Link to='/' className='mb-40 max-w-290-px'>
              <img src='assets/images/logo.png' alt='' />
            </Link>
            <h4 className='mb-12'>Create Account</h4>
            <p className='mb-32 text-secondary-light text-lg'>
              Join us and get started!
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            {/* ERROR MESSAGE */}
            {error && (
              <div className="alert alert-danger mb-16">
                {error}
              </div>
            )}

            {/* ROLE SELECTION */}
            <div className='mb-20'>
              <label className='form-label mb-8 text-sm fw-medium'>I am a</label>
              <div className='d-flex gap-3 flex-wrap'>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='radio'
                    name='role'
                    id='roleStudent'
                    value='STUDENT'
                    checked={role === 'STUDENT'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label className='form-check-label' htmlFor='roleStudent'>
                    Student
                  </label>
                </div>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='radio'
                    name='role'
                    id='roleTeacher'
                    value='TEACHER'
                    checked={role === 'TEACHER'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label className='form-check-label' htmlFor='roleTeacher'>
                    Teacher
                  </label>
                </div>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='radio'
                    name='role'
                    id='roleAdmin'
                    value='ADMIN'
                    checked={role === 'ADMIN'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label className='form-check-label' htmlFor='roleAdmin'>
                    Admin
                  </label>
                </div>
              </div>
            </div>

            {/* FIRST NAME */}
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='f7:person' />
              </span>
              <input
                type='text'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='First Name'
                name='firstName'
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* LAST NAME */}
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='f7:person' />
              </span>
              <input
                type='text'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Last Name'
                name='lastName'
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* USERNAME */}
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='f7:person' />
              </span>
              <input
                type='text'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Username'
                name='username'
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* EMAIL */}
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                type='email'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className='mb-20'>
              <div className='position-relative'>
                <div className='icon-field'>
                  <span className='icon top-50 translate-middle-y'>
                    <Icon icon='solar:lock-password-outline' />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className='form-control h-56-px bg-neutral-50 radius-12'
                    id='your-password'
                    placeholder='Password'
                    name='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <span
                  className='toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light'
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
              <span className='mt-12 text-sm text-secondary-light'>
                Your password must have at least 8 characters
              </span>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className='mb-20'>
              <div className='position-relative'>
                <div className='icon-field'>
                  <span className='icon top-50 translate-middle-y'>
                    <Icon icon='solar:lock-password-outline' />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className='form-control h-56-px bg-neutral-50 radius-12'
                    placeholder='Confirm Password'
                    name='passwordConfirm'
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* TERMS & CONDITIONS */}
            <div className=''>
              <div className='d-flex justify-content-between gap-2'>
                <div className='form-check style-check d-flex align-items-start'>
                  <input
                    className='form-check-input border border-neutral-300 mt-4'
                    type='checkbox'
                    id='condition'
                    required
                  />
                  <label
                    className='form-check-label text-sm'
                    htmlFor='condition'
                  >
                    By creating an account means you agree to the
                    <Link to='#' className='text-primary-600 fw-semibold'>
                      {" "}Terms &amp; Conditions
                    </Link>{" "}
                    and our
                    <Link to='#' className='text-primary-600 fw-semibold'>
                      {" "}Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
            </div>

            {/* SIGN UP BUTTON */}
            <button
              type='submit'
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            {/* SIGN IN LINK */}
            <div className='mt-32 text-center text-sm'>
              <p className='mb-0'>
                Already have an account?{" "}
                <Link to='/sign-in' className='text-primary-600 fw-semibold'>
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUpLayer;
