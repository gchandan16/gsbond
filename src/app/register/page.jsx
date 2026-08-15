"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", role: "Staff", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())             e.name     = "Full name is required.";
    if (!form.email.trim())            e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password)                e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Min. 6 characters required.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    router.push("/login");
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthInfo = [
    null,
    { label: "Very Weak",   cls: "bg-danger",  w: "20%" },
    { label: "Weak",        cls: "bg-warning",  w: "40%" },
    { label: "Fair",        cls: "bg-warning",  w: "60%" },
    { label: "Strong",      cls: "bg-success",  w: "80%" },
    { label: "Very Strong", cls: "bg-primary",  w: "100%" },
  ][strength];

  return (
    <div className="min-vh-100 d-flex" style={{ background: "linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 50%, #e8f4fd 100%)" }}>

      {/* Left Panel */}
      <div className="d-none d-md-flex flex-column col-md-5 bg-primary text-white p-5 justify-content-center">

        <div className="d-flex align-items-center gap-3 mb-5">
          <div className="bg-white text-primary rounded-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 42, height: 42, fontSize: 15 }}>GS</div>
          <div>
            <div className="fw-bold" style={{ fontSize: 16 }}>GS Bond Cleaning</div>
            <div className="text-white opacity-50" style={{ fontSize: 12 }}>Management Portal</div>
          </div>
        </div>

        <h2 className="fw-bold text-white mb-2" style={{ fontSize: 26, lineHeight: 1.3 }}>
          Create your account<br />in minutes
        </h2>
        <p className="text-white opacity-75 mb-5" style={{ fontSize: 14, lineHeight: 1.8 }}>
          Get access to quotes, invoices, and service management right after registration.
        </p>

        {/* Steps */}
        <div className="d-flex flex-column gap-4 mb-5">
          {[
            { n: "1", title: "Fill in your details",  desc: "Name, email and choose a role." },
            { n: "2", title: "Set a secure password", desc: "At least 6 characters recommended." },
            { n: "3", title: "Access your dashboard", desc: "Redirected to login right after." },
          ].map((s) => (
            <div className="d-flex align-items-start gap-3" key={s.n}>
              <div className="bg-white bg-opacity-10 text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{ width: 28, height: 28, fontSize: 12 }}>{s.n}</div>
              <div>
                <div className="fw-semibold text-white" style={{ fontSize: 13 }}>{s.title}</div>
                <div className="text-white opacity-50" style={{ fontSize: 12 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Roles */}
        <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded-3 p-3">
          <div className="fw-semibold text-white mb-2" style={{ fontSize: 12 }}>Available Roles</div>
          {[
            { role: "Admin",   desc: "Full access to all modules" },
            { role: "Manager", desc: "Quotes, invoices & services" },
            { role: "Staff",   desc: "View and create quotes only" },
          ].map((r) => (
            <div key={r.role} className="d-flex align-items-center gap-2 mb-1">
              <span className="bg-white rounded-circle flex-shrink-0" style={{ width: 6, height: 6, display: "inline-block" }} />
              <span className="text-white fw-semibold" style={{ fontSize: 12, minWidth: 58 }}>{r.role}</span>
              <span className="text-white opacity-50" style={{ fontSize: 12 }}>{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="col-12 col-md-7 d-flex align-items-center justify-content-center p-4">
        <div className="bg-white rounded-4 shadow-sm border border-primary-subtle p-4 p-md-5 w-100" style={{ maxWidth: 460 }}>

          <div className="d-flex align-items-center gap-2 mb-4 d-md-none">
            <div className="bg-primary text-white rounded-2 d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 36, height: 36, fontSize: 13 }}>GS</div>
            <span className="fw-bold text-primary">GS Bond Cleaning</span>
          </div>

          <h4 className="fw-bold text-dark mb-1" style={{ fontSize: 22 }}>Create an account</h4>
          <p className="text-secondary mb-4" style={{ fontSize: 13 }}>Fill in the details below to get started</p>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">

            {/* Name + Role */}
            <div className="row g-3">
              <div className="col-12 col-sm-7">
                <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Full Name</label>
                <input className={`form-control border-primary-subtle ${errors.name ? "is-invalid" : ""}`}
                  placeholder="Sarah Mitchell" value={form.name} onChange={(e) => update("name", e.target.value)} />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="col-12 col-sm-5">
                <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Role</label>
                <select className="form-select border-primary-subtle" value={form.role} onChange={(e) => update("role", e.target.value)}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Email Address</label>
              <input type="email" className={`form-control border-primary-subtle ${errors.email ? "is-invalid" : ""}`}
                placeholder="you@gsbond.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Password</label>
              <div className="position-relative">
                <input type={showPassword ? "text" : "password"}
                  className={`form-control border-primary-subtle ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Min. 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)}
                  style={{ paddingRight: 40 }} />
                <button type="button" className="btn btn-link text-secondary position-absolute p-0" tabIndex={-1}
                  style={{ right: 12, top: "50%", transform: "translateY(-50%)" }}
                  onClick={() => setShowPassword(v => !v)}>
                  {showPassword
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              </div>
              {form.password && strengthInfo && (
                <div className="mt-2">
                  <div className="progress" style={{ height: 4 }}>
                    <div className={`progress-bar ${strengthInfo.cls}`} style={{ width: strengthInfo.w, transition: "width 0.3s" }} />
                  </div>
                  <small className={`${strengthInfo.cls.replace("bg-", "text-")} fw-semibold`} style={{ fontSize: 11 }}>
                    {strengthInfo.label}
                  </small>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Confirm Password</label>
              <div className="position-relative">
                <input type={showConfirm ? "text" : "password"}
                  className={`form-control border-primary-subtle ${errors.confirm ? "is-invalid" : ""}`}
                  placeholder="Re-enter your password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)}
                  style={{ paddingRight: 40 }} />
                <button type="button" className="btn btn-link text-secondary position-absolute p-0" tabIndex={-1}
                  style={{ right: 12, top: "50%", transform: "translateY(-50%)" }}
                  onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
                {errors.confirm && <div className="invalid-feedback d-block">{errors.confirm}</div>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 mt-1" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating account…</>
                : <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Create Account
                  </>
              }
            </button>
          </form>

          <hr className="border-primary-subtle my-4" />
          <p className="text-center text-secondary mb-0" style={{ fontSize: 13 }}>
            Already have an account?{" "}
            <a href="/login" className="text-primary text-decoration-none fw-semibold">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}