import React from "react";

const FEATURES = [
  { title: "AI-Powered Generation", desc: "Instantly create exam papers, quizzes & assignments" },
  { title: "CLO & PLO Aligned", desc: "Assessments mapped to course & program outcomes" },
  { title: "Role-Based Access", desc: "Separate dashboards for Admin, Teacher & Student" },
];

const NODES = [
  { x: 18, y: 22, r: 5, delay: 0 }, { x: 72, y: 15, r: 4, delay: 0.4 },
  { x: 55, y: 42, r: 6, delay: 0.8 }, { x: 30, y: 58, r: 4, delay: 1.2 },
  { x: 80, y: 55, r: 5, delay: 0.6 }, { x: 12, y: 75, r: 3, delay: 1.5 },
  { x: 62, y: 72, r: 4, delay: 1.0 }, { x: 88, y: 28, r: 3, delay: 1.8 },
];

const AuthBrandPanel = () => (
  <div className="d-none d-lg-flex flex-column" style={{ width: "46%", flexShrink: 0, background: "linear-gradient(160deg, #0c1445 0%, #0f2167 35%, #1340a8 70%, #1a55d4 100%)", position: "relative", overflow: "hidden", padding: "44px 48px" }}>
    <style>{`
      @keyframes sagPanelPulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
      @keyframes sagPanelFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      .sag-panel-node { animation: sagPanelPulse 3s ease-in-out infinite; }
      .sag-panel-feature { display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);transition:background .2s,border-color .2s;cursor:default;animation:sagPanelFadeUp .5s ease both; }
      .sag-panel-feature:hover { background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2); }
    `}</style>
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
    <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: -180, right: -160, background: "radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", bottom: -100, left: -80, background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)", pointerEvents: "none" }} />
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25, pointerEvents: "none" }}>
      <line x1="18" y1="22" x2="55" y2="42" stroke="#93c5fd" strokeWidth="0.4"/><line x1="55" y1="42" x2="72" y2="15" stroke="#93c5fd" strokeWidth="0.4"/><line x1="55" y1="42" x2="80" y2="55" stroke="#93c5fd" strokeWidth="0.4"/><line x1="55" y1="42" x2="30" y2="58" stroke="#93c5fd" strokeWidth="0.4"/><line x1="30" y1="58" x2="12" y2="75" stroke="#93c5fd" strokeWidth="0.4"/><line x1="80" y1="55" x2="62" y2="72" stroke="#93c5fd" strokeWidth="0.4"/><line x1="72" y1="15" x2="88" y2="28" stroke="#93c5fd" strokeWidth="0.4"/>
      {NODES.map((node, index) => <circle key={index} cx={node.x} cy={node.y} r={node.r} fill="#60a5fa" className="sag-panel-node" style={{ animationDelay: `${node.delay}s` }} />)}
    </svg>
    <div style={{ position: "relative", zIndex: 2, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 0" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.18, letterSpacing: -0.8, marginBottom: 16 }}>Smart <br /><span style={{ background: "linear-gradient(90deg, #93c5fd, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Assessment</span><br />Generator</h1>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.75, marginBottom: 26 }}>Generate CLO-aligned exam papers, quizzes, and assignments using AI — tailored to your course content.</p>
      <div style={{ display: "flex", flexDirection: "unset", gap: 10 }}>{FEATURES.map(({ title, desc }, index) => <div key={title} className="sag-panel-feature" style={{ animationDelay: `${0.1 * index}s` }}><div><div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{title}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.48)", lineHeight: 1.5 }}>{desc}</div></div></div>)}</div>
    </div>
    <div style={{ position: "relative", zIndex: 2, marginTop: 10 }}><p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 0 }}>© 2026 Smart Assessment Generator · All rights reserved</p></div>
  </div>
);

export default AuthBrandPanel;
