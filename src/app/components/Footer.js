"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function Footer() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const usr = JSON.parse(localStorage.getItem("user"));
    setRole(usr);
  }, []);

  // console.log("role", role);

  return (
    <div className="d-flex d-md-none bg-white border-top border-primary-subtle px-2 py-2 align-items-center justify-content-around">

      {/* Home */}
      <Link
        href="/dashboard"
        className="text-secondary text-decoration-none small d-flex flex-column align-items-center gap-1"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7" />
          <path d="M9 22V12h6v10" />
        </svg>
        <span className="fw-bold">Home</span>
      </Link>

      {/* Quotes (admin + operator) */}
      {(role?.role === "admin") && (
        <Link
          href="/dashboard/quote/all-quotes"
          className="text-secondary text-decoration-none small d-flex flex-column align-items-center gap-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="fw-bold">Quotes</span>
        </Link>
      )}
      {(role?.role === "operator") && (
        <Link
          href="/dashboard/quote/jobs"
          className="text-secondary text-decoration-none small d-flex flex-column align-items-center gap-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            <path d="M8 7V5a4 4 0 0 1 8 0v2" />
            <line x1="3" y1="13" x2="21" y2="13" />
          </svg>
          <span className="fw-bold">Upcoming Jobs</span>
        </Link>
      )}

      {/* Jobs */}
      {(role?.role === "admin") && (
        <Link
        href="/dashboard/quote/all-jobs"
        className="text-secondary text-decoration-none small d-flex flex-column align-items-center gap-1"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
        <span className="fw-bold">Jobs</span>
      </Link>
      )}
      {(role?.role === "operator") && (
        <Link
        href="/dashboard/quote/assigned-jobs"
        className="text-secondary text-decoration-none small d-flex flex-column align-items-center gap-1"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
        <span className="fw-bold">Jobs</span>
      </Link>
      )}

    </div>
  );
}