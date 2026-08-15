"use client";
import axios from "axios";
// ✅ CLIENT COMPONENT (CSR) — all interactivity: search, filter, modals, actions

import { useState, useMemo, useRef, useEffect } from "react";

import { usePathname } from "next/navigation";

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

const ALL_STATUSES = ["All", "Fresh", "Reclean"];


function getInitials(name) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}



function UpdateModal({ quote, onClose, onSave, Services, token }) {
    // console.table(Services)
    const [tkn, setTkn] = useState(token);
    const [form, setForm] = useState({
        mainId: quote.mainId,
        id: quote.id,
        clientName: quote.clientName,
        email: quote.email,
        mobile: quote.mobile,
        address: quote.address,
        zip: quote.zip,
        services: quote.services,
        status: quote.status,
        jobStatus: quote.jobStatus,
        scheduledDate: quote.scheduledDate,
        timerStarted: quote.timerStarted || null, // ✅
        timerEnded: quote.timerEnded || null,
        remark: quote.remark || '',
        acceptedStatus: quote.acceptedStatus,
        suburbs: quote.suburbs,
        specialRemark: quote.specialRemark,
    });

    const [services, setServices] = useState(Services);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // console.log(form);





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
                                <h6 className="modal-title fw-bold text-dark mb-0">Update JOB</h6>
                                <p className="text-secondary mb-0 small">{quote.id}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body px-4 py-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Client Name</label>
                                <input className="form-control rounded-3" value={form.clientName} disabled />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Email</label>
                                <input type="email" className="form-control rounded-3" value={form.email} disabled />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Mobile</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 rounded-start-3 fw-semibold px-2">
                                        +61
                                    </span>
                                    <input className="form-control rounded-end-3" value={form.mobile} disabled />
                                </div>
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small fw-semibold text-dark mb-1">Address</label>
                                <input className="form-control rounded-3" value={form.address} disabled />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Suburb</label>
                                <input className="form-control rounded-3" value={form.suburbs} disabled />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-dark mb-1">Post code</label>
                                <input className="form-control rounded-3" value={form.zip} disabled />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Remark For Cleaner</label>
                                <input className="form-control rounded-3" value={form.specialRemark} disabled />
                            </div>




                            {/* service  */}
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
                                        return (
                                            <span
                                                key={i}
                                                className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-2 d-flex align-items-center gap-1"
                                                style={{ fontSize: 12 }}
                                            >
                                                {typeof s === "object" ? s.name : s}



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




                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Scheduled Date</label>
                                <div className="position-relative">
                                    <input type="date" value={form.scheduledDate} disabled />

                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div className="d-flex gap-2">
                                    <button
                                        className={`btn btn-sm w-50 ${form.acceptedStatus === "Accept"
                                            ? "btn-success border border-success"
                                            : "btn-outline-success border border-2"
                                            }`}
                                        onClick={() =>
                                            setForm({ ...form, acceptedStatus: "Accept" })
                                        }
                                    >
                                        Accept
                                    </button>

                                    <button
                                        className={`btn btn-sm w-50 ${form.acceptedStatus === "Reject"
                                            ? "btn-danger border border-danger"
                                            : "btn-outline-danger border border-2"
                                            }`}
                                        onClick={() =>
                                            setForm({ ...form, acceptedStatus: "Reject" })
                                        }
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary rounded-3 px-4 fw-semibold" onClick={() => { onSave(quote.mainId, form); onClose(); }}>
                            Update Job
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function AssignPendingQuoteTable({ initialQuotes, services, userList }) {
    const [quotes, setQuotes] = useState(initialQuotes);
    const [service, setService] = useState(services);
    // console.log("users from component",users);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [sortField, setSortField] = useState("createdAt");
    const [sortDir, setSortDir] = useState("desc");
    const [currentPage, setPage] = useState(1);
    const [updateModal, setUpdateModal] = useState(null);
    const [toast, setToast] = useState(null);
    const perPage = 10;
    const [user, setUser] = useState({});
    const [loadingJobId, setLoadingJobId] = useState(null);
    const [actionType, setActionType] = useState("");


    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        const usr = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(usr);
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
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign`,
                {
                    mainId: id,
                    quoteId: form.id,
                    jobStatus: form.jobStatus,
                    remark: form.remark,
                    startTime: form.startTime,
                    endTime: form.endTime,
                    acceptedStatus: form.acceptedStatus,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );

            // console.log("status", form);

            showToast("Job updated successfully! ✏️");
            setQuotes((qs) => qs.filter((q) => q.id != form.id));
            // window.location.href = "/dashboard/quote/jobs";
        } catch (error) {
            // revert optimistic update on failure
            // setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, ...originalQuote } : q));
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
        if (statusFilter !== "All") data = data.filter((q) => q.jobStatus === statusFilter);
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
    const freshJobCountCount = quotes.filter((q) => q.jobStatus === "Fresh").length;
    const recleanJobCount = quotes.filter((q) => q.jobStatus === "Reclean").length;



    const pathname = usePathname();
    // console.log("pathname",pathname);


    const handleAcceptReject = async (status, mainId, id) => {
        setLoadingJobId(id);
        setActionType(status);

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign/${mainId}`,
                {
                    acceptedStatus: status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setQuotes((qs) => qs.filter((q) => q.id !== id));
            showToast(`Job is ${status}ed`);
        } catch (error) {
            showToast("Failed to update Job. Please try again.");
        } finally {
            setLoadingJobId(null);
            setActionType("");
        }
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

            {updateModal && <UpdateModal quote={updateModal} onClose={() => setUpdateModal(null)} onSave={handleUpdate} Services={service} token={token} />}

            {/* ── Stats row ── */}
            <div className="row g-2 g-md-3 mb-4">
                {[
                    { label: "Total", value: quotes.length, icon: "📋", color: "primary" },
                    { label: "Fresh Jobs", value: freshJobCountCount, icon: "✅", color: "success" },
                    { label: "Reclean Jobs", value: recleanJobCount, icon: "⏳", color: "warning" },
                ].map((s) => (
                    <div key={s.label} className="col-6 col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 px-2 px-md-4 py-2 py-md-3 d-flex flex-row align-items-center gap-2 gap-md-3">
                            <div
                                className={`d-flex align-items-center justify-content-center bg-${s.color} bg-opacity-10 rounded-3 flex-shrink-0`}
                                style={{ width: 36, height: 36, fontSize: 18 }}
                            >
                                {s.icon}
                            </div>
                            <div>
                                <div className={`fw-bold fs-6 text-${s.color === "warning" ? "dark" : s.color} font-monospace`}>
                                    {s.value}
                                </div>
                                <div className="text-secondary" style={{ fontSize: 11 }}>{s.label}</div>
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
                                    placeholder="Search client, email or ID…"
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
                            <span className="text-secondary small">{filtered.length} Job{filtered.length !== 1 ? "s" : ""}</span>
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

                                <th role="button" className="user-select-none text-center" onClick={() => toggleSort("status")}>
                                    Job Type <SortArrow field="status" />
                                </th>
                                <th role="button" className="user-select-none d-lg-table-cell" onClick={() => toggleSort("createdAt")}>
                                    Scheduled Date <SortArrow field="createdAt" />
                                </th>
                                {pathname != "/dashboard/quote/rejected-jobs" && <th className="text-center" style={{ minWidth: 170 }}>Actions</th>}
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
                                                <div
                                                    className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold flex-shrink-0"
                                                    style={{ width: 34, height: 34, fontSize: 12 }}
                                                >
                                                    {getInitials(quote.clientName)}
                                                </div>
                                                <div>
                                                    <div className="fw-semibold text-dark small">{quote.clientName}</div>
                                                    <div className="text-secondary font-monospace" style={{ fontSize: 11 }}>{quote.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="d-none d-lg-table-cell">
                                            <div className="small text-dark">{quote.mobile}</div>
                                            <div className="text-secondary" style={{ fontSize: 11 }}>{quote.address}</div>
                                        </td>



                                        {/* Status */}
                                        <td className="text-center">
                                            <span className={`${STATUS_BADGE[quote.jobStatus]?.className ?? "badge test-white"} rounded-pill px-3 py-2`}
                                                style={{ background: STATUS_COLOR[quote.jobStatus] ?? "#374151" }}>
                                                {quote.jobStatus}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="d-lg-table-cell">
                                            <span className="text-secondary small">{quote.scheduledDate}</span>
                                        </td>

                                        {/* ── Actions ── */}
                                        {pathname != "/dashboard/quote/rejected-jobs" && <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">

                                                <button
                                                    className={`btn btn-sm ${loadingJobId === quote.id && actionType === "Accept"
                                                        ? "btn-success"
                                                        : "btn-outline-success"
                                                        } rounded-3 d-flex align-items-center gap-1 px-2`}
                                                    onClick={() => handleAcceptReject("Accept", quote.mainId, quote.id)}
                                                    disabled={loadingJobId === quote.id}
                                                >     <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            width="24"
                                                            height="24"
                                                            fill="none"
                                                            stroke="green"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </span>
                                                    <span>Accept</span>
                                                </button>

                                                <button
                                                    className={`btn btn-sm ${loadingJobId === quote.id && actionType === "Reject"
                                                        ? "btn-danger"
                                                        : "btn-outline-danger"
                                                        } rounded-3 d-flex align-items-center gap-1 px-2`}
                                                    onClick={() => handleAcceptReject("Reject", quote.mainId, quote.id)}
                                                    disabled={loadingJobId === quote.id}
                                                >     <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            width="24"
                                                            height="24"
                                                            fill="none"
                                                            stroke="red"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </span>
                                                    <span>Reject</span>
                                                </button>

                                                {/* Update */}
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Update Job"
                                                    onClick={() => setUpdateModal(quote)}
                                                >
                                                    <span>✏️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Update</span>
                                                </button>

                                            </div>
                                        </td>
                                        }
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
