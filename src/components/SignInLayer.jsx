import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../api/auth.service";
import { tokenService } from "../services/token.service";
import { showError, showSuccess } from "../utils/toast";

/* ─── Static data ─────────────────────────────────────────────────── */
const FEATURES = [
  {
    title: "AI-Powered Generation",
    desc: "Instantly create exam papers, quizzes & assignments",
  },
  {
    title: "CLO & PLO Aligned",
    desc: "Assessments mapped to course & program outcomes",
  },
  {
    title: "Role-Based Access",
    desc: "Separate dashboards for Admin, Teacher & Student",
  },
];

const STATS = [
  { value: "500+", label: "Exams Generated" },
  { value: "98%",  label: "Accuracy Rate"   },
  { value: "50+",  label: "Courses Covered" },
];

/* ─── Floating node positions (decorative AI network visual) ────────── */
const NODES = [
  { x: 18, y: 22, r: 5, delay: 0 },
  { x: 72, y: 15, r: 4, delay: 0.4 },
  { x: 55, y: 42, r: 6, delay: 0.8 },
  { x: 30, y: 58, r: 4, delay: 1.2 },
  { x: 80, y: 55, r: 5, delay: 0.6 },
  { x: 12, y: 75, r: 3, delay: 1.5 },
  { x: 62, y: 72, r: 4, delay: 1.0 },
  { x: 88, y: 28, r: 3, delay: 1.8 },
];

/* ─── Custom Input ──────────────────────────────────────────────────── */
const FormInput = ({ label, icon, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", fontSize: 13, fontWeight: 600,
        color: "#334155", marginBottom: 8, letterSpacing: 0.1,
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 15, top: "50%",
          transform: "translateY(-50%)",
          color: focused ? "#3b82f6" : "#94a3b8",
          fontSize: 19, display: "flex",
          transition: "color 0.2s",
          pointerEvents: "none",
        }}>
          <Icon icon={icon} />
        </span>
        <input
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width: "100%", height: 52,
            border: `2px solid ${focused ? "#3b82f6" : "#e8edf5"}`,
            borderRadius: 14, paddingLeft: 46,
            paddingRight: props.paddingRight || 16,
            fontSize: 14, color: "#0f172a",
            background: focused ? "#fff" : "#f8fafd",
            outline: "none",
            transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
            boxSizing: "border-box",
            boxShadow: focused ? "0 0 0 4px rgba(59,130,246,0.10)" : "none",
          }}
        />
        {props.children}
      </div>
    </div>
  );
};

