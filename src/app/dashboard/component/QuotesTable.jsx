"use client";
import axios from "axios";
import { redirect } from "next/navigation";
// ✅ CLIENT COMPONENT (CSR) — all interactivity: search, filter, modals, actions

import Image from "next/image";

import { useState, useMemo, useRef, useEffect } from "react";

import LogsModal from "./LogsModal";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);

const STATUS_BADGE = {
    "Hot-lead": "badge text-white",
    "Cold-lead": "badge text-white",
    "Approved": "badge text-white",
    "Rejected": "badge text-white",
    "Pending": "badge text-dark",
    "Cancelled": "badge text-white",
    "Initiated": "badge text-white",
    "Assigned": "badge text-white",
    "Completed": "badge text-white",
    "Accept": "badge text-white",
    "Reject": "badge text-white",
};

const STATUS_COLOR = {
    "Hot-lead": "#dc2626",     // strong red (attention)
    "Cold-lead": "#2563eb",    // calm blue
    "Approved": "#16a34a",     // success green
    "Rejected": "#be123c",     // deep red/pink (clear rejection)
    "Pending": "#f59e0b",      // amber (waiting)
    "Cancelled": "#374151",    // neutral dark gray
    "Initiated": "#7c3aed",    // violet (new/start)
    "Assigned": "#0284c7",     // sky blue (action started)
    "Completed": "#0f766e",    // teal (finished, stable)
    "Accept": "#0ed733",    // teal (finished, stable)
    "Reject": "#e5a5a5",    // teal (finished, stable)
};

const ALL_STATUSES = ["All", "Hot-lead", "Cold-lead", "Approved", "Cancelled"];



function getInitials(name) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}





