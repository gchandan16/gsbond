"use client";
import axios from "axios";
import { redirect } from "next/navigation";
// ✅ CLIENT COMPONENT (CSR) — all interactivity: search, filter, modals, actions

import { useState, useMemo, useRef, useEffect } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);

const STATUS_BADGE = {
    "Hot-lead": "badge text-white", // red
    "Cold-lead": "badge text-white",  // blue
    "Approved": "badge text-white",  // green
    "Rejected": "badge text-white",  // crimson
    "Pending": "badge text-white",  // orange
    "Cancelled": "badge text-white",  // slate
    "Initiated": "badge text-white",  // violet
    "Assigned": "badge text-white",  // pink
    "Completed": "badge text-white",  // teal
};
const STATUS_COLOR = {
    "Hot-lead": "#b91c1c",  // dark red
    "Cold-lead": "#1d4ed8",  // dark blue
    "Approved": "#15803d",  // dark green
    "Rejected": "#9f1239",  // dark crimson
    "Pending": "#e3a936",  // dark orange
    "Cancelled": "#334155",  // dark slate
    "Initiated": "#27ff5dca",  // dark violet
    "Assigned": "#be185d",  // dark pink
    "Completed": "#0affeb",  // dark teal
};

const ALL_STATUSES = ["All", "Hot-lead", "Cold-lead", "Approved", "Rejected"];



function getInitials(name) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
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
export default function QuoteCallSchedule({ initialQuotes, services, userList }) {
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

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign`,
            {
                quotes: [id],
                operators: [form.assignedUser],
                otherDetails: form.scheduleDate,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        setAssignModal(null);
        showToast("Assigned job successfully");

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
            return q.clientName.toLowerCase().includes(s) || q.email.toLowerCase().includes(s);
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
            {deleteModal && <DeleteModal quote={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} />}

            {/* ── Stats row ── */}
            <div className="row g-3 mb-4">
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
                                            <p className="mb-0 fw-semibold">No Jobs found</p>
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

                                        {/* Services */}
                                        {/* <td className="d-none d-md-table-cell">
                                            <span className="text-dark small">{quote.services}</span>
                                            {quote.discount > 0 && (
                                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill ms-2 px-2" style={{ fontSize: 10 }}>
                                                    {quote.discount}% off
                                                </span>
                                            )}
                                        </td> */}

                                        {/* Calculated */}
                                        {/* <td className="text-end">
                                            <span className="small text-secondary font-monospace text-decoration-line-through">
                                                {fmt(quote.calculatedAmount)}
                                            </span>
                                        </td> */}

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

                                                {/* Assign Quote */}
                                                {quote.status != "Assigned" && <button
                                                    className="btn btn-sm btn-outline-primary rounded-5 d-flex align-items-center gap-1 px-2"
                                                    title="Asign Job"
                                                    onClick={() => setAssignModal(quote)}
                                                >
                                                    <span>👷</span>
                                                    {/* <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Assign Job</span> */}
                                                </button>}
                                                {/* Add Image */}
                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Quote"
                                                    onClick={() => { handleQuoteGeneration({clientName:quote.clientName,email:quote.email,mobile:quote.email,address:quote.address,zip:quote.zip,quotatedAmount:quote.quotedAmount,advanceAmount:quote.advanceAmount,calculatedAmount:quote.calculatedAmount,dueAmount:quote.calculatedAmount,status:quote.status,services:quote.services}) }}
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
                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Add Image"
                                                    onClick={() => setImageModal(quote)}
                                                >
                                                    <span>🖼️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 10 }}>After Image</span>
                                                </button> */}

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
        </>
    );
}