/* ─── Component ─────────────────────────────────────────────────────── */
const SignInLayer = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem("session_expired")) {
      sessionStorage.removeItem("session_expired");
      showError("Your session has expired. Please sign in again.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const data = await authService.login(username, password);

      // Check if token was actually stored — this is the real success indicator
      const accessToken = tokenService.getAccessToken();
      if (!accessToken) {
        // No token stored — backend returned an error response
        const errMsg =
          data?.status?.message ||
          data?.result?.[0]?.detail ||
          "Invalid username or password";
        showError(errMsg);
        return;
      }

      setUsername(""); setPassword("");
      showSuccess(data?.status?.message || "Signed in successfully");
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        showError("Cannot connect to server. Please make sure the backend is running.");
        return;
      }
      const msg =
        err.response?.data?.status?.message ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        (err.response?.status === 401
          ? "Invalid username or password"
          : `Login failed (${err.response?.status}). Please try again.`);
      showError(msg);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        .sag-node { animation: pulse 3s ease-in-out infinite; }
        .sag-float { animation: float 4s ease-in-out infinite; }
        .sag-fadeup { animation: fadeUp 0.5s ease both; }

        .sag-feature-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 16px; border-radius: 14px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.10);
          transition: background 0.2s, border-color 0.2s;
          cursor: default;
        }
        .sag-feature-card:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
        }

        .sag-submit-btn {
          width: 100%; height: 52px;
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
          border: none; border-radius: 14px;
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.3px;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          box-shadow: 0 6px 20px rgba(59,130,246,0.42);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          position: relative; overflow: hidden;
        }
        .sag-submit-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(59,130,246,0.5);
        }
        .sag-submit-btn:not(:disabled):active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(59,130,246,0.35);
        }
        .sag-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .sag-submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s linear infinite;
        }

        .sag-forgot:hover { text-decoration: underline !important; }
        .sag-signup-link { color: #3b82f6; font-weight: 700; text-decoration: none; transition: color 0.15s; }
        .sag-signup-link:hover { color: #1d4ed8; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

        {/* ════════════════════════════════════════
            LEFT BRAND PANEL
        ════════════════════════════════════════ */}
        <div
          className="d-none d-lg-flex flex-column"
          style={{
            width: "46%", flexShrink: 0,
            background: "linear-gradient(160deg, #0c1445 0%, #0f2167 35%, #1340a8 70%, #1a55d4 100%)",
            position: "relative", overflow: "hidden",
            padding: "44px 48px",
          }}
        >
          {/* Mesh grid overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }} />

          {/* Large glow blobs */}
          <div style={{
            position: "absolute", width: 500, height: 500,
            borderRadius: "50%", top: -180, right: -160,
            background: "radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: 360, height: 360,
            borderRadius: "50%", bottom: -100, left: -80,
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* SVG node network */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25, pointerEvents: "none" }}
          >
            <line x1="18" y1="22" x2="55" y2="42" stroke="#93c5fd" strokeWidth="0.4"/>
            <line x1="55" y1="42" x2="72" y2="15" stroke="#93c5fd" strokeWidth="0.4"/>
            <line x1="55" y1="42" x2="80" y2="55" stroke="#93c5fd" strokeWidth="0.4"/>
            <line x1="55" y1="42" x2="30" y2="58" stroke="#93c5fd" strokeWidth="0.4"/>
            <line x1="30" y1="58" x2="12" y2="75" stroke="#93c5fd" strokeWidth="0.4"/>
            <line x1="80" y1="55" x2="62" y2="72" stroke="#93c5fd" strokeWidth="0.4"/>
            <line x1="72" y1="15" x2="88" y2="28" stroke="#93c5fd" strokeWidth="0.4"/>
            {NODES.map((n, i) => (
              <circle
                key={i}
                cx={n.x} cy={n.y} r={n.r}
                fill="#60a5fa"
                className="sag-node"
                style={{ animationDelay: `${n.delay}s` }}
              />
            ))}
          </svg>

          {/* ── Logo ── */}
  
          {/* ── Center hero ── */}
          <div style={{ position: "relative", zIndex: 2, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 0" }}>

            {/* AI badge */}
          

            <h1 style={{
              fontSize: 36, fontWeight: 900, color: "#fff",
              lineHeight: 1.18, letterSpacing: -0.8, marginBottom: 16,
            }}>
             Smart <br />
              <span style={{
                background: "linear-gradient(90deg, #93c5fd, #a5b4fc)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Assessment

              </span><br />
              Generator
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.65)", fontSize: 15,
              lineHeight: 1.75, marginBottom: 26, 
            }}>
              Generate CLO-aligned exam papers, quizzes, and assignments using AI — tailored to your course content.
            </p>

            {/* Feature cards */}
            <div style={{ display: "flex", flexDirection: "unset", gap: 10 }}>
              {FEATURES.map(({ title, desc }, i) => (
                <div
                  key={title}
                  className="sag-feature-card sag-fadeup"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.48)", lineHeight: 1.5 }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Footer */}
          <div style={{ position: "relative", zIndex: 2, marginTop: 10 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 0 }}>
              © 2026 Smart Assessment Generator · All rights reserved
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT FORM PANEL
        ════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(160deg, #f0f6ff 0%, #f8fafc 50%, #eef4ff 100%)",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center",
            padding: "40px 24px",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Subtle background blobs */}
          <div style={{
            position: "absolute", width: 320, height: 320, borderRadius: "50%",
            top: -100, right: -80, pointerEvents: "none",
            background: "radial-gradient(circle, rgba(219,234,254,0.8) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", width: 240, height: 240, borderRadius: "50%",
            bottom: -60, left: -60, pointerEvents: "none",
            background: "radial-gradient(circle, rgba(224,231,255,0.7) 0%, transparent 70%)",
          }} />

          {/* Mobile brand header */}
          <div className="d-flex d-lg-none align-items-center gap-12 mb-36" style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 18px rgba(59,130,246,0.4)",
            }}>
              <Icon icon="solar:graduation-cap-bold-duotone" style={{ fontSize: 25, color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Smart Assessment</div>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase" }}>Generator</div>
            </div>
          </div>

          {/* Form wrapper */}
          <div style={{ width: "100%", maxWidth: 430, position: "relative", zIndex: 1 }}>

            {/* Greeting */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "linear-gradient(135deg, #dbeafe, #ede9fe)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon icon="solar:hand-stars-bold-duotone" style={{ fontSize: 19, color: "#3b82f6" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>Welcome back!</span>
              </div>
              <h2 className="loginDet" >
                Sign in to your account
              </h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 0, lineHeight: 1.6 }}>
                Access your dashboard, generate papers, and manage assessments.
              </p>
            </div>

            {/* Card */}
            <div style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: "36px 32px 28px",
              boxShadow: "0 8px 40px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.05)",
              border: "1px solid rgba(226,232,240,0.8)",
            }}>

              <form onSubmit={handleSubmit} noValidate>

                {/* Username */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: "block", fontSize: 13, fontWeight: 700,
                    color: "#1e293b", marginBottom: 8, letterSpacing: 0.1,
                  }}>
                    Username or Email
                  </label>
                  <FieldInput
                    type="text"
                    icon="solar:user-rounded-outline"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: 6 }}>
                  <label style={{
                    display: "block", fontSize: 13, fontWeight: 700,
                    color: "#1e293b", marginBottom: 8, letterSpacing: 0.1,
                  }}>
                    Password
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    showPwd={showPwd}
                    onToggle={() => setShowPwd((v) => !v)}
                  />
                </div>

                {/* Remember + Forgot */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", margin: "18px 0 26px",
                }}>
                  
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="sag-submit-btn">
                  {loading ? (
                    <>
                      <span style={{
                        width: 18, height: 18,
                        border: "2.5px solid rgba(255,255,255,0.35)",
                        borderTopColor: "#fff", borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block", flexShrink: 0,
                      }} />
                      Signing you in…
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:login-2-bold" style={{ fontSize: 19 }} />
                      Sign In
                    </>
                  )}
                </button>

              </form>
            </div>
            {/* Security note */}
            
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Field sub-components ─────────────────────────────────────────── */
const FieldInput = ({ icon, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 15, top: "50%",
        transform: "translateY(-50%)",
        color: focused ? "#3b82f6" : "#94a3b8",
        fontSize: 19, display: "flex",
        transition: "color 0.2s", pointerEvents: "none",
      }}>
        <Icon icon={icon} />
      </span>
      <input
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={()  => setFocused(false)}
        style={{
          width: "100%", height: 52,
          border: `2px solid ${focused ? "#3b82f6" : "#e8edf5"}`,
          borderRadius: 14, paddingLeft: 48, paddingRight: 16,
          fontSize: 14, color: "#0f172a",
          background: focused ? "#fff" : "#f8fafd",
          outline: "none",
          transition: "all 0.2s",
          boxSizing: "border-box",
          boxShadow: focused ? "0 0 0 4px rgba(59,130,246,0.10)" : "none",
        }}
      />
    </div>
  );
};

