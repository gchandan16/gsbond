"use client";

import axios from "axios";
import { useEffect, useState } from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDate(raw) {
    const d = new Date(raw);
    const now = new Date();
    const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

    const day = isToday
        ? `Today, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    return { day, time };
}

// ─── LogsModal ────────────────────────────────────────────────────────────────
export default function LogsModal({ show, onClose, quoteId }) {
    const [mounted, setMounted] = useState(false);
    const [token, setToken] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedToken = localStorage.getItem("authToken");
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!show || !quoteId || !token) return;

        const getLogs = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-history/${quoteId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setLogs(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching logs:", error);
                setLogs([]);
            } finally {
                setLoading(false);
            }
        };

        getLogs();
    }, [show, quoteId, token]);

    if (!mounted) return null;

    return (
        <>
            {/* Backdrop */}
            {show && <div className="modal-backdrop fade show" />}

            {/* Modal */}
            <div className={`modal fade ${show ? "show d-block" : ""}`} tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                        {/* ── HEADER ── */}
                        <div
                            className="modal-header border-0 px-4 py-3"
                            style={{ background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)" }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                {/* Icon */}
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                    style={{ width: 40, height: 40, background: "rgba(255,255,255,0.15)" }}
                                >
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
                                        stroke="white" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                                    </svg>
                                </div>

                                {/* Title */}
                                <div>
                                    <h5 className="modal-title text-white fw-semibold mb-0" style={{ fontSize: 17 }}>
                                        Log History 
                                    </h5>
                                    {quoteId && (
                                        <span className="text-white-50 font-monospace" style={{ fontSize: 12 }}>
                                            For #{quoteId}
                                        </span>
                                    )}
                                </div>
                            </div>

                           
                        </div>

                        {/* ── BODY ── */}
                        <div className="modal-body p-4" style={{ background: "#f8faff" }}>

                            {/* Loading */}
                            {loading && (
                                <div className="d-flex flex-column align-items-center gap-2 py-5 text-primary">
                                    <div className="spinner-border" style={{ color: "#1a56db" }} role="status">
                                        <span className="visually-hidden">Loading…</span>
                                    </div>
                                    <span className="text-secondary small">Fetching logs…</span>
                                </div>
                            )}

                            {/* Empty */}
                            {!loading && logs.length === 0 && (
                                <div className="d-flex flex-column align-items-center gap-2 py-5 text-secondary">
                                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"
                                        stroke="#93c5fd" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <p className="mb-0 small">No logs available for this quote.</p>
                                </div>
                            )}

                            {/* Content */}
                            {!loading && logs.length > 0 && (
                                <>
                                    {/* ── TABLE (md+) ── */}
                                    <div className="d-none d-md-block rounded-3 border border-primary-subtle overflow-hidden bg-white">
                                        <table className="table table-hover mb-0" style={{ fontSize: 13.5 }}>
                                            <thead style={{ background: "linear-gradient(180deg,#eff6ff,#dbeafe)" }}>
                                                <tr>
                                                    {["Action", "Remark", "Date"].map((h) => (
                                                        <th
                                                            key={h}
                                                            className="px-3 py-2 text-uppercase fw-semibold border-bottom border-primary-subtle"
                                                            style={{ fontSize: 11, letterSpacing: ".6px", color: "#1e40af" }}
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logs.map((log) => {
                                                    const { day, time } = formatDate(log.createdAt);
                                                    return (
                                                        <tr key={log.id}>
                                                            <td className="px-3 py-3 align-top">
                                                                <span
                                                                    className="badge rounded-pill d-inline-flex align-items-center gap-1 fw-semibold font-monospace"
                                                                    style={{
                                                                        background: "#dbeafe", color: "#1d4ed8",
                                                                        border: "1px solid #bfdbfe", fontSize: 11.5,
                                                                    }}
                                                                >
                                                                    <span
                                                                        className="rounded-circle d-inline-block"
                                                                        style={{ width: 6, height: 6, background: "#3b82f6" }}
                                                                    />
                                                                    {log.action_type}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3 align-top text-secondary" style={{ fontSize: 13 }}>
                                                                {log.remark}
                                                            </td>
                                                            <td className="px-3 py-3 align-top">
                                                                <div className="fw-medium text-dark" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                                                                    {day}
                                                                </div>
                                                                <div className="text-secondary font-monospace" style={{ fontSize: 11.5 }}>
                                                                    {time}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* ── CARDS (mobile, <md) ── */}
                                    <div className="d-flex d-md-none flex-column gap-3">
                                        {logs.map((log) => {
                                            const { day, time } = formatDate(log.createdAt);
                                            return (
                                                <div
                                                    key={log.id}
                                                    className="bg-white rounded-3 border border-primary-subtle p-3 d-flex flex-column gap-2"
                                                >
                                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                                        <div>
                                                            <div
                                                                className="text-uppercase fw-semibold mb-1"
                                                                style={{ fontSize: 10.5, letterSpacing: ".5px", color: "#93c5fd" }}
                                                            >
                                                                Action
                                                            </div>
                                                            <span
                                                                className="badge rounded-pill d-inline-flex align-items-center gap-1 fw-semibold font-monospace"
                                                                style={{
                                                                    background: "#dbeafe", color: "#1d4ed8",
                                                                    border: "1px solid #bfdbfe", fontSize: 11.5,
                                                                }}
                                                            >
                                                                <span
                                                                    className="rounded-circle d-inline-block"
                                                                    style={{ width: 6, height: 6, background: "#3b82f6" }}
                                                                />
                                                                {log.action_type}
                                                            </span>
                                                        </div>
                                                        <div className="text-end">
                                                            <div
                                                                className="text-uppercase fw-semibold mb-1"
                                                                style={{ fontSize: 10.5, letterSpacing: ".5px", color: "#93c5fd" }}
                                                            >
                                                                Date
                                                            </div>
                                                            <div className="fw-medium text-dark" style={{ fontSize: 13 }}>{day}</div>
                                                            <div className="text-secondary font-monospace" style={{ fontSize: 11.5 }}>{time}</div>
                                                        </div>
                                                    </div>

                                                    <hr className="my-1" style={{ borderColor: "#f0f6ff" }} />

                                                    <div>
                                                        <div
                                                            className="text-uppercase fw-semibold mb-1"
                                                            style={{ fontSize: 10.5, letterSpacing: ".5px", color: "#93c5fd" }}
                                                        >
                                                            Remark
                                                        </div>
                                                        <span className="text-secondary" style={{ fontSize: 13 }}>{log.remark}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── FOOTER ── */}
                        <div className="modal-footer border-top px-4 py-3 bg-white" style={{ borderColor: "#e8f0fe" }}>
                            {logs.length > 0 && (
                                <span
                                    className="badge me-auto fw-medium"
                                    style={{
                                        background: "#eff6ff", color: "#6b87c7",
                                        border: "1px solid #dbeafe", fontSize: 12, padding: "5px 12px",
                                    }}
                                >
                                    {logs.length} {logs.length === 1 ? "entry" : "entries"}
                                </span>
                            )}
                            <button
                                className="btn fw-semibold rounded-3"
                                onClick={onClose}
                                style={{
                                    border: "1.5px solid #bfdbfe", color: "#1e40af",
                                    background: "white", fontSize: 14, padding: "8px 22px",
                                }}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}