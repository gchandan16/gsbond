"use client";
import axios from "axios";
import { redirect } from "next/navigation";
// ✅ CLIENT COMPONENT (CSR) — all interactivity: search, filter, modals, actions

import { useState, useMemo, useRef, useEffect } from "react";

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

const ALL_STATUSES = ["All", "Hot-lead", "Cold-lead", "Approved", "Rejected"];




// ─────────────────────────────────────Follow Up model ────────────────────────────────────────────────────

function FollowUpModal({ quote, onClose, onSave }) {

    const [form, setForm] = useState({
        followUpDate: "",
        followUpTime: "",
        priority: "medium",
        note: "",
        quoteId: quote.id,
    });

    const [followUps, setFollowUps] = useState([]);
    const [loadingFollowUps, setLoadingFollowUps] = useState(true);
    const [activeTab, setActiveTab] = useState("new"); // "new" | "history"

    const priorityOptions = [
        { value: "low", label: "Low", color: "success" },
        { value: "medium", label: "Medium", color: "warning" },
        { value: "high", label: "High", color: "danger" },
    ];

    const priorityBadge = (p) => ({
        low: "bg-success bg-opacity-10 text-success",
        medium: "bg-warning bg-opacity-10 text-warning",
        high: "bg-danger bg-opacity-10 text-danger",
    }[p] || "bg-secondary bg-opacity-10 text-secondary");

    // ── Fetch previous follow-ups ─────────────────────────────────────────
    useEffect(() => {
        if (!quote?.id) return;
        const fetchFollowUps = async () => {
            try {
                setLoadingFollowUps(true);
                const token = localStorage.getItem("authToken");
                const res = await axios.get(
                    `/api/followUp?quoteId=${quote.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFollowUps(res.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch follow-ups", err);
            } finally {
                setLoadingFollowUps(false);
            }
        };
        fetchFollowUps();
    }, [quote?.id]);

    // console.log("followUps", followUps);

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
                                <h6 className="fw-bold text-dark mb-0">Follow-Up</h6>
                            </div>
                            <button type="button" className="btn-close ms-auto" onClick={onClose} />
                        </div>
                    </div>

                    {/* ── Quote ID Banner ───────────────────────────────────── */}
                    <div className="px-4 pt-3">
                        <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-secondary text-uppercase fw-semibold" style={{ fontSize: 10, letterSpacing: "0.07em" }}>Quote ID</div>
                                <div className="fw-bold text-primary font-monospace" style={{ fontSize: 18 }}>{quote?.id || "—"}</div>
                            </div>
                            <div className="text-end">
                                <div className="text-secondary text-uppercase fw-semibold" style={{ fontSize: 10, letterSpacing: "0.07em" }}>Client</div>
                                <div className="fw-semibold text-dark small">{quote?.clientName || "—"}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ─────────────────────────────────────────────── */}
                    <div className="px-4 pt-3">
                        <div className="d-flex gap-0 border rounded-3 overflow-hidden" style={{ fontSize: 13 }}>
                            <button
                                type="button"
                                className={`btn btn-sm flex-grow-1 rounded-0 fw-semibold ${activeTab === "new" ? "btn-primary" : "btn-light text-secondary"}`}
                                onClick={() => setActiveTab("new")}
                            >
                                🔔 New Reminder
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm flex-grow-1 rounded-0 fw-semibold border-start ${activeTab === "history" ? "btn-primary" : "btn-light text-secondary"}`}
                                onClick={() => setActiveTab("history")}
                            >
                                🕒 History
                                {followUps.length > 0 && (
                                    <span className={`badge rounded-pill ms-2 ${activeTab === "history" ? "bg-white text-primary" : "bg-primary text-white"}`}
                                        style={{ fontSize: 10 }}>
                                        {followUps.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Body ─────────────────────────────────────────────── */}
                    <div className="modal-body px-4 py-3">

                        {/* NEW REMINDER TAB */}
                        {activeTab === "new" && (
                            <div className="row g-3">
                                <div className="col-7">
                                    <label className="form-label small fw-semibold text-dark mb-1">
                                        Reminder Date <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">📅</span>
                                        <input type="date" className="form-control border-start-0 rounded-end-3"
                                            value={form.followUpDate}
                                            min={new Date().toISOString().slice(0, 10)}
                                            onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
                                    </div>
                                </div>

                                <div className="col-5">
                                    <label className="form-label small fw-semibold text-dark mb-1">
                                        Time <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">⏰</span>
                                        <input type="time" className="form-control border-start-0 rounded-end-3"
                                            value={form.followUpTime}
                                            onChange={(e) => setForm({ ...form, followUpTime: e.target.value })} />
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label small fw-semibold text-dark mb-1">Priority</label>
                                    <div className="d-flex gap-2">
                                        {priorityOptions.map((p) => (
                                            <button key={p.value} type="button"
                                                className={`btn btn-sm flex-grow-1 rounded-3 fw-semibold ${form.priority === p.value ? `btn-${p.color}` : `btn-outline-${p.color}`}`}
                                                style={{ fontSize: 12 }}
                                                onClick={() => setForm({ ...form, priority: p.value })}>
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label small fw-semibold text-dark mb-1">Note</label>
                                    <textarea className="form-control form-control-sm rounded-3" rows={3}
                                        placeholder="Add a follow-up note..."
                                        value={form.note}
                                        maxLength={300}
                                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                                        style={{ resize: "none" }} />
                                    <div className="text-end text-secondary mt-1" style={{ fontSize: 10 }}>
                                        {form.note.length} / 300
                                    </div>
                                </div>

                                {form.followUpDate && form.followUpTime && (
                                    <div className="col-12">
                                        <div className="bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center gap-2">
                                            <span>✅</span>
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
                        )}

                        {/* HISTORY TAB */}
                        {activeTab === "history" && (
                            <div style={{ maxHeight: 320, overflowY: "auto" }}>
                                {loadingFollowUps ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                                        <div className="text-secondary small mt-2">Loading history...</div>
                                    </div>
                                ) : followUps.length === 0 ? (
                                    <div className="text-center py-4">
                                        <div style={{ fontSize: 28 }}>📭</div>
                                        <div className="text-secondary small mt-1">No follow-ups yet</div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {followUps.map((f, i) => (
                                            <div key={i} className="border rounded-3 px-3 py-2 bg-light">
                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={`badge rounded-pill px-2 py-1 text-capitalize ${priorityBadge(f.priority)}`}
                                                            style={{ fontSize: 10 }}>
                                                            {f.priority || "—"}
                                                        </span>
                                                        <span className="text-dark fw-semibold small">
                                                            {f.reminderDate
                                                                ? new Date(`${f.reminderDate.slice(0, 10)}T${f.reminderTime}`).toLocaleString("en-US", {
                                                                    weekday: "short", month: "short", day: "numeric",
                                                                    hour: "2-digit", minute: "2-digit",
                                                                })
                                                                : "—"}
                                                        </span>
                                                    </div>
                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill" style={{ fontSize: 10 }}>
                                                        #{f.id}
                                                    </span>
                                                </div>
                                                {f.note && (
                                                    <div className="text-secondary small mt-1" style={{ lineHeight: 1.4 }}>
                                                        💬 {f.note}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Footer ───────────────────────────────────────────── */}
                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4 btn-sm" onClick={onClose}>
                            Cancel
                        </button>
                        {activeTab === "new" && (
                            <button type="button"
                                className="btn btn-warning rounded-3 px-4 btn-sm fw-semibold text-dark"
                                disabled={!isValid}
                                onClick={() => { onSave(quote.id, form); onClose(); }}>
                                🔔 Set Reminder
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}




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
    });

    // console.table(form);

    const [services, setServices] = useState(Services);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // console.table( form);





    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [customStatusInput, setCustomStatusInput] = useState("");
    const [statusOptions, setStatusOptions] = useState([
        "Hot-lead", "Cold-lead", "Approved", "Cancelled", "Initiated"
    ]);




    const [jobStatusDropdownOpen, setJobStatusDropdownOpen] = useState(false);
    const [customJobStatusInput, setCustomJobStatusInput] = useState("");
    const [jobStatusOptions, setJobStatusOptions] = useState(["Assigned", "Completed", "Pending"]);


    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
                                <input className="form-control rounded-3" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small fw-semibold text-dark mb-1">Address</label>
                                <input className="form-control rounded-3" value={form.address} onChange={(e) => set("address", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Post code</label>
                                <input className="form-control rounded-3" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Assign To</label>
                                <input className="form-control rounded-3" value={form.assignerName} disabled />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Cleaner Email</label>
                                <input className="form-control rounded-3" value={form.assignerEmail} disabled />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Time Taken</label>
                                <input className="form-control rounded-3" value={`${((form.totalTimeTaken || 0) / 60).toFixed(2)} hours`} disabled />
                            </div>
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
                                        onChange={(e) => set("scheduledDate", e.target.value)}
                                    />
                                </div>
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



// ── Main Component ────────────────────────────────────────────────────────────
export default function CallScheduled({ initialQuotes, services, userList }) {
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


    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        setToken(storedToken);
    }, []);





    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }



    async function handleUpdate(id, form) {
        setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, ...form } : q));

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote/${id}`,
                {
                    name: form.clientName,
                    email: form.email,
                    mobile: form.mobile,
                    address: form.address,
                    zip: form.zip,
                    quotatedAmount: form.quotedAmount,
                    calculatedAmount: form.calculatedAmount,
                    advanceAmount: form.advanceAmount,
                    status: form.status,
                    jobStatus: form.jobStatus,
                    services: form.services,
                    scheduledDate: form.scheduledDate,
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
    const pendingCount = quotes.filter((q) => q.status === "Pending" || q.status === "Sent").length;





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
            {followUpModal && <FollowUpModal quote={followUpModal} onClose={() => setFolowUpModal(null)} onSave={handleFollowUp} />}
            {updateModal && <UpdateModal quote={updateModal} onClose={() => setUpdateModal(null)} onSave={handleUpdate} Services={service} />}
            {deleteModal && <DeleteModal quote={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} />}

            {/* ── Stats row ── */}
            {/* <div className="row g-3 mb-4">
                {[
                    { label: "Total Quotes", value: quotes.length, icon: "📋", color: "primary" },
                    { label: "Approved", value: approvedCount, icon: "✅", color: "success" },
                    { label: "Pending / Sent", value: pendingCount, icon: "⏳", color: "warning" },
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
            </div> */}

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
                            {/* <span className="text-secondary small">{filtered.length} quote{filtered.length !== 1 ? "s" : ""}</span> */}
                            <a href="/dashboard/quote/create" className="btn btn-primary btn-sm rounded-3 px-3 text-nowrap">+ New Quote</a>
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
                                        <td>
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
                                                {/* <button
                                                    className="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Delete Quote"
                                                    onClick={() => setDeleteModal(quote)}
                                                >
                                                    <span>🗑️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Delete</span>-
                                                </button> */}

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
        </>
    );
}
