"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [step, setStep] = useState("otp"); // "otp" | "password"
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ── Send OTP ────────────────────────────────────────────────────────────
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) return setError("Please enter your email.");
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forget-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send OTP");
            setShowModal(true);
            setStep("otp");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── OTP input handler ────────────────────────────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return; // digits only
        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        // auto focus next
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // ── Verify OTP ───────────────────────────────────────────────────────────
    const handleVerifyOTP = async () => {
        const otpValue = otp.join("");
        if (otpValue.length < 6) return setError("Please enter the 6-digit OTP.");
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Invalid OTP");
            setStep("password");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Reset Password ───────────────────────────────────────────────────────
    const handleResetPassword = async () => {
        if (!newPassword) return setError("Please enter a new password.");
        if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword) return setError("Passwords do not match.");
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/new-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to reset password");
            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setOtp(["", "", "", "", "", ""]);
        setNewPassword("");
        setConfirmPassword("");
        setStep("otp");
        setError("");
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{ background: "linear-gradient(135deg, #e0f0ff 0%, #f0f7ff 100%)" }}>

            {/* ── Forgot Password Card ── */}
            <div className="card border-0 shadow-lg rounded-4 p-2" style={{ width: "100%", maxWidth: 420 }}>
                <div className="card-body p-4">

                    {/* Icon */}
                    <div className="d-flex justify-content-center mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 64, height: 64 }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                    </div>

                    <h5 className="fw-bold text-dark text-center mb-1">Forgot Password?</h5>
                    <p className="text-secondary text-center mb-4" style={{ fontSize: 13 }}>
                        Enter your email and we'll send you a 6-digit OTP to reset your password.
                    </p>

                    {/* Error */}
                    {error && !showModal && (
                        <div className="alert alert-danger py-2 px-3 rounded-3 mb-3" style={{ fontSize: 13 }}>
                            {error}
                        </div>
                    )}

                    {/* Email form */}
                    <form onSubmit={handleSendOTP}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                                Email Address
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="admin@gsbondcleaning.com.au"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ fontSize: 13 }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 fw-semibold rounded-3"
                            disabled={loading}
                            style={{ fontSize: 14 }}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm me-2" />
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                            )}
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        <a href="/login" className="text-primary text-decoration-none" style={{ fontSize: 13 }}>
                            ← Back to Login
                        </a>
                    </div>
                </div>
            </div>

            {/* ── OTP + Reset Password Modal ── */}
            {showModal && (
                <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
                        <div className="modal-content border-0 rounded-4 shadow-lg">

                            {/* Modal Header */}
                            <div className="modal-header border-bottom border-primary border-opacity-25 px-4 py-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 38, height: 38 }}>
                                        {step === "otp" ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h6 className="fw-bold text-dark mb-0">
                                            {step === "otp" ? "Enter OTP" : "Set New Password"}
                                        </h6>
                                        <p className="text-secondary mb-0" style={{ fontSize: 11 }}>
                                            {step === "otp"
                                                ? `OTP sent to ${email}`
                                                : "Choose a strong password"}
                                        </p>
                                    </div>
                                </div>
                                <button className="btn-close" onClick={closeModal} />
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body px-4 py-4">

                                {/* Step indicator */}
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <div className={`rounded-pill d-flex align-items-center justify-content-center fw-bold`}
                                        style={{ width: 28, height: 28, fontSize: 12, background: "#0d6efd", color: "white" }}>
                                        1
                                    </div>
                                    <div className="flex-grow-1 border-top" style={{ borderColor: step === "password" ? "#0d6efd" : "#dee2e6", borderWidth: 2 }} />
                                    <div className="rounded-pill d-flex align-items-center justify-content-center fw-bold"
                                        style={{ width: 28, height: 28, fontSize: 12, background: step === "password" ? "#0d6efd" : "#dee2e6", color: step === "password" ? "white" : "#6c757d" }}>
                                        2
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="alert alert-danger py-2 px-3 rounded-3 mb-3" style={{ fontSize: 13 }}>
                                        {error}
                                    </div>
                                )}

                                {/* Success */}
                                {success && (
                                    <div className="alert alert-success py-2 px-3 rounded-3 mb-3" style={{ fontSize: 13 }}>
                                        {success}
                                    </div>
                                )}

                                {/* ── Step 1: OTP ── */}
                                {step === "otp" && (
                                    <div>
                                        <p className="text-secondary mb-3 text-center" style={{ fontSize: 13 }}>
                                            Enter the 6-digit code sent to your email
                                        </p>

                                        {/* OTP boxes */}
                                        <div className="d-flex justify-content-center gap-2 mb-4">
                                            {otp.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    id={`otp-${i}`}
                                                    type="text"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    className="form-control text-center fw-bold border-primary"
                                                    style={{ width: 48, height: 52, fontSize: 20, borderRadius: 10 }}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            className="btn btn-primary w-100 fw-semibold rounded-3"
                                            onClick={handleVerifyOTP}
                                            disabled={loading}
                                            style={{ fontSize: 14 }}
                                        >
                                            {loading
                                                ? <span className="spinner-border spinner-border-sm me-2" />
                                                : null}
                                            {loading ? "Verifying..." : "Verify OTP"}
                                        </button>

                                        <div className="text-center mt-3">
                                            <span className="text-secondary" style={{ fontSize: 12 }}>
                                                Didn't receive it?{" "}
                                            </span>
                                            <button
                                                className="btn btn-link p-0 text-primary"
                                                style={{ fontSize: 12 }}
                                                onClick={handleSendOTP}
                                            >
                                                Resend OTP
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 2: New Password ── */}
                                {step === "password" && (
                                    <div>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                                                New Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control border-end-0"
                                                    placeholder="Min. 6 characters"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    style={{ fontSize: 13 }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-light border border-start-0"
                                                    onClick={() => setShowPassword(s => !s)}
                                                >
                                                    {showPassword ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                                        </svg>
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                            <circle cx="12" cy="12" r="3"/>
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                                                Confirm Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type={showConfirm ? "text" : "password"}
                                                    className="form-control border-end-0"
                                                    placeholder="Re-enter password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    style={{ fontSize: 13 }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-light border border-start-0"
                                                    onClick={() => setShowConfirm(s => !s)}
                                                >
                                                    {showConfirm ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                                        </svg>
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                            <circle cx="12" cy="12" r="3"/>
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Password match indicator */}
                                            {confirmPassword && (
                                                <div className={`mt-1 d-flex align-items-center gap-1 ${newPassword === confirmPassword ? "text-success" : "text-danger"}`}
                                                    style={{ fontSize: 11 }}>
                                                    {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="btn btn-primary w-100 fw-semibold rounded-3"
                                            onClick={handleResetPassword}
                                            disabled={loading}
                                            style={{ fontSize: 14 }}
                                        >
                                            {loading
                                                ? <span className="spinner-border spinner-border-sm me-2" />
                                                : null}
                                            {loading ? "Resetting..." : "Reset Password"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}