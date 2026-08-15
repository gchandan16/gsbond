"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userAgent, setUserAgent] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        email,
        password,
        userAgent,
      });

      if (response.data.success === true) {
        localStorage.setItem("authToken", response.data.data.token);
        localStorage.setItem("permissions", JSON.stringify(response.data.data.permissions));
        localStorage.setItem("user", JSON.stringify({
          email: response.data.data.user.email,
          role: response.data.data.user.role,
        }));

        let device = "Desktop";

        if (userAgent.includes("Mobile")) device = "Mobile";

        localStorage.setItem("device", device);

        if (window.flutter_inappwebview) {
          window.flutter_inappwebview.callHandler('onLogin', email);
          window.location.href = "/dashboard";
        }
        else{
          router.replace("/dashboard");

        }

      } else {
        setError(response.data.message || "Invalid email or password.");
      }
    } catch (err) {
      // ✅ axios throws on 4xx/5xx — catch it here
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 401) {
        setError("Incorrect password. Please try again.");
      } else if (err?.response?.status === 404) {
        setError("No account found with this email.");
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const hasToken = document.cookie.includes("authToken");

    if (hasToken) {
      router.replace("/dashboard");
    }

    const ua = navigator.userAgent;
    setUserAgent(ua);
  }, []);

  return (
    <div className="min-vh-100 bg-light d-flex" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 50%, #e8f4fd 100%)" }}>

      {/* Left Panel */}
      <div className="d-none d-md-flex flex-column col-md-6 bg-primary text-white p-5 justify-content-center">
        {/* Logo */}
        {/* <div className="d-flex align-items-center gap-3 mb-5">
          <div className="bg-white text-primary rounded-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 42, height: 42, fontSize: 15 }}>GS</div>
          <div>
            <div className="fw-bold" style={{ fontSize: 16 }}>GS Bond Cleaning</div>
            <div className="text-white opacity-50" style={{ fontSize: 12 }}>Management Portal</div>
          </div>
        </div> */}
        <img style={{ "border-radius": "8px" }} src="../loginPage.png" alt="" />




        {/* Headline */}
        {/* <div className="mb-5">
          <h2 className="fw-bold text-white mb-2" style={{ fontSize: 28, lineHeight: 1.3 }}>
            Manage your cleaning<br />business with ease
          </h2>
          <p className="text-white opacity-75" style={{ fontSize: 14, lineHeight: 1.8 }}>
            Track quotes, manage services, and handle invoices — all from one clean dashboard.
          </p>
        </div> */}

        {/* Stats */}
        {/* <div className="row g-3 mb-5">
          {[
            { value: "1.2k+", label: "Quotes Created" },
            { value: "98%", label: "Client Satisfaction" },
            { value: "40+", label: "Services Listed" },
          ].map((s) => (
            <div className="col-4" key={s.label}>
              <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded-3 p-3 text-center">
                <div className="fw-bold text-white" style={{ fontSize: 20 }}>{s.value}</div>
                <div className="text-white opacity-50" style={{ fontSize: 11, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Features */}
        {/* <div className="d-flex flex-column gap-3">
          {[
            { label: "Quote Management", desc: "Create and send quotes instantly to clients." },
            { label: "Service Catalogue", desc: "Organise categories and services effortlessly." },
            { label: "User & Rights Control", desc: "Fine-grained access control for your team." },
          ].map((f) => (
            <div className="d-flex align-items-start gap-3" key={f.label}>
              <span className="bg-white bg-opacity-10 text-white rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 32, height: 32 }}>✓</span>
              <div>
                <div className="fw-semibold text-white" style={{ fontSize: 13 }}>{f.label}</div>
                <div className="text-white opacity-50" style={{ fontSize: 12 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div> */}
      </div>

      {/* Right Panel - Form */}
      <div className="col-12 col-md-6 d-flex align-items-center justify-content-center p-4">
        <div className="bg-white rounded-4 shadow-sm border border-primary-subtle p-4 p-md-5 w-100 " style={{ maxWidth: 420 }}>

          <div className="d-flex justify-content-center align-items-center gap-2  text-center">
            <img
              src="/logo/logo.png"
              alt="logo"
              className="img-fluid"
              style={{ maxHeight: "60px" }}
            />
          </div>

          <div className="d-flex flex-column justify-content-center mt-0">
            <h4 className="fw-bold text-dark mb-1 text-center" style={{ fontSize: 22 }}>Sign In</h4>
            <p className="text-secondary mb-4 text-center" style={{ fontSize: 13 }}>to continue to GSBC CRM</p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger border-0 d-flex align-items-center gap-2 py-2 px-3 mb-3" style={{ fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} id="login-form-id" className="d-flex flex-column gap-3">

            {/* Email */}
            <div className="form-floating">
              <input type="email" className="form-control border-primary-subtle" id="loginEmail"
                placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="loginEmail" className="text-secondary">Email address</label>
            </div>

            {/* Password */}
            <div className="position-relative">
              <div className="form-floating">
                <input type={showPassword ? "text" : "password"} className="form-control border-primary-subtle" id="loginPassword"
                  placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: 44 }} required />
                <label htmlFor="loginPassword" className="text-secondary">Password</label>
              </div>
              <button type="button" className="btn btn-link text-secondary position-absolute p-0" tabIndex={-1}
                style={{ right: 12, top: "50%", transform: "translateY(-50%)" }}
                onClick={() => setShowPassword(v => !v)}>
                {showPassword
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                }
              </button>
            </div>

            <div className="text-end">
              <a href="/forget-password" className="text-primary text-decoration-none" style={{ fontSize: 12 }}>Forgot password?</a>
            </div>

            <button id="login-button" type="submit" className="btn btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2 py-2" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Signing in…</>
                : "Sign In"
              }
            </button>
          </form>

          <hr className="border-primary-subtle my-4" />

          <div className="d-flex justify-content-center" style={{ "font-size": "12px" }}>
            <span>Powered by  &nbsp; </span>
            <a target="_blank" href="https://www.expertcodelab.com"> Expert Code Lab Pvt. Ltd.</a>
          </div>

        </div>
      </div>




      {error && (
        <div className="alert alert-danger border-0 d-flex align-items-center gap-2 py-2 px-3 mb-3" style={{ fontSize: 13 }}>
          ...
          {error}
        </div>
      )}

    </div>
  );
}
