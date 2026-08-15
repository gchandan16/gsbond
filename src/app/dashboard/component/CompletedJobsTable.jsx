"use client";
import axios from "axios";
import { redirect } from "next/navigation";
// ✅ CLIENT COMPONENT (CSR) — all interactivity: search, filter, modals, actions

import { useState, useMemo, useRef, useEffect } from "react";

import Image from "next/image";

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
    "Fresh": "badge text-white",
    "Reclean": "badge text-white",
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
    "Reject": "#e5a5a5",
    "Fresh": "#aff437",    // teal (finished, stable)
    "Reclean": "#e79489"    // teal (finished, stable)
};

const ALL_STATUSES = ["All", "Approved", "Fresh", "Reclean"];

// ── Update Modal ──────────────────────────────────────────────────────────────


function UpdateModal({ quote, onClose, onSave }) {
    // console.table(quote)

    const [form, setForm] = useState({
        clientName: quote.clientName,
        email: quote.email,
        mobile: quote.mobile,
        address: quote.address,
        zip: quote.zip,
        services: quote.services,
        quotedAmount: quote.quotatedAmount,
        advanceAmount: quote.advanceAmount,
        dueAmount: quote.dueAmount,
        calculatedAmount: quote.calculatedAmount,
        status: quote.status,
        jobStatus: quote.jobStatus,
        scheduledDate: quote.scheduledDate,
        shareToken: quote.shareToken,
        suburbs: quote.suburbs,
        timerStarted: quote.timerStarted,
        timerEnded: quote.timerEnded,
        note: quote.note,
        beforeImages: quote.beforeImages,
        afterImages: quote.afterImages,
        operatorAmount: quote.operatorAmount,
    });

    const [selectedImage, setSelectedImage] = useState(null);

    // console.table(form);
    const role = JSON.parse(localStorage.getItem("user"));

    // const [services, setServices] = useState(Services);


    // console.table(form);



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
                                <h6 className="modal-title fw-bold text-dark mb-0">View Job</h6>
                                <p className="text-secondary mb-0 small">{quote.id}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body px-4 py-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Client Name</label>
                                <input className="form-control rounded-3" value={form.clientName} disabled onChange={(e) => set("clientName", e.target.value)} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Email</label>
                                <input type="email" className="form-control rounded-3" disabled value={form.email} onChange={(e) => set("email", e.target.value)} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Mobile</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 rounded-start-3 fw-semibold px-2">
                                        +61
                                    </span>
                                    <input className="form-control rounded-end-3" disabled value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small fw-semibold text-dark mb-1">Address</label>
                                <input className="form-control rounded-3" value={form.address} onChange={(e) => set("address", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Suburb</label>
                                <input className="form-control rounded-3" disabled value={form.suburbs} onChange={(e) => set("suburbs", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Post code</label>
                                <input className="form-control rounded-3" disabled value={form.zip} onChange={(e) => set("zip", e.target.value)} />
                            </div>
                            {form.jobStatus == "Fresh" && <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Price</label>
                                <input className="form-control rounded-3" disabled value={`${form.operatorAmount}$`} onChange={(e) => set("zip", e.target.value)} />
                            </div>}
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


                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {role?.role == "admin" && (
                                <>
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
                                                disabled
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
                                                disabled
                                            />
                                        </div>
                                    </div>

                                </>
                            )}



                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Scheduled Date</label>
                                <input className="form-control rounded-3" disabled value={form.scheduledDate} onChange={(e) => set("zip", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Job Type</label>
                                <input className="form-control rounded-3" disabled value={form.jobStatus} onChange={(e) => set("zip", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Job Status</label>
                                <input className="form-control rounded-3" disabled value="Completed" onChange={(e) => set("zip", e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Time Taken</label>
                                <input className="form-control rounded-3" disabled value={form.timerStarted && form.timerEnded
                                    ? `${(
                                        (new Date(form.timerEnded) - new Date(form.timerStarted)) /
                                        (1000 * 60 * 60)
                                    ).toFixed(2)} hrs`
                                    : ""} />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-semibold text-dark mb-1">Note (from cleaner)</label>
                                <input className="form-control rounded-3" disabled value={form.note} />
                            </div>

                        </div>
                    </div>

                    

                    {/* BEFORE IMAGES */}

                    <h5 className="fw-bold mb-3 mx-4">
                        Before Images
                    </h5>

                    <div className="d-flex flex-wrap gap-3 mb-5 ms-4">

                        {
                            form.beforeImages.length > 0
                                ? form.beforeImages.map((img, index) => (

                                    <div
                                        key={index}
                                        className="
                        position-relative
                        overflow-hidden
                        rounded-4
                        shadow
                    "
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            cursor: "pointer",
                                            transition: "0.3s"
                                        }}
                                        onClick={() => setSelectedImage(img)}
                                    >

                                        <Image
                                            src={img}
                                            alt={`before-${index}`}
                                            fill
                                            className="object-fit-cover"
                                        />

                                        <div
                                            className="
                            position-absolute
                            top-0
                            start-0
                            w-100
                            h-100
                            d-flex
                            justify-content-center
                            align-items-center
                        "
                                            style={{
                                                background: "rgba(0,0,0,0.25)"
                                            }}
                                        >
                                            <span className="text-white fw-semibold">
                                            
                                            </span>
                                        </div>

                                    </div>

                                ))
                                : (
                                    <p className="text-muted mx-4">
                                        No Images Available
                                    </p>
                                )
                        }

                    </div>
                    {/* AFTER IMAGES */}

                    <h5 className="fw-bold mb-3 mx-4">
                        After Images
                    </h5>

                    <div className="d-flex flex-wrap gap-3 ms-4">

                        {
                            form.afterImages.length > 0
                                ? form.afterImages.map((img, index) => (

                                    <div
                                        key={index}
                                        className="
                        position-relative
                        overflow-hidden
                        rounded-4
                        shadow
                    "
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            cursor: "pointer",
                                            transition: "0.3s"
                                        }}
                                        onClick={() => setSelectedImage(img)}
                                    >

                                        <Image
                                            src={img}
                                            alt={`after-${index}`}
                                            fill
                                            className="object-fit-cover"
                                        />

                                        <div
                                            className="
                            position-absolute
                            top-0
                            start-0
                            w-100
                            h-100
                            d-flex
                            justify-content-center
                            align-items-center
                        "
                                            style={{
                                                background: "rgba(0,0,0,0.25)"
                                            }}
                                        >
                                            <span className="text-white fw-semibold">
                                                
                                            </span>
                                        </div>

                                    </div>

                                ))
                                : (
                                    <p className="text-muted mx-4">
                                        No Images Available
                                    </p>
                                )
                        }

                    </div>

                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        {/* <button type="button" className="btn btn-primary rounded-3 px-4 fw-semibold" onClick={() => { onSave(quote.id, form); onClose(); }}>
                            Update Quote
                        </button> */}
                    </div>
                </div>
            </div>

            {/* IMAGE PREVIEW MODAL */}

            {
                selectedImage && (
                    <div
                        className="
                position-fixed
                top-0
                start-0
                w-100
                h-100
                d-flex
                justify-content-center
                align-items-center
            "
                        style={{
                            background: "rgba(0,0,0,0.75)",
                            zIndex: 9999,
                            backdropFilter: "blur(4px)"
                        }}
                        onClick={() => setSelectedImage(null)}
                    >

                        <div
                            className="position-relative"
                            style={{
                                width: "80%",
                                maxWidth: "900px",
                                height: "80%"
                            }}
                        >
                            <Image
                                src={selectedImage}
                                alt="preview"
                                fill
                                className="rounded-4 object-fit-contain"
                            />

                            <button
                                className="
                        btn
                        btn-light
                        position-absolute
                        top-0
                        end-0
                        m-3
                        rounded-circle
                    "
                                onClick={() => setSelectedImage(null)}
                            >
                                ✕
                            </button>
                        </div>

                    </div>
                )
            }
        </div>
    );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function CompletedJobsTable({ initialQuotes }) {
    const [quotes, setQuotes] = useState(initialQuotes);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [sortField, setSortField] = useState("createdAt");
    const [sortDir, setSortDir] = useState("desc");
    const [currentPage, setPage] = useState(1);
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

    // console.log("quotes",quotes);



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
            console.table(form);

            showToast("Quote updated successfully! ✏️");
            // window.location.reload();
        } catch (error) {
            // revert optimistic update on failure
            setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, ...originalQuote } : q));
            showToast("Failed to update quote. Please try again.");
            console.error(error?.response?.data || error.message);
        }
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
        if (statusFilter !== "All") data = data.filter((q) =>
            q.status === statusFilter || q.jobStatus == statusFilter
        );
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
    const freshCount = quotes.filter((q) => q.jobStatus == "Fresh").length;
    const pendingCount = quotes.filter((q) => q.jobStatus == "Reclean").length;

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
            {updateModal && <UpdateModal quote={updateModal} onClose={() => setUpdateModal(null)} onSave={handleUpdate} />}

            {/* ── Stats row ── */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total Quotes", value: quotes.length, icon: "📋", color: "primary" },
                    { label: "Approved", value: approvedCount, icon: "✅", color: "success" },
                    { label: "Fresh Jobs", value: freshCount, icon: "⏳", color: "warning" },
                    { label: "Reclean Jobs", value: pendingCount, icon: "⏳", color: "primary" },
                    // { label: "Total Value", value: fmt(totalQuoted), icon: "💰", color: "primary", isText: true },
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
                                    Job ID <SortArrow field="id" />
                                </th>
                                <th role="button" className="user-select-none" onClick={() => toggleSort("clientName")}>
                                    Client <SortArrow field="clientName" />
                                </th>
                                <th className="d-none d-lg-table-cell">Contact</th>
                                {/* <th className="d-none d-md-table-cell">Services</th> */}
                                {/* <th role="button" className="user-select-none text-end" onClick={() => toggleSort("calculatedAmount")}>
                                    Calculated <SortArrow field="calculatedAmount" />
                                </th> */}
                                {/* <th role="button" className="user-select-none text-end" onClick={() => toggleSort("quotedAmount")}>
                                    Quoted <SortArrow field="quotedAmount" />
                                </th> */}
                                <th role="button" className="user-select-none text-center" onClick={() => toggleSort("status")}>
                                    Job Status <SortArrow field="status" />
                                </th>
                                <th role="button" className="user-select-none d-none d-lg-table-cell" onClick={() => toggleSort("createdAt")}>
                                    Scheduled Date <SortArrow field="createdAt" />
                                </th>
                                <th className="text-center" >Job Type</th>
                                <th className="text-center" style={{ minWidth: 170 }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>
                                        <div className="text-center py-5 text-secondary">
                                            <div className="mb-2" style={{ fontSize: 40 }}>📋</div>
                                            <p className="mb-0 fw-semibold">No Jobs found</p>
                                            <p className="small mb-0">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((quote, index) => (
                                    <tr key={index}>

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
                                            <span className="text-secondary small">{quote.scheduledDate}</span>
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

                                                {/* Update */}
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="View Job"
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