// ── Add Image Modal ──────────────────────────────────────────────────────────
function AddImageModal({ quote, onClose, onSave }) {
    const fileRef = useRef();
    const [preview, setPreview] = useState(quote?.imageUrl || null);
    const [dragging, setDragging] = useState(false);

    function handleFile(file) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <div className="modal-header border-bottom border-primary border-opacity-25 px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3" style={{ width: 38, height: 38, fontSize: 18 }}>
                                🖼️
                            </div>
                            <div>
                                <h6 className="modal-title fw-bold text-dark mb-0">Add Image</h6>
                                <p className="text-secondary mb-0 small">{quote?.id} · {quote?.clientName}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body px-4 py-4">
                        <div
                            className={`border rounded-4 p-4 text-center mb-3 ${dragging ? "border-primary bg-primary bg-opacity-10" : "border-primary border-opacity-25"}`}
                            style={{ borderStyle: "dashed", cursor: "pointer" }}
                            onClick={() => fileRef.current.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                        >
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    className="img-fluid rounded-3"
                                    width={500}
                                    height={180}
                                    style={{ objectFit: "cover", maxHeight: 180 }}
                                />
                            ) : (
                                <>
                                    <div className="mb-2" style={{ fontSize: 36 }}>📁</div>
                                    <p className="fw-semibold text-dark small mb-1">Click or drag & drop to upload</p>
                                    <p className="text-secondary" style={{ fontSize: 12 }}>PNG, JPG, PDF up to 5MB</p>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="d-none" onChange={(e) => handleFile(e.target.files[0])} />
                        {preview && (
                            <button type="button" className="btn btn-sm btn-outline-danger rounded-3 w-100" onClick={() => setPreview(null)}>
                                Remove Image
                            </button>
                        )}
                    </div>

                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary rounded-3 px-4" onClick={() => { onSave(quote.id, preview); onClose(); }}>
                            Save Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}




// ─────────────────────────────────────Assign Quote model ────────────────────────────────────────────────────
function AssignQuoteModal({ quote, onClose, onSave, users }) {

    const [form, setForm] = useState({
        assignedUser: null,
        scheduleDate: "",
        specialRemark: "",
        specialImages: [],
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg">

                    {/* Header */}
                    <div className="modal-header border-bottom border-primary border-opacity-25 px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3"
                                style={{ width: 38, height: 38, fontSize: 18 }}>
                                👷
                            </div>
                            <div>
                                <h6 className="modal-title fw-bold text-dark mb-0">Assign Job</h6>
                                <p className="text-secondary mb-0 small">Client · {quote?.clientName}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 py-4">
                        <div className="row g-3">

                            {/* Schedule Date */}
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Schedule Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control rounded-3"
                                    value={form.scheduleDate}
                                    min={new Date().toISOString().slice(0, 10)}
                                    onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })}
                                />
                            </div>

                            {/* Assign User — custom dropdown */}
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Assign To <span className="text-danger">*</span>
                                </label>

                                <div className="position-relative">
                                    {/* Trigger */}
                                    <button
                                        type="button"
                                        className="form-select rounded-3 text-start d-flex align-items-center justify-content-between"
                                        style={{ fontSize: 14 }}
                                        onClick={() => setDropdownOpen((p) => !p)}
                                    >
                                        {form.assignedUser ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                                    style={{ width: 24, height: 24, fontSize: 10 }}
                                                >
                                                    {form.assignedUser.name?.slice(0, 1).toUpperCase()}
                                                </div>
                                                <span className="text-dark">{form.assignedUser.name}</span>
                                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: 10 }}>
                                                    {form.assignedUser.role}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-secondary">— Select a user —</span>
                                        )}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                            strokeLinecap="round" strokeLinejoin="round"
                                            style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="position-fixed top-0 start-0 w-100 h-100"
                                                style={{ zIndex: 10 }}
                                                onClick={() => setDropdownOpen(false)}
                                            />
                                            {/* List */}
                                            <div
                                                className="position-absolute start-0 end-0 bg-white border rounded-3 shadow-sm"
                                                style={{ zIndex: 11, maxHeight: 200, overflowY: "auto", top: "calc(100% + 4px)" }}
                                            >
                                                {(users || []).length === 0 && (
                                                    <div className="px-3 py-2 text-secondary small">No users available.</div>
                                                )}
                                                {(users || []).map((u, i) => {
                                                    const isSelected = form.assignedUser?.id === u.id;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="d-flex align-items-center gap-3 px-3 py-2"
                                                            style={{
                                                                fontSize: 13,
                                                                cursor: "pointer",
                                                                borderBottom: i < users.length - 1 ? "1px solid #f0f0f0" : "none",
                                                                background: isSelected ? "#eef4ff" : "white",
                                                            }}
                                                            onClick={() => {
                                                                setForm({ ...form, assignedUser: u });
                                                                setDropdownOpen(false);
                                                            }}
                                                        >
                                                            <div
                                                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                                                style={{ width: 30, height: 30, fontSize: 11 }}
                                                            >
                                                                {u.name?.slice(0, 1).toUpperCase()}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div className="fw-semibold text-dark">{u.name}</div>
                                                                <div className="text-secondary" style={{ fontSize: 11 }}>{u.email}</div>
                                                            </div>
                                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: 10 }}>
                                                                {u.role}
                                                            </span>
                                                            {isSelected && (
                                                                <span className="text-primary fw-bold" style={{ fontSize: 13 }}>✓</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1" htmlFor="Special Remark" >
                                    Special Remark <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    name="Enter Special Remark"
                                    placeholder="Enter Special Remark"
                                    className="form-control rounded-3"
                                    id=""
                                    onChange={(e) => setForm({ ...form, specialRemark: e.target.value })}
                                >
                                </textarea>
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1" htmlFor="Special Remark" >
                                    Special Image
                                </label>
                                <input
                                    type="file"
                                    className="form-control rounded-3 mb-2"
                                    onChange={(e) => {
                                        setForm({ ...form, specialImages: [...e.target.files] });
                                    }}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary rounded-3 px-4"
                            disabled={!form.assignedUser || !form.scheduleDate}
                            onClick={() => { onSave(quote.id, form); onClose(); }}
                        >
                            Assign
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}



// ─────────────────────────────────────Follow Up model ────────────────────────────────────────────────────

function FollowUpModal({ quote, onClose, onSave }) {

    const [form, setForm] = useState({
        followUpDate: "",
        followUpTime: "",
        priority: "medium",
        note: "",
        quoteId: quote.id,
    });

    const priorityOptions = [
        { value: "low", label: "Low", color: "success" },
        { value: "medium", label: "Medium", color: "warning" },
        { value: "high", label: "High", color: "danger" },
    ];

    const isValid = form.followUpDate && form.followUpTime;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">

                    {/* ── Header ───────────────────────────────────────────── */}
                    <div className="modal-header border-0 px-4 pt-4 pb-0 align-items-start">
                        <div className="d-flex align-items-center gap-3 w-100">
                            <div className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-3 flex-shrink-0"
                                style={{ width: 44, height: 44, fontSize: 20 }}>
                                🔔
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fw-bold text-dark mb-0">Schedule Follow-Up</h6>
                                {/* <p className="text-secondary mb-0 small">Set a reminder for this quote</p> */}
                            </div>
                            <button type="button" className="btn-close ms-auto" onClick={onClose} />
                        </div>
                    </div>

                    {/* ── Quote ID Banner ───────────────────────────────────── */}
                    <div className="px-4 pt-3">
                        <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 px-3 py-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-secondary text-uppercase fw-semibold mb-1" style={{ fontSize: 10, letterSpacing: "0.07em" }}>Quote ID</div>
                                <div className="fw-bold text-primary font-monospace" style={{ fontSize: 20, letterSpacing: "0.04em" }}>
                                    {quote?.id || "—"}
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="text-secondary text-uppercase fw-semibold mb-1" style={{ fontSize: 10, letterSpacing: "0.07em" }}>Client</div>
                                <div className="fw-semibold text-dark small">{quote?.clientName || "—"}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Body ─────────────────────────────────────────────── */}
                    <div className="modal-body px-4 py-3">
                        <div className="row g-3">

                            {/* Reminder Date */}
                            <div className="col-7">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Reminder Date <span className="text-danger">*</span>
                                </label>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">📅</span>
                                    <input
                                        type="date"
                                        className="form-control border-start-0 rounded-end-3"
                                        value={form.followUpDate}
                                        min={new Date().toISOString().slice(0, 10)}
                                        onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Reminder Time */}
                            <div className="col-5">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Time <span className="text-danger">*</span>
                                </label>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">⏰</span>
                                    <input
                                        type="time"
                                        className="form-control border-start-0 rounded-end-3"
                                        value={form.followUpTime}
                                        onChange={(e) => setForm({ ...form, followUpTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">Priority</label>
                                <div className="d-flex gap-2">
                                    {priorityOptions.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            className={`btn btn-sm flex-grow-1 rounded-3 fw-semibold ${form.priority === p.value
                                                ? `btn-${p.color}`
                                                : `btn-outline-${p.color}`
                                                }`}
                                            style={{ fontSize: 12 }}
                                            onClick={() => setForm({ ...form, priority: p.value })}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">Note</label>
                                <textarea
                                    className="form-control form-control-sm rounded-3"
                                    rows={3}
                                    placeholder="Add a follow-up note or instructions..."
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    style={{ resize: "none" }}
                                />
                                <div className="text-end text-secondary mt-1" style={{ fontSize: 10 }}>
                                    {form.note.length} / 300
                                </div>
                            </div>

                            {/* Summary preview */}
                            {form.followUpDate && form.followUpTime && (
                                <div className="col-12">
                                    <div className="bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center gap-2">
                                        <span style={{ fontSize: 14 }}>✅</span>
                                        <span className="text-success fw-semibold small">
                                            Follow up set for{" "}
                                            {new Date(`${form.followUpDate}T${form.followUpTime}`).toLocaleString("en-US", {
                                                weekday: "short", month: "short", day: "numeric",
                                                hour: "2-digit", minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* ── Footer ───────────────────────────────────────────── */}
                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4 btn-sm" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-warning rounded-3 px-4 btn-sm fw-semibold text-dark"
                            disabled={!isValid}
                            onClick={() => { onSave(quote.id, form); onClose(); }}
                        >
                            🔔 Set Reminder
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}




// FollowUpModal 






// ── Update Modal ──────────────────────────────────────────────────────────────


function UpdateModal({ quote, onClose, onSave, Services }) {
    // console.table(Services)

    const [form, setForm] = useState({
        clientName: quote.clientName,
        email: quote.email,
        mobile: quote.mobile,
        address: quote.address,
        zip: quote.zip,
        services: quote.services,
        quotedAmount: quote.quotedAmount,
        advanceAmount: quote.advanceAmount,
        dueAmount: quote.dueAmount,
        calculatedAmount: quote.calculatedAmount,
        status: quote.status,
        jobStatus: quote.jobStatus,
        scheduledDate: quote.scheduledDate,
        assignerName: quote.assignerName,
        assignerEmail: quote.assignerEmail,
        totalTimeTaken: quote.totalTimeTaken || '',
        beforeImages: quote.beforeImages,
        afterImages: quote.afterImages,
        shareToken: quote.shareToken,
        operators: quote.operators,
        suburbs: quote.suburbs
    });

    // console.table(form);

    const [services, setServices] = useState(Services);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // console.table( form);


    const [copied, setCopied] = useState()



    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [customStatusInput, setCustomStatusInput] = useState("");
    const [statusOptions, setStatusOptions] = useState([
        "Hot-lead", "Cold-lead", "Approved", "Cancelled", "Initiated"
    ]);




    const [jobStatusDropdownOpen, setJobStatusDropdownOpen] = useState(false);
    const [customJobStatusInput, setCustomJobStatusInput] = useState("");
    const [jobStatusOptions, setJobStatusOptions] = useState(["Assigned", "Completed", "Pending"]);


    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleCopyLink = () => {
        const link = `${window.location.origin}/share/${quote.shareToken}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <div className="modal-header border-bottom border-primary border-opacity-25 px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3" style={{ width: 38, height: 38, fontSize: 18 }}>
                                ✏️
                            </div>
                            <div>
                                <h6 className="modal-title fw-bold text-dark mb-0">Update Quote</h6>
                                <p className="text-secondary mb-0 small">{quote.id}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body px-4 py-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Client Name</label>
                                <input className="form-control rounded-3" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Email</label>
                                <input type="email" className="form-control rounded-3" value={form.email} onChange={(e) => set("email", e.target.value)} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Mobile</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 rounded-start-3 fw-semibold px-2">
                                        +61
                                    </span>
                                    <input
                                        className="form-control rounded-end-3"
                                        value={form.mobile}
                                        onChange={(e) => set("mobile", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small fw-semibold text-dark mb-1">Address</label>
                                <input className="form-control rounded-3" value={form.address} onChange={(e) => set("address", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">suburb</label>
                                <input className="form-control rounded-3" value={form.suburbs} onChange={(e) => set("suburbs", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Post code</label>
                                <input className="form-control rounded-3" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
                            </div>
                            {
                                form.operators?.length > 0 &&
                                form.operators.map((op, index) => {
                                    const minutes =
                                        op.startTime && op.endTime
                                            ? Math.max(
                                                0,
                                                parseFloat(
                                                    (
                                                        (new Date(op.endTime) - new Date(op.startTime)) /
                                                        (1000 * 60 * 60)
                                                    ).toFixed(2)
                                                )
                                            )
                                            : 0;

                                    const formatDateTime = (date) => {
                                        if (!date) return "--";
                                        const d = new Date(date);
                                        return d.toLocaleString("en-IN", {
                                            weekday: "short",   // Mon
                                            day: "numeric",     // 20
                                            month: "short",     // Apr
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        });
                                    };

                                    return (
                                        <div
                                            key={index}
                                            className="border rounded-4 p-3 mb-3 shadow-sm bg-white"
                                        >
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="fw-semibold text-dark">
                                                    {op.user?.name || "Unknown"}
                                                </div>
                                                <span className="badge bg-primary-subtle text-primary">
                                                    {minutes} hours
                                                </span>
                                            </div>

                                            <div className="text-secondary small mb-2">
                                                {op.user?.email || "No email"}
                                            </div>

                                            <div className="row g-2">
                                                <div className="col-12 col-md-4">
                                                    <div className="small text-secondary">Start</div>
                                                    <div className="fw-medium text-dark" style={{ fontSize: 13 }}>
                                                        {formatDateTime(op.startTime)}
                                                    </div>
                                                </div>

                                                <div className="col-12 col-md-4">
                                                    <div className="small text-secondary">End</div>
                                                    <div className="fw-medium text-dark" style={{ fontSize: 13 }}>
                                                        {formatDateTime(op.endTime)}
                                                    </div>
                                                </div>

                                                <div className="col-12 col-md-4">
                                                    <div className="small text-secondary">Time Taken</div>
                                                    <div className="fw-semibold text-success">
                                                        {minutes} hours
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                            {/* service  */}
                            {/* service */}
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">Services</label>

                                {/* Selected service tags */}
                                <div className="border rounded-3 p-2 d-flex flex-wrap gap-2 mb-2" style={{ minHeight: 42 }}>
                                    {(form.services || []).length === 0 && (
                                        <span className="text-secondary small">No services selected.</span>
                                    )}
                                    {(form.services || []).map((s, i) => {
                                        const qty = s.qty || 1;
                                        const unitPrice = Number(s.price) || 0;
                                        const subtotal = unitPrice * qty;
                                        return (
                                            <span
                                                key={i}
                                                className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-2 d-flex align-items-center gap-1"
                                                style={{ fontSize: 12 }}
                                            >
                                                {typeof s === "object" ? s.name : s}

                                                {/* Price preview */}
                                                <span
                                                    className="text-secondary"
                                                    style={{
                                                        fontSize: 10,
                                                        wordWrap: 'break-word',
                                                        overflowWrap: 'break-word',
                                                        whiteSpace: 'normal'
                                                    }}
                                                >
                                                    {s.note || ''}
                                                </span>

                                                {/* Remove */}
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    style={{ fontSize: 7 }}
                                                    onClick={() => {
                                                        const updated = form.services.filter((_, idx) => idx !== i);
                                                        const total = updated.reduce((sum, sv) => sum + (Number(sv.price) || 0) * (sv.qty || 1), 0);
                                                        const dueamount = total - Number(form.advanceAmount);
                                                        setForm((f) => ({ ...f, services: updated, calculatedAmount: total, quotedAmount: total, dueAmount: dueamount }));
                                                    }}
                                                />
                                            </span>
                                        );
                                    })}
                                </div>

                                {/* Dropdown — unchanged */}
                                <div className="position-relative mb-2">
                                    <button
                                        type="button"
                                        className="form-select rounded-3 text-start text-secondary"
                                        style={{ fontSize: 14 }}
                                        onClick={() => setDropdownOpen((p) => !p)}
                                    >
                                        — Select from existing services —
                                    </button>

                                    {form.status != "Approved" && dropdownOpen && (
                                        <>
                                            <div
                                                className="position-fixed top-0 start-0 w-100 h-100"
                                                style={{ zIndex: 10 }}
                                                onClick={() => setDropdownOpen(false)}
                                            />
                                            <div
                                                className="position-absolute start-0 end-0 bg-white border rounded-3 shadow-sm"
                                                style={{ zIndex: 11, maxHeight: 200, overflowY: "auto", top: "calc(100% + 4px)" }}
                                            >
                                                {services.map((s, i) => {
                                                    const isSelected = (form.services || []).some(
                                                        (fs) => (typeof fs === "object" ? fs.id : fs) === s.id
                                                    );
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`px-3 py-2 d-flex justify-content-between align-items-center ${isSelected ? "text-secondary" : "text-dark"}`}
                                                            style={{
                                                                fontSize: 13,
                                                                cursor: isSelected ? "not-allowed" : "pointer",
                                                                borderBottom: i < services.length - 1 ? "1px solid #f0f0f0" : "none",
                                                                background: isSelected ? "#f8f9fa" : "white",
                                                            }}
                                                            onClick={() => {
                                                                if (isSelected) return;
                                                                // Add with qty: 1 by default
                                                                const updated = [...(form.services || []), { ...s, qty: 1 }];
                                                                const total = updated.reduce((sum, sv) => sum + (Number(sv.price) || 0) * (sv.qty || 1), 0);
                                                                const dueamount = total - Number(form.advanceAmount);
                                                                setForm((f) => ({ ...f, services: updated, calculatedAmount: total, quotedAmount: total, dueAmount: dueamount }));
                                                                setDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span>{typeof s === "object" ? s.name : s}</span>
                                                            <span className="text-secondary" style={{ fontSize: 11 }}>
                                                                ${s.price}{isSelected && <span className="ms-2">✓</span>}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Calculated Amount ($)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">$</span>
                                    <input type="number" disabled className="form-control border-start-0 rounded-end-3 font-monospace" value={form.calculatedAmount} onChange={(e) => set("calculatedAmount", parseFloat(e.target.value) || 0)} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Quoted Amount ($)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">$</span>
                                    <input
                                        type="number"
                                        className="form-control border-start-0 rounded-end-3 font-monospace"
                                        value={form.quotedAmount}
                                        onChange={(e) => {
                                            const quoted = parseFloat(e.target.value) || 0;
                                            setForm(f => ({
                                                ...f,
                                                quotedAmount: quoted,
                                                dueAmount: quoted - (f.advanceAmount || 0),  // ✅ recalc due
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Advance Amount ($)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">$</span>
                                    <input
                                        type="number"
                                        className="form-control border-start-0 rounded-end-3 font-monospace"
                                        value={form.advanceAmount || 0}
                                        onChange={(e) => {
                                            const advance = parseFloat(e.target.value) || 0;
                                            setForm(f => ({
                                                ...f,
                                                advanceAmount: advance,
                                                dueAmount: (f.quotedAmount || 0) - advance,  // ✅ recalc due
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Due Amount ($)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">$</span>
                                    <input
                                        type="number"
                                        disabled
                                        className="form-control border-start-0 rounded-end-3 font-monospace"
                                        value={form.dueAmount || 0}
                                    />
                                </div>
                            </div>


                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Status</label>

                                <div className="position-relative">
                                    {/* Trigger */}
                                    <button
                                        type="button"
                                        className="form-select rounded-3 text-start d-flex align-items-center justify-content-between w-100"
                                        style={{ fontSize: 14 }}
                                        onClick={() => setStatusDropdownOpen((p) => !p)}
                                    >
                                        {form.status ? (
                                            <span className="text-dark">{form.status}</span>
                                        ) : (
                                            <span className="text-secondary">— Select status —</span>
                                        )}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                            strokeLinecap="round" strokeLinejoin="round"
                                            style={{ transform: statusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {statusDropdownOpen && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="position-fixed top-0 start-0 w-100 h-100"
                                                style={{ zIndex: 10 }}
                                                onClick={() => setStatusDropdownOpen(false)}
                                            />

                                            {/* Dropdown */}
                                            <div
                                                className="position-absolute start-0 end-0 bg-white border rounded-3 shadow-sm"
                                                style={{ zIndex: 11, top: "calc(100% + 4px)" }}
                                            >
                                                {/* Options list */}
                                                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                                                    {statusOptions.map((s, i) => (
                                                        <div
                                                            key={i}
                                                            className="d-flex align-items-center justify-content-between px-3 py-2"
                                                            style={{
                                                                fontSize: 13,
                                                                cursor: "pointer",
                                                                borderBottom: "1px solid #f0f0f0",
                                                                background: form.status === s ? "#eef4ff" : "white",
                                                            }}
                                                            onClick={() => {
                                                                set("status", s);
                                                                setStatusDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span className={form.status === s ? "fw-semibold text-primary" : "text-dark"}>
                                                                {s}
                                                            </span>
                                                            {form.status === s && (
                                                                <span className="text-primary fw-bold" style={{ fontSize: 13 }}>✓</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>


                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Job Status</label>

                                <div className="position-relative">
                                    {/* Trigger */}
                                    <button
                                        type="button"
                                        className="form-select rounded-3 text-start d-flex align-items-center justify-content-between w-100"
                                        style={{ fontSize: 14 }}
                                        onClick={() => setJobStatusDropdownOpen((p) => !p)}
                                    >
                                        {form.jobStatus ? (
                                            <span className="text-dark">{form.jobStatus}</span>
                                        ) : (
                                            <span className="text-secondary">— Select job status —</span>
                                        )}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                            strokeLinecap="round" strokeLinejoin="round"
                                            style={{ transform: jobStatusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {jobStatusDropdownOpen && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="position-fixed top-0 start-0 w-100 h-100"
                                                style={{ zIndex: 10 }}
                                                onClick={() => setJobStatusDropdownOpen(false)}
                                            />

                                            {/* Dropdown */}
                                            <div
                                                className="position-absolute start-0 end-0 bg-white border rounded-3 shadow-sm"
                                                style={{ zIndex: 11, top: "calc(100% + 4px)" }}
                                            >
                                                {/* Options list */}
                                                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                                                    {jobStatusOptions.map((s, i) => (
                                                        <div
                                                            key={i}
                                                            className="d-flex align-items-center justify-content-between px-3 py-2"
                                                            style={{
                                                                fontSize: 13,
                                                                cursor: "pointer",
                                                                borderBottom: "1px solid #f0f0f0",
                                                                background: form.jobStatus === s ? "#eef4ff" : "white",
                                                            }}
                                                            onClick={() => {
                                                                set("jobStatus", s);
                                                                setJobStatusDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span className={form.jobStatus === s ? "fw-semibold text-primary" : "text-dark"}>
                                                                {s}
                                                            </span>
                                                            {form.jobStatus === s && (
                                                                <span className="text-primary fw-bold" style={{ fontSize: 13 }}>✓</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>


                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>



                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Scheduled Date</label>
                                <div className="position-relative">
                                    <input
                                        type="date"
                                        className="form-control rounded-3"
                                        value={form.scheduledDate || ""}
                                        disabled
                                        onChange={(e) => set("scheduledDate", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <ImageGallery before={form.beforeImages} after={form.afterImages} />
                            </div>
                            <div className="col-12 col-md-6">
                                <button className="btn btn-sm btn-outline-primary rounded-3" onClick={handleCopyLink}>
                                    {copied ? "✓ Copied!" : "🔗 Share"}
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary rounded-3 px-4 fw-semibold" onClick={() => { onSave(quote.id, form); onClose(); }}>
                            Update Quote
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}





// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ quote, onClose, onConfirm }) {
    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <div className="modal-body text-center px-4 py-5">
                        <div className="mb-3" style={{ fontSize: 48 }}>🗑️</div>
                        <h5 className="fw-bold text-dark mb-2">Delete Quote?</h5>
                        <p className="text-secondary mb-1 small">You're about to permanently delete</p>
                        <p className="fw-semibold text-dark mb-4">{quote.id} · {quote.clientName}</p>
                        <div className="alert bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 text-danger small mb-4">
                            ⚠️ This action cannot be undone.
                        </div>
                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                            <button className="btn btn-danger rounded-3 px-4 fw-semibold" onClick={() => { onConfirm(quote.id); onClose(); }}>
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



function ImageGallery({ before = [], after = [] }) {
    const [lightbox, setLightbox] = useState(null); // { src, label }

    const Section = ({ label, images, color }) => (
        <div>
            <div className={`text-uppercase fw-semibold text-${color} mb-2`} style={{ fontSize: 10, letterSpacing: "0.07em" }}>
                {label} ({images.length})
            </div>
            <div className="d-flex gap-2 flex-wrap">
                {images.length === 0 && (
                    <div className="text-secondary small fst-italic">No images</div>
                )}
                {images.map((src, i) => (
                    <div
                        key={i}
                        onClick={() => setLightbox({ src, label: `${label} ${i + 1}` })}
                        className={`border border-${color} border-opacity-25 rounded-2 overflow-hidden flex-shrink-0`}
                        style={{ width: 56, height: 56, cursor: "pointer", position: "relative" }}
                        title={`${label} ${i + 1}`}
                    >
                        <Image src={src} alt={`${label} ${i + 1}`}
                            width={56} height={56}
                            style={{ objectFit: "cover" }} />
                        {/* hover overlay */}
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 opacity-0"
                            style={{ transition: "opacity 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                            <span style={{ fontSize: 14 }}>🔍</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <div className="bg-white border rounded-3 p-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="bg-primary rounded-2 flex-shrink-0" style={{ width: 4, height: 16 }} />
                    <span className="text-uppercase fw-bold text-dark small" style={{ letterSpacing: "0.07em" }}>Images</span>
                </div>
                <div className="d-flex flex-column gap-3">
                    <Section label="Before" images={before} color="warning" />
                    <Section label="After" images={after} color="success" />
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: "rgba(0,0,0,0.85)", zIndex: 1055 }}
                    onClick={() => setLightbox(null)}
                >
                    <div onClick={e => e.stopPropagation()} className="position-relative">
                        {/* Close */}
                        <button
                            className="btn btn-sm btn-light position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 28, height: 28, zIndex: 1, transform: "translate(50%,-50%)" }}
                            onClick={() => setLightbox(null)}
                        >✕</button>

                        <img
                            src={lightbox.src}
                            alt={lightbox.label}
                            className="rounded-3 shadow-lg"
                            style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }}
                        />
                        <div className="text-center text-white mt-2 small fw-semibold">{lightbox.label}</div>
                    </div>
                </div>
            )}
        </>
    );
}



// Outside the component
function buildEmailHTML(quote, customMessage = "") {
    const servicesHTML = quote.services.map((row, index) => `
        <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 12px 8px; text-align: center; color: #555;">${index + 1}</td>
            <td style="padding: 12px 8px;">
                <strong style="color: #333;">${row.name}</strong><br/>
                ${row.note ? `<span style="font-size: 0.85em; color: #777; font-style: italic;">${row.note}</span>` : ""}
            </td>
            <td style="padding: 12px 8px; text-align: right; color: #0d6efd; font-weight: 600;">$${row.quotedPrice}</td>
        </tr>
    `).join("");

    const customMessageBlock = customMessage.trim() ? `
        <div style="background-color: #e8f4fd; border-left: 4px solid #0d6efd; padding: 15px; margin-bottom: 25px;borderRadius: 4px;">
            <h3 style="margin: 0 0 10px; color: #333; font-size: 14px; font-weight: 600;">Message from GS Bond Cleaning</h3>
            <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.6; white-space: pre-line;">${customMessage}</p>
        </div>
    ` : "";

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Quotation from GS Bond Cleaning</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:20px 0;">
            <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#0d6efd 0%,#0a58ca 100%);padding:30px 40px;text-align:center;">
                            <table width="80" height="80" cellpadding="0" cellspacing="0" align="center" style="background-color:#ffffff;border-radius:8px;margin:0 auto 15px;">
                                <tr><td align="center" valign="middle" style="padding:10px;">
                                    <img src="https://crm.gsbondcleaning.com.au/logo1.png" alt="GS Bond Cleaning Logo" width="60" height="60" style="display:block;border:0;"/>
                                </td></tr>
                            </table>
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;">GS Bond Cleaning</h1>
                            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Professional Cleaning Services</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            ${customMessageBlock}
                            <h2 style="margin:0 0 25px;color:#0d6efd;font-size:20px;font-weight:600;border-bottom:2px solid #0d6efd;padding-bottom:10px;">Estimated Quote</h2>


                            <div style="background-color:#f8f9fa;border-left:4px solid #0d6efd;padding:20px;margin-bottom:25px;border-radius:4px;">
                                <h3 style="margin:0 0 15px;color:#333;font-size:16px;font-weight:600;">Client Details</h3>
                                <table width="100%" cellpadding="5" cellspacing="0">
                                    <tr><td style="color:#666;font-size:14px;width:140px;"><strong>Name:</strong></td><td style="color:#333;font-size:14px;">${quote.clientName}</td></tr>
                                    <tr><td style="color:#666;font-size:14px;"><strong>Email:</strong></td><td style="color:#333;font-size:14px;">${quote.email}</td></tr>
                                    <tr><td style="color:#666;font-size:14px;"><strong>Mobile:</strong></td><td style="color:#333;font-size:14px;">${quote.mobile}</td></tr>
                                    <tr><td style="color:#666;font-size:14px;"><strong>Suburb:</strong></td><td style="color:#333;font-size:14px;">${quote.suburbs}</td></tr>
                                    <tr><td style="color:#666;font-size:14px;"><strong>Post code:</strong></td><td style="color:#333;font-size:14px;">${quote.zip}</td></tr>
                                </table>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;margin-bottom:25px;">
                                <thead>
                                    <tr style="background-color:#0d6efd;">
                                        <th style="padding:12px 8px;text-align:center;color:#ffffff;font-size:14px;width:50px;">#</th>
                                        <th style="padding:12px 8px;text-align:left;color:#ffffff;font-size:14px;">Services/Description</th>
                                        <th style="padding:12px 8px;text-align:right;color:#ffffff;font-size:14px;width:100px;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>${servicesHTML}</tbody>
                            </table>

                            <div style="background-color:#f8f9fa;padding:20px;border-radius:6px;margin-bottom:25px;">
                                <table width="100%" cellpadding="5" cellspacing="0">
                                    
                                    <tr style="border-top:2px solid #dee2e6;">
                                        <td style="color:#333;font-size:16px;text-align:right;padding:10px 0;"><strong>Total Amount:</strong></td>
                                        <td style="color:#0d6efd;font-size:20px;text-align:right;font-weight:bold;">$${quote.dueAmount}</td>
                                    </tr>
                                </table>
                            </div>

                            ${quote.otherDetails ? `
                            <div style="background-color:#fff8e1;border-left:4px solid #ffc107;padding:15px;margin-bottom:25px;border-radius:4px;">
                                <h3 style="margin:0 0 10px;color:#333;font-size:14px;font-weight:600;">Additional Notes</h3>
                                <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">${quote.otherDetails}</p>
                            </div>` : ""}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f8f9fa;padding:30px 40px;text-align:center;border-top:1px solid #e0e0e0;">
                            <p style="margin:0 0 10px;color:#333;font-size:16px;font-weight:600;">Thank you for choosing GS Bond Cleaning!</p>
                            <p style="margin:0 0 15px;color:#666;font-size:14px;line-height:1.6;">We're committed to providing exceptional cleaning services.<br/>If you have any questions, feel free to reach out.</p>
                            <div style="margin:20px 0;padding:15px;background-color:#ffffff;border-radius:6px;">
                                <p style="margin:0;color:#666;font-size:13px;">
                                    📧 <a href="quotes@gsbondcleaning.com.au" style="color:#0d6efd;text-decoration:none;">quotes@gsbondcleaning.com.au</a>
                                </p>
                            </div>
                            <p style="margin:15px 0 0;color:#999;font-size:12px;">© ${new Date().getFullYear()} GS Bond Cleaning. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>`;
}






// ── Main Component ────────────────────────────────────────────────────────────
export default function QuotesTable({ initialQuotes, services, userList }) {
    const [quotes, setQuotes] = useState(initialQuotes);
    const [service, setService] = useState(services);
    const [users, setUsers] = useState(userList);
    // console.log("users from component",users);
    const [serviceInput, setServiceInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [sortField, setSortField] = useState("createdAt");
    const [sortDir, setSortDir] = useState("desc");
    const [currentPage, setPage] = useState(1);
    const [imageModal, setImageModal] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [followUpModal, setFolowUpModal] = useState(null);
    const [updateModal, setUpdateModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [toast, setToast] = useState(null);
    const perPage = 6;


    const [showEmailModal, setShowEmailModal] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(null);
    const [customMessage, setCustomMessage] = useState("");
    const [emailSubject, setEmailSubject] = useState("");



    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        setToken(storedToken);
    }, []);





    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    function handleImageSave(id, imageUrl) {
        setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, imageUrl } : q));
        showToast("Image saved successfully! 🖼️");
    }

    async function handleUpdate(id, form) {
        setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, ...form } : q));

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote/${id}`,
                {
                    name: form.clientName,
                    email: form.email,
                    phone: form.mobile,
                    address: form.address,
                    zip: form.zip,
                    quotatedAmount: form.quotedAmount,
                    calculatedAmount: form.calculatedAmount,
                    advanceAmount: form.advanceAmount,
                    status: form.status,
                    jobStatus: form.jobStatus,
                    services: form.services,
                    scheduledDate: form.scheduledDate,
                    suburbs: form.suburbs,
                },

                {
                    headers: {
                        Authorisation: `Bearer ${token}`
                    }
                }

            );
            // console.table(form);

            showToast("Quote updated successfully! ✏️");
            // window.location.reload();
        } catch (error) {
            // revert optimistic update on failure
            setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, ...originalQuote } : q));
            showToast("Failed to update quote. Please try again.");
            console.error(error?.response?.data || error.message);
        }
    }



    async function handleDelete(id) {
        setQuotes((qs) => qs.filter((q) => q.id !== id));
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        showToast("Quote deleted. 🗑️", "danger");
    }




    async function handleAssign(id, form) {

        const formData = new FormData();
        formData.append("quotes", JSON.stringify([id]));
        formData.append("operators", JSON.stringify([form.assignedUser]));

        formData.append("otherDetails", form.scheduleDate);
        formData.append("specialRemark", form.specialRemark || "");

        if (form.specialImages && form.specialImages.length) {
            for (let i = 0; i < form.specialImages.length; i++) {
                formData.append("specialImages", form.specialImages[i]);
            }
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign`,
           formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        setAssignModal(null);
        showToast("Assigned job successfully");

        window.location.reload();

    }




    function toggleSort(field) {
        if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDir("asc"); }
        setPage(1);
    }



    function SortArrow({ field }) {
        if (sortField !== field) return <span className="text-secondary ms-1" style={{ fontSize: 11 }}>↕</span>;
        return <span className="text-primary ms-1" style={{ fontSize: 11 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
    }



    const filtered = useMemo(() => {
        let data = quotes.filter((q) => {
            const s = search.toLowerCase();
            return q.clientName.toLowerCase().includes(s) || q.email.toLowerCase().includes(s) || q.id.toString().includes(s);
        });
        if (statusFilter !== "All") data = data.filter((q) => q.status === statusFilter);
        data = [...data].sort((a, b) => {
            let av = a[sortField], bv = b[sortField];
            if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return data;
    }, [quotes, search, statusFilter, sortField, sortDir]);



    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);



    // console.log("quotes", quotes.length)

    // Stats
    const totalQuoted = quotes.reduce((s, q) => s + q.quotedAmount, 0);
    const approvedCount = quotes.filter((q) => q.status === "Approved").length;
    const coldLeadCount = quotes.filter((q) => q.status === "Cold-lead").length;




    async function handleQuoteGeneration(data) {
        // console.log(data)
        const quote = buildQuoteFromState(data);
        // console.log(quote)
        await generateInvoicePDF(quote);
    }


    function calcTotals(quote) {
        const total = quote.services.reduce(
            (sum, s) => sum + Number(s.quotedPrice),
            0
        );

        return { total };
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function ensureJsPDF() {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
    }

    async function generateInvoicePDF(quote) {
        await ensureJsPDF();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const DARK = [45, 45, 45];
        const MUTED = [120, 120, 120];
        const BLACK = [0, 0, 0];
        const WHITE = [255, 255, 255];
        const HEADER_BG = [55, 55, 55];   // dark grey table header (matches receipt)
        const LIGHT_GREY = [245, 245, 245];
        const BLUE = [0, 150, 210];  // GS Bond blue accent

        const pageW = doc.internal.pageSize.getWidth();   // 210mm
        const pageH = doc.internal.pageSize.getHeight();  // 297mm
        const L = 14;   // left margin
        const R = pageW - 14; // right margin

        const { total } = calcTotals(quote);

        // ── TOP: Company name + logo area (left) ──────────────────────────
        let y = 14;

        const loadImage = (url) => new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
        const logoBase64 = await loadImage("/logo/logo.png");
        if (logoBase64) {
            const imgX = L;
            const imgY = 6;
            const imgWidth = 20;
            const imgHeight = 20;

            doc.addImage(logoBase64, "PNG", imgX, imgY, imgWidth, imgHeight);

            // Calculate vertical center of image
            const centerY = imgY + imgHeight / 2;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...BLACK);

            // Adjust text Y slightly because text baseline differs
            doc.text("GS Bond Cleaning", imgX + imgWidth + 4, centerY + 2);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...MUTED);
            doc.text("ABN : 98638640230", L + 24, 22);
        }

        // ── TOP RIGHT: "Receipt" heading + invoice number ─────────────────
        doc.setFont("helvetica", "normal");
        doc.setFontSize(24);
        doc.setTextColor(...DARK);
        doc.text("Estimated Quote", R, y, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...MUTED);
        doc.text(`# ${quote.invoiceNo || quote.id}`, R, y + 8, { align: "right" });

        // ── HORIZONTAL DIVIDER ────────────────────────────────────────────
        y = 30;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        // doc.line(L, y, R, y);

        // ── BILL TO (left) + Date/Balance (right) ────────────────────────
        y += 8;

        // Left: Receipt To
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text("Receipt To:", L, y);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...BLACK);
        doc.text(quote.clientName, L, y + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        const addrLines = doc.splitTextToSize(quote.address + ", " + quote.zip, 70);
        doc.text(addrLines, L, y + 12);

        // Right: Date / Due Date / Balance Due box
        const boxX = pageW - 90;
        const boxW = 76;

        // Date row
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text("Date:", boxX, y + 2);
        doc.setTextColor(...DARK);
        doc.text(new Date().toLocaleDateString("en-AU", { month: "short", day: "2-digit", year: "numeric" }), R, y + 2, { align: "right" });

        // Due Date row
        doc.setTextColor(...MUTED);
        doc.text("Due Date:", boxX, y + 9);
        doc.setTextColor(...DARK);
        doc.text(new Date().toLocaleDateString("en-AU", { month: "short", day: "2-digit", year: "numeric" }), R, y + 9, { align: "right" });

        // Balance Due highlighted box
        // doc.setFillColor(235, 235, 235);
        // doc.roundedRect(boxX - 2, y + 13, boxW + 2, 10, 1, 1, "F");
        // doc.setFont("helvetica", "bold");
        // doc.setFontSize(9);
        // doc.setTextColor(...DARK);
        // doc.text("Advance amount:", boxX + 2, y + 19.5);
        // doc.text(`$${Number(quote.advanceAmount || 0).toFixed(2)}`, R, y + 19.5, { align: "right" });

        // ── SERVICES TABLE ────────────────────────────────────────────────
        y += 40;

        doc.autoTable({
            startY: y,
            head: [["Item", "Rate", "Amount"]],
            body: quote.services.map((s) => [
                s.name,
                `A$${Number(s.price).toFixed(2)}`,
                `A$${(Number(s.quotedPrice) * (1)).toFixed(2)}`,
            ]),
            // theme: "grid",
            headStyles: {
                fillColor: HEADER_BG,
                textColor: WHITE,
                fontStyle: "bold",
                fontSize: 9,
                halign: "left",
            },
            bodyStyles: {
                fontSize: 9,
                textColor: DARK,
                minCellHeight: 10,
            },
            columnStyles: {
                0: { cellWidth: "auto" },
                1: { halign: "center", cellWidth: 25 },
                2: { halign: "right", cellWidth: 30 },
                3: { halign: "right", cellWidth: 30 },
            },
            alternateRowStyles: { fillColor: WHITE },
            margin: { left: L, right: L },
        });

        // ── TOTALS (right aligned, below table) ──────────────────────────
        let ty = doc.lastAutoTable.finalY + 6;

        // Total row
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text("Total:", R - 40, ty);
        doc.setTextColor(...DARK);
        doc.text(`A$${Number(total).toFixed(2)}`, R, ty, { align: "right" });

        // ty += 7;
        // doc.setTextColor(...MUTED);
        // doc.text("Amount Paid:", R - 40, ty);
        // doc.setTextColor(...DARK);
        // doc.text(`A$${Number(total).toFixed(2)}`, R, ty, { align: "right" });

        // ── FOOTER ───────────────────────────────────────────────────────
        // Divider before footer
        ty += 16;
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        // doc.line(L, ty, R, ty);
        ty += 8;

        // Company footer info
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text("GS Bond Cleaning", L, ty);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text("P : 08 8444 0442", L, ty + 6);
        doc.text("E : admin@gsbondcleaning.com.au", L, ty + 12);
        doc.text("W : www.gsbondcleaning.com.au", L, ty + 18);

        ty += 28;
        doc.setTextColor(...DARK);
        doc.setFontSize(8.5);
        doc.text("Click the below link for inclusions of our service :", L, ty);
        doc.setTextColor(...BLUE);
        doc.text("https://www.gsbondcleaning.com.au/inclusions-and-exclusions/", L, ty + 6);

        ty += 14;
        doc.setTextColor(...DARK);
        doc.text("Terms & Conditions :", L, ty);
        doc.setTextColor(...BLUE);
        doc.text("https://www.gsbondcleaning.com.au/terms-conditions/", L, ty + 6);

        ty += 14;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text("Bank Details :", L, ty);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text("GS Bond Cleaning pty Ltd.", L, ty + 6);
        doc.text("BSB : 085005", L, ty + 12);
        doc.text("AC : 310448994", L, ty + 18);



        // const blob = doc.output("blob");
        // const url = URL.createObjectURL(blob);

        // const newTab = window.open("", "_blank");

        // if (!newTab) {
        //     alert("Popup blocked! Please allow popups.");
        //     return;
        // }

        //     newTab.document.write(`
        // <html>
        // <head>
        //     <title>Quotation Preview</title>
        //     <style>
        //         body { margin:0; font-family:Arial; background:#f4f6f9; }
        //         .topbar {
        //             padding:10px;
        //             background:#fff;
        //             border-bottom:1px solid #ddd;
        //             display:flex;
        //             justify-content:space-between;
        //         }
        //         button {
        //             padding:6px 12px;
        //             border:none;
        //            borderRadius:6px;
        //             cursor:pointer;
        //         }
        //         .download { background:#0d6efd; color:#fff; }
        //         .print { background:#198754; color:#fff; }
        //         iframe { width:100%; height:calc(100vh - 50px); border:none; }
        //     </style>
        // </head>
        // <body>

        //     <div class="topbar">
        //         <div><b>Quotation Preview</b></div>
        //         <div>
        //             <button class="download" onclick="download()">Download</button>
        //             <button class="print" onclick="printPdf()">Print</button>
        //         </div>
        //     </div>

        //     <iframe src="${url}"></iframe>

        //     <script>
        //         function download() {
        //             const a = document.createElement('a');
        //             a.href = "${url}";
        //             a.download = "quotation.pdf";
        //             a.click();
        //         }
        //         function printPdf() {
        //             document.querySelector('iframe').contentWindow.print();
        //         }
        //     </script>

        // </body>
        // </html>
        //     `);

        // ── SAVE ─────────────────────────────────────────────────────────
        doc.save(`Quote${quote.id}_${quote.clientName.replace(/\s+/g, "_")}.pdf`);
    }


    function buildQuoteFromState(client) {
        return {
            id: `${Date.now()}`,
            invoiceNo: `${Date.now()}`,
            clientName: client.clientName,
            address: client.address,
            zip: client.zip,
            advanceAmount: client.advanceAmount,
            dueAmount: client.dueAmount,
            quotatedAmount: client.quotatedAmount,
            services: client.services
                .filter((r) => r.serviceId || r.name) // skip empty rows
                .map((r) => ({
                    name: r.name || r.serviceId,
                    qty: r.qty || 1,
                    price: parseFloat(r.price || r.base) || 0,
                    quotedPrice: parseFloat(r.quotedPrice || r.price || r.base) || 0,
                })),
            total: services.filter((r) => r.serviceId || r.name).reduce((acc, num) => acc + parseFloat(num.quotedPrice || 0), 0).toFixed(2),
        };
    }

    async function handleFollowUp(id, form) {
        // console.log(form);
        try {
            const token = localStorage.getItem("authToken");

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/followUp`,
                {
                    quoteId: id,
                    reminderDate: form.followUpDate,
                    reminderTime: form.followUpTime,
                    priority: form.priority,
                    note: form.note,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.data.success) {
                return showToast("Fooloow up failed. 🗑️", "danger");
            }

            showToast("Follow up created. 🗑️", "success");

        } catch (error) {
            console.error(error);

            showToast.error(
                error?.response?.data?.message || "Something went wrong"
            );
        }
    }


    // Inside your component — updated sendEmail
    async function sendEmail(quote, customMessage = "", subject = "Quote from GS Bond Cleaning") {
        try {
            const token = localStorage.getItem("authToken");

            const emailHTML = buildEmailHTML(quote, customMessage);

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/send-mail`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: quote.id,
                    to: quote.email,
                    subject: subject,
                    html: emailHTML,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert("Email sent successfully ✅");
                setShowEmailModal(false);
            } else {
                alert("Failed to send email ❌");
            }
        } catch (error) {
            console.error(error);
            alert("Error sending email ❌");
        }
    }

    const [showModal, setShowModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);



    const handleRowClick = (quoteId) => {
        console.log("quoteId", quoteId);
        setSelectedRow({
            quote_id: quoteId,
        });
        setShowModal(true);
    };



    return (
        <>
            {/* Toast */}
            {toast && (
                <div
                    className={`position-fixed top-0 end-0 m-4 alert alert-${toast.type === "danger" ? "danger" : "success"} border-0 shadow rounded-3 px-4 py-3`}
                    style={{ zIndex: 9999, minWidth: 280 }}
                >
                    {toast.msg}
                </div>
            )}

            {/* Modals */}
            {assignModal && <AssignQuoteModal quote={assignModal} onClose={() => setAssignModal(null)} onSave={handleAssign} users={users} />}
            {followUpModal && <FollowUpModal quote={followUpModal} onClose={() => setFolowUpModal(null)} onSave={handleFollowUp} />}
            {imageModal && <AddImageModal quote={imageModal} onClose={() => setImageModal(null)} onSave={handleImageSave} />}
            {updateModal && <UpdateModal quote={updateModal} onClose={() => setUpdateModal(null)} onSave={handleUpdate} Services={service} />}
            {deleteModal && <DeleteModal quote={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} />}
            {<LogsModal
                show={showModal}
                onClose={() => setShowModal(false)}
                logs={selectedRow?.logs || []}
                quoteId={selectedRow?.quote_id}
            />}
            {/* ── Stats row ── */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total Quotes", value: quotes.length, icon: "📋", color: "primary" },
                    { label: "Approved", value: approvedCount, icon: "✅", color: "success" },
                    { label: "Cold Lead", value: coldLeadCount, icon: "⏳", color: "warning" },
                    { label: "Total Value", value: fmt(totalQuoted), icon: "💰", color: "primary", isText: true },
                ].map((s) => (
                    <div key={s.label} className="col-6 col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 px-4 py-3 d-flex flex-row align-items-center gap-3">
                            <div
                                className={`d-flex align-items-center justify-content-center bg-${s.color} bg-opacity-10 rounded-3 flex-shrink-0`}
                                style={{ width: 44, height: 44, fontSize: 22 }}
                            >
                                {s.icon}
                            </div>
                            <div>
                                <div className={`fw-bold ${s.isText ? "fs-6" : "fs-5"} text-${s.color === "warning" ? "dark" : s.color} font-monospace`}>
                                    {s.value}
                                </div>
                                <div className="text-secondary small">{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main card ── */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

                {/* Toolbar */}
                <div className="card-header bg-white border-bottom border-primary border-opacity-25 px-4 py-3">
                    <div className="row g-2 align-items-center">

                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-primary">🔍</span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Search client, email..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <div className="d-flex flex-wrap gap-2">
                                {ALL_STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setStatus(s); setPage(1); }}
                                        className={`btn btn-sm rounded-pill px-3 ${statusFilter === s ? "btn-primary" : "btn-outline-primary"}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-12 col-md-2 d-flex align-items-center justify-content-md-end gap-3">
                            <span className="text-secondary small">{filtered.length} quote{filtered.length !== 1 ? "s" : ""}</span>
                            {/* <a href="/dashboard/quote/create" className="btn btn-primary btn-sm rounded-3 px-3 text-nowrap">+ New Quote</a> */}
                        </div>

                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-primary">
                            <tr>
                                <th className="ps-4" style={{ width: 44 }}>
                                    <input type="checkbox" className="form-check-input" />
                                </th>
                                <th role="button" className="user-select-none" onClick={() => toggleSort("id")}>
                                    Quote ID <SortArrow field="id" />
                                </th>
                                <th role="button" className="user-select-none" onClick={() => toggleSort("clientName")}>
                                    Client <SortArrow field="clientName" />
                                </th>
                                <th className="d-none d-lg-table-cell">Contact</th>
                                {/* <th className="d-none d-md-table-cell">Services</th> */}
                                {/* <th role="button" className="user-select-none text-end" onClick={() => toggleSort("calculatedAmount")}>
                                    Calculated <SortArrow field="calculatedAmount" />
                                </th> */}
                                <th role="button" className="user-select-none text-end" onClick={() => toggleSort("quotedAmount")}>
                                    Quoted <SortArrow field="quotedAmount" />
                                </th>
                                <th role="button" className="user-select-none text-center" onClick={() => toggleSort("status")}>
                                    Status <SortArrow field="status" />
                                </th>
                                <th role="button" className="user-select-none d-none d-lg-table-cell" onClick={() => toggleSort("createdAt")}>
                                    Date <SortArrow field="createdAt" />
                                </th>
                                <th className="text-center" >Job Status</th>
                                <th className="text-center" style={{ minWidth: 170 }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>
                                        <div className="text-center py-5 text-secondary">
                                            <div className="mb-2" style={{ fontSize: 40 }}>📋</div>
                                            <p className="mb-0 fw-semibold">No quotes found</p>
                                            <p className="small mb-0">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((quote) => (
                                    <tr key={quote.id}>

                                        <td className="ps-4">
                                            <input type="checkbox" className="form-check-input" />
                                        </td>

                                        {/* Quote ID */}
                                        <td onClick={() => handleRowClick(quote.id)}>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-primary bg-opacity-10 text-primary font-monospace px-2 py-2 rounded-3 small fw-semibold">
                                                    {quote.id}
                                                </span>
                                                {quote.imageUrl && <span title="Has image" style={{ fontSize: 13 }}>🖼️</span>}
                                            </div>
                                        </td>

                                        {/* Client */}
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {/* <div
                                                    className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold flex-shrink-0"
                                                    style={{ width: 34, height: 34, fontSize: 12 }}
                                                >
                                                    {getInitials(quote.clientName)}
                                                </div> */}
                                                <div>
                                                    <div className="fw-semibold text-dark small">{quote.clientName}</div>
                                                    <div className="text-secondary font-monospace" style={{ fontSize: 11 }}>{quote.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="d-none d-lg-table-cell">
                                            <div className="small text-dark">{quote.mobile}</div>
                                            {/* <div className="text-secondary" style={{ fontSize: 11 }}>{quote.address}</div> */}
                                        </td>

                                        {/* Quoted */}
                                        <td className="text-end">
                                            <span className="fw-semibold text-dark small font-monospace">{fmt(quote.quotedAmount)}</span>
                                        </td>

                                        {/* Status */}
                                        <td className="text-center">
                                            <span
                                                className="badge text-white rounded-pill px-3 py-2"
                                                style={{ background: STATUS_COLOR[quote.status] ?? "#374151" }}
                                            >
                                                {quote.status}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="d-none d-lg-table-cell">
                                            <span className="text-secondary small">{quote.createdAt}</span>
                                        </td>

                                        {/* Jobstatus */}
                                        <td className="text-center">
                                            <span
                                                className={`${STATUS_BADGE[quote.jobStatus]?.className ?? "badge text-white"} rounded-pill px-3 py-2`}
                                                style={{ background: STATUS_COLOR[quote.jobStatus] ?? "#374151" }}
                                            >
                                                {quote.jobStatus}
                                            </span>
                                        </td>

                                        {/* ── Actions ── */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">

                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-5 d-flex align-items-center gap-1 px-2"
                                                    title="Follow Up"
                                                    onClick={() => setFolowUpModal(quote)}
                                                >
                                                    <span>📞</span>
                                                </button>


                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-5 d-flex align-items-center gap-1 px-2"
                                                    title="Send Email"
                                                    onClick={() => {
                                                        setCurrentQuote(quote);
                                                        setEmailSubject("Your Quotation from GS Bond Cleaning");
                                                        setCustomMessage("");
                                                        setShowEmailModal(true);
                                                    }}
                                                >
                                                    <span>📧</span>
                                                </button>




                                                {/* Assign Quote */}
                                                {quote.status == "Approved" && <button
                                                    className="btn btn-sm btn-outline-primary rounded-5 d-flex align-items-center gap-1 px-2"
                                                    title="Asign Job"
                                                    onClick={() => setAssignModal(quote)}
                                                >
                                                    <span>👷</span>
                                                    {/* <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Assign Job</span> */}
                                                </button>}


                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Quote"
                                                    onClick={() => { handleQuoteGeneration({ clientName: quote.clientName, email: quote.email, mobile: quote.email, address: quote.address, zip: quote.zip, quotatedAmount: quote.quotedAmount, advanceAmount: quote.advanceAmount, calculatedAmount: quote.calculatedAmount, dueAmount: quote.calculatedAmount, status: quote.status, services: quote.services }) }}
                                                >
                                                    <span>📄</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 10 }}>Quote</span>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Invoice"
                                                    onClick={() => { redirect(`/dashboard/quote/one/${quote.id}`) }}
                                                >
                                                    <span>🧾</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 10 }}>Invoice</span>
                                                </button>
                                                {/* 
                                                

                                                {/* Update */}
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Update Quote"
                                                    onClick={() => setUpdateModal(quote)}
                                                >
                                                    <span>✏️</span>
                                                    {/* <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Edit</span> */}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Delete Quote"
                                                    onClick={() => setDeleteModal(quote)}
                                                >
                                                    <span>🗑️</span>
                                                    {/* <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Delete</span>- */}
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="card-footer bg-white border-top border-primary border-opacity-25 d-flex flex-wrap justify-content-between align-items-center gap-3 px-4 py-3">
                        <span className="text-secondary small">
                            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} quotes
                        </span>
                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link rounded-3 border-primary text-primary" onClick={() => setPage((p) => p - 1)}>← Prev</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                                        <button className="page-link rounded-3" onClick={() => setPage(p)}>{p}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link rounded-3 border-primary text-primary" onClick={() => setPage((p) => p + 1)}>Next →</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}



            </div>


            {/* Email Preview Modal */}
            {showEmailModal && currentQuote && (
                <>
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-xl modal-dialog-scrollable">
                            <div className="modal-content">

                                {/* Header */}
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">
                                        📧 Preview & Edit Email
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => setShowEmailModal(false)}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className="row g-4">

                                        {/* Left: Edit Panel */}
                                        <div className="col-md-4">
                                            <div className="card h-100 border-0 bg-light">
                                                <div className="card-body">
                                                    <h6 className="fw-bold text-primary mb-3">✏️ Edit Details</h6>

                                                    {/* To */}
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold small">To</label>
                                                        <input
                                                            type="email"
                                                            className="form-control form-control-sm"
                                                            value={currentQuote.email}
                                                            disabled
                                                        />
                                                        <div className="form-text">Recipient cannot be changed</div>
                                                    </div>

                                                    {/* Subject */}
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold small">Subject</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={emailSubject}
                                                            onChange={(e) => setEmailSubject(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Custom Message */}
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold small">
                                                            Custom Message <span className="text-muted">(optional)</span>
                                                        </label>
                                                        <textarea
                                                            className="form-control form-control-sm"
                                                            rows={5}
                                                            placeholder="Add a personal message to the client..."
                                                            value={customMessage}
                                                            onChange={(e) => setCustomMessage(e.target.value)}
                                                        />
                                                        <div className="form-text">This will appear in the email body.</div>
                                                    </div>

                                                    {/* Quote Summary */}
                                                    <div className="border rounded p-3 bg-white">
                                                        <h6 className="fw-bold small mb-2 text-secondary">📋 Quote Summary</h6>
                                                        <div className="small text-muted mb-1">
                                                            <strong>Client:</strong> {currentQuote.clientName}
                                                        </div>
                                                        <div className="small text-muted mb-1">
                                                            <strong>Services:</strong> {currentQuote.services.length}
                                                        </div>
                                                        <div className="small fw-bold text-primary">
                                                            <strong>Total:</strong> ${currentQuote.dueAmount}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Email Preview */}
                                        <div className="col-md-8">
                                            <h6 className="fw-bold text-primary mb-2">👁️ Email Preview</h6>
                                            <div
                                                className="border rounded overflow-auto"
                                                style={{ height: "520px", backgroundColor: "#f4f7fa" }}
                                            >
                                                <iframe
                                                    srcDoc={buildEmailHTML(currentQuote, customMessage)}
                                                    style={{ width: "100%", height: "100%", border: "none" }}
                                                    title="Email Preview"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer bg-light">
                                    <span className="text-muted small me-auto">
                                        Sending to: <strong>{currentQuote.email}</strong>
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowEmailModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary d-flex align-items-center gap-2"
                                        onClick={() => sendEmail(currentQuote, customMessage, emailSubject)}
                                    >
                                        📤 Send Email
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </>
            )}

        </>
    );
}
