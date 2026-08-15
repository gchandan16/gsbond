"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import Link from 'next/link';

async function logout(router) {

    const token = (localStorage.getItem("authToken"))
    await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
        {}, // body
        {
            withCredentials: true,
        }
    );
    localStorage.removeItem("authToken");
    localStorage.removeItem("permissions");
    router.replace("/login");
}


export default function Header({ onMenuToggle }) {
    const router = useRouter();
    const handleLogout = () => logout(router);
    const [userType, setUserType] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        const role = JSON.parse(localStorage.getItem("user"));
        if (role) {
            try {
                setUserType((role.role));
            } catch {
                setUserType(role.role);
            }
        }
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className="bg-white border-bottom border-primary-subtle shadow-sm px-3 px-md-4 py-2 d-flex align-items-center justify-content-between position-sticky top-0"
            style={{ zIndex: 1000 }}>

            {/* Left - Menu button (mobile) + Page title */}
            <div className="d-flex align-items-center gap-3">
                {/* Mobile Menu Button */}
                {isMobile && (
                    <button
                        className="btn btn-light btn-sm border border-primary-subtle d-flex align-items-center justify-content-center p-0"
                        style={{ width: 36, height: 36, borderRadius: 6 }}
                        onClick={onMenuToggle}
                        title="Menu"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                )}

                    <Link href="/dashboard" className="fw-bold text-primary text-decoration-none" style={{ fontSize: 15 }}>
                        Dashboard
                    </Link>
            </div>

            {/* Right - Actions */}
            <div className="d-flex align-items-center gap-2 gap-md-3">

                {/* Notification */}
                <Link href="/dashboard/notifications">
                    <button
                        className="btn btn-light btn-sm border border-primary-subtle d-flex align-items-center justify-content-center position-relative p-1"
                        style={{ width: 32, height: 32, borderRadius: 6 }} title="Notifications"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="position-absolute top-0 end-0 bg-primary rounded-circle border border-white"
                            style={{ width: 8, height: 8, transform: "translate(2px,-2px)" }} />
                    </button>
                </Link>

                {/* Avatar */}
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: 32, height: 32, fontSize: 12 }}>{userType == "admin" ? "A" : "C"}</div>
                    <span className="fw-semibold text-dark d-none d-md-inline" style={{ fontSize: 13 }}>{userType?.toUpperCase() == "ADMIN" ? "ADMIN":"CLEANER"}</span>
                </div>

                {/* Logout - icon only on mobile, icon+text on desktop */}
                <button
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 px-2 px-md-3"
                    style={{ fontSize: 12, borderRadius: 6 }}
                    onClick={() => setShowLogoutModal(true)}
                    title="Logout">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="d-none d-md-inline">Logout</span>
                </button>
            </div>

            {showLogoutModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                        background: "rgba(0, 0, 0, 0.45)",
                        zIndex: 2000,
                        backdropFilter: "blur(4px)"
                    }}
                >
                    <div
                        className="bg-white rounded-3 shadow-sm"
                        style={{
                            width: "90%",
                            maxWidth: 360,
                            overflow: "hidden",
                            border: "1px solid #e3f2fd"
                        }}
                    >
                        {/* Header */}
                        <div
                            className="px-4 py-3 d-flex align-items-center justify-content-between"
                            style={{ background: "#e3f2fd" }}
                        >
                            <span className="fw-semibold text-primary" style={{ fontSize: 14 }}>
                                Logout
                            </span>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="btn p-0 border-0"
                                style={{ fontSize: 16 }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-4 py-3 text-center">
                            <div
                                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    background: "#e3f2fd",
                                    color: "#0d6efd",
                                    fontSize: 20
                                }}
                            >
                                ⎋
                            </div>

                            <p className="mb-1 fw-semibold" style={{ fontSize: 14 }}>
                                Ready to logout?
                            </p>
                            <p className="text-secondary mb-3" style={{ fontSize: 12 }}>
                                You will be signed out of your account.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-3 pb-3 d-flex gap-2">
                            <button
                                className="btn w-50"
                                style={{
                                    border: "1px solid #0d6efd",
                                    color: "#0d6efd",
                                    background: "white",
                                    fontSize: 13
                                }}
                                onClick={() => setShowLogoutModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                id="logout-button"
                                className="btn w-50"
                                style={{
                                    background: "#0d6efd",
                                    color: "#fff",
                                    fontSize: 13
                                }}
                                onClick={() => {
                                    setShowLogoutModal(false);
                                    logout(router);
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}