const PasswordInput = ({ value, onChange, showPwd, onToggle }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 15, top: "50%",
        transform: "translateY(-50%)",
        color: focused ? "#3b82f6" : "#94a3b8",
        fontSize: 19, display: "flex",
        transition: "color 0.2s", pointerEvents: "none",
      }}>
        <Icon icon="solar:lock-password-outline" />
      </span>
      <input
        type={showPwd ? "text" : "password"}
        placeholder="Enter your password"
        value={value}
        onChange={onChange}
        required
        autoComplete="current-password"
        onFocus={() => setFocused(true)}
        onBlur={()  => setFocused(false)}
        style={{
          width: "100%", height: 52,
          border: `2px solid ${focused ? "#3b82f6" : "#e8edf5"}`,
          borderRadius: 14, paddingLeft: 48, paddingRight: 52,
          fontSize: 14, color: "#0f172a",
          background: focused ? "#fff" : "#f8fafd",
          outline: "none",
          transition: "all 0.2s",
          boxSizing: "border-box",
          boxShadow: focused ? "0 0 0 4px rgba(59,130,246,0.10)" : "none",
        }}
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        style={{
          position: "absolute", right: 14, top: "50%",
          transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: "#94a3b8", fontSize: 20, padding: 4,
          display: "flex", alignItems: "center",
          borderRadius: 8, transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#3b82f6")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
      >
        <Icon icon={showPwd ? "solar:eye-closed-outline" : "solar:eye-outline"} />
      </button>
    </div>
  );
};

export default SignInLayer;
