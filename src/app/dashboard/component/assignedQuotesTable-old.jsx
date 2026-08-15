"use client";
import axios from "axios";
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

const ALL_STATUSES = ["All", "Fresh", "Reclean"];



function getInitials(name) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}





// ── Add Image Modal ──────────────────────────────────────────────────────────
function AddImageModal({ quote, onClose, onSave, side }) {
    const fileRef = useRef();

    const [imageSide, setImageSide] = useState(side);
    const [files, setFiles] = useState([]);        // ✅ actual File objects
    const [previews, setPreviews] = useState(quote?.imageUrl ? [quote.imageUrl] : []);
    const [dragging, setDragging] = useState(false);

    function handleFiles(fileList) {
        Array.from(fileList).forEach((file) => {
            setFiles((prev) => [...prev, file]);                         // ✅ store File
            setPreviews((prev) => [...prev, URL.createObjectURL(file)]); // for preview only
        });
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
                                <h6 className="modal-title fw-bold text-dark mb-0">Add {imageSide} work Images</h6>
                                <p className="text-secondary mb-0 small">{quote?.id} · {quote?.clientName}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body px-4 py-4">
                        {/* Drop zone */}
                        <div
                            className={`border rounded-4 p-4 text-center mb-3 ${dragging ? "border-primary bg-primary bg-opacity-10" : "border-primary border-opacity-25"}`}
                            style={{ borderStyle: "dashed", cursor: "pointer" }}
                            onClick={() => fileRef.current.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                        >
                            <div className="mb-2" style={{ fontSize: 36 }}>📁</div>
                            <p className="fw-semibold text-dark small mb-1">Click or drag & drop to upload</p>
                            <p className="text-secondary" style={{ fontSize: 12 }}>PNG, JPG, PDF up to 5MB · Multiple allowed</p>
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*,application/pdf"
                            className="d-none"
                            multiple
                            onChange={(e) => handleFiles(e.target.files)}
                        />

                        {/* Preview grid */}
                        {previews.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {previews.map((url, i) => (
                                    <div key={i} className="position-relative">
                                        <img
                                            src={url}
                                            alt={`Preview ${i + 1}`}
                                            className="rounded-3"
                                            style={{ width: 80, height: 80, objectFit: "cover" }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-close position-absolute top-0 end-0 bg-white rounded-circle"
                                            style={{ fontSize: 8, padding: 3 }}
                                            onClick={() => {
                                                setFiles((prev) => prev.filter((_, idx) => idx !== i));    // ✅ sync remove
                                                setPreviews((prev) => prev.filter((_, idx) => idx !== i));
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-primary rounded-3 px-4"
                            onClick={() => { onSave(quote.id, files, side); onClose(); }} // ✅ pass File objects not previews
                        >
                            Save Images
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}





// ── Update Modal ──────────────────────────────────────────────────────────────


function UpdateModal({ quote, onClose, onSave, Services, token }) {
    // console.table(Services)
    const [tkn, setTkn] = useState(token);
    const [form, setForm] = useState({
        id: quote.id,
        mainId: quote.mainId,
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
        suburbs: quote.suburbs,
        specialRemark: quote.specialRemark,
        note: quote.note,
        specialImages: quote.specialImages,
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

    const [selectedImage, setSelectedImage] = useState(null);


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
                            <div className="col-md-5">
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

                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Any Remark
                                </label>

                                <textarea
                                    className="form-control rounded-3"
                                    rows={4}
                                    value={form.note}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, note: e.target.value }))
                                    }
                                    placeholder="Cleaner Write your Remark"
                                    style={{ resize: "vertical" }}
                                />
                            </div>


                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Scheduled Date</label>
                                <div className="position-relative">
                                    <input type="date" value={form.scheduledDate} disabled />

                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Time Taken
                                </label>

                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control bg-light fw-semibold"
                                        value={
                                            form.timerStarted && form.timerEnded
                                                ? (() => {
                                                    const diffMs =
                                                        new Date(form.timerEnded) - new Date(form.timerStarted);

                                                    const hours = diffMs / (1000 * 60 * 60);

                                                    return `${hours.toFixed(2)} hours`;
                                                })()
                                                : "—"
                                        }
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="col-12 col-md-12">
                                <label className="my-2" htmlFor="Text">Special Image</label>

                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    {form?.specialImages?.length > 0 ?
                                        form.specialImages.map((i) => (
                                            <Image
                                                key={i}
                                                src={i}
                                                alt="Picture of Special Image"
                                                width={100}  // 👈 small thumbnail
                                                height={100}
                                                style={{ cursor: "pointer", borderRadius: "6px", border: "2px solid #ccc" }}
                                                onClick={() => setSelectedImage(i)}
                                                onError={(e) => {
                                                    e.currentTarget.src = "/logo1.png"; // 👈 must be in /public
                                                }}
                                            />
                                        )) : "Not Available"}
                                </div>

                                {/* 👇 Big Image */}
                                {selectedImage && (
                                    <div
                                        onClick={() => setSelectedImage(null)}
                                        style={{
                                            position: "fixed",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            background: "rgba(0,0,0,0.8)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            zIndex: 999,
                                            padding: "16px",  // mobile pe edges se gap
                                        }}
                                    >
                                        <div style={{ position: "relative", width: "100%", maxWidth: "600px", aspectRatio: "1/1" }}>
                                            <Image
                                                src={selectedImage}
                                                alt="Large"
                                                fill                        // fixed width/height hata do
                                                quality={100}
                                                style={{ borderRadius: "10px", objectFit: "contain" }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>




                        </div>
                    </div>

                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary rounded-3 px-4 fw-semibold" onClick={() => { onSave(quote.id, form); onClose(); }}>
                            Update Job
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
                        <h5 className="fw-bold text-dark mb-2">Delete Job?</h5>
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

//Timer modal

function TimerConfirmModal({ quote, onClose, onConfirm }) {
    return (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">
                            {quote.action === "start" ? "Start Timer?" : "End Timer?"}
                        </h5>
                    </div>

                    <div className="modal-body">
                        Are you sure you want to {quote.action} timer for {quote.clientName}?
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={() => onConfirm(quote)}
                        >
                            Confirm
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AssignedQuoteTable({ initialQuotes, services, userList }) {
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
    const [uploadImageSide, SetUploadImageSide] = useState(null);
    const [updateModal, setUpdateModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [timerConfirmModal, setTimerConfirmModal] = useState(null);
    const [toast, setToast] = useState(null);
    const perPage = 6;
    const [user, setUser] = useState({});


    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        const usr = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(usr);
        setToken(storedToken);
    }, []);


    // console.log(quotes,"=======================")
    // console.log(user.email,"=======================")


    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    async function handleImageSave(id, imageUrl, side) {
        // setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, imageUrl } : q));
        // console.log(imageUrl, side, id);
        const formData = new FormData();

        imageUrl.forEach((i) => {
            formData.append("files", i)
        })
        formData.append("name", side);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote/${id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            }
        );

        // console.log("uploaded", response);


        showToast("Image saved successfully! 🖼️");
    }

    async function handleUpdate(id, form) {
        setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, ...form } : q));

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign`,
                {
                    quoteId: id,
                    mainId: form.mainId,
                    jobStatus: form.jobStatus,
                    remark: form.remark,
                    note: form.note,
                    startTime: form.startTime,
                    endTime: form.endTime,
                },
                {
                    headers: {
                        Authorisation: `Bearer ${token}`
                    }
                }

            );

            // console.log("status", form.jobStatus);

            showToast("Job updated successfully! ✏️");
            // window.location.reload();
        } catch (error) {
            // revert optimistic update on failure
            // setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, ...originalQuote } : q));
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
        showToast("Job deleted. .🗑️", "danger");
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

    async function handleTimer(quote) {
        const { action, id, mainId } = quote;

        const result = action; // "start" or "end"

        setTimerConfirmModal(null);

        setQuotes((qs) =>
            qs.map((q) => {
                if (q.mainId == mainId) {
                    return {
                        ...q,
                        timerStarted:
                            result === "start" ? new Date().toISOString() : q.timerStarted,
                        timerEnded:
                            result === "end" ? new Date().toISOString() : q.timerEnded,
                    };
                }
                return q;
            })
        );

        try {
            const payload = {
                id,
                mainId,
                start: result === "start",
                end: result === "end",
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign/${mainId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // console.log(response.data);



        } catch (error) {
            console.error("Timer error:", error);
        }
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

    // console.log("quotes", quotes)

    // Stats
    const approvedCount = quotes.filter((q) => q.jobStatus === "Fresh").length;
    const pendingCount = quotes.filter((q) => q.jobStatus === "Reclean").length;


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
            {imageModal && <AddImageModal quote={imageModal} onClose={() => setImageModal(null)} onSave={handleImageSave} side={uploadImageSide} />}
            {updateModal && <UpdateModal quote={updateModal} onClose={() => setUpdateModal(null)} onSave={handleUpdate} Services={service} token={token} />}
            {deleteModal && <DeleteModal quote={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} />}
            {timerConfirmModal && <TimerConfirmModal quote={timerConfirmModal} onClose={() => setTimerConfirmModal(null)} onConfirm={handleTimer} />}
            {/* ── Stats row ── */}
            <div className="row g-2 g-md-3 mb-4">
                {[
                    { label: "Total", value: quotes.length, icon: "📋", color: "primary" },
                    { label: "Fresh Jobs", value: approvedCount, icon: "✅", color: "success" },
                    { label: "Reclean Jobs", value: pendingCount, icon: "⏳", color: "warning" },
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
                                    Status
                                </th>

                                <th role="button" className="user-select-none d-lg-table-cell" onClick={() => toggleSort("createdAt")}>
                                    Scheduled Date <SortArrow field="createdAt" />
                                </th>
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
                                            <span className={`${STATUS_BADGE[quote.jobStatus]?.className ?? "badge text-white"} rounded-pill px-3 py-2`} style={{ background: STATUS_COLOR[quote.jobStatus] ?? "#374151" }}>
                                                {quote.jobStatus}
                                            </span>
                                        </td>


                                        {/* Date */}
                                        <td className="d-lg-table-cell">
                                            <span className="text-secondary small">{quote.scheduledDate}</span>
                                        </td>

                                        {/* ── Actions ── */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">

                                                <div className="col-3 col-md-4">

                                                    <div className="">

                                                        {/* Pulse animation style */}
                                                        <style>{`
            @keyframes pulse-ring {
                0% { transform: scale(0.8); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }
            .pulse-dot {
                width: 10px;
                height: 10px;
               borderRadius: 50%;
                background: #dc3545;
                position: relative;
                display: inline-block;
            }
            .pulse-dot::before {
                content: '';
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
               borderRadius: 50%;
                background: #dc3545;
                animation: pulse-ring 1.2s ease-out infinite;
            }
                                                        `}</style>

                                                        {/* {!form.timerStarted ? ( */}
                                                        {!quote.timerStarted ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-success btn-sm fw-semibold px-3 py-1"
                                                                onClick={() =>
                                                                    setTimerConfirmModal({
                                                                        ...quote,
                                                                        action: "start"
                                                                    })
                                                                }
                                                            >
                                                                ▶ <span className="d-none d-sm-inline">Start</span>
                                                            </button>
                                                        ) : !quote.timerEnded ? (
                                                            <div className="d-flex align-items-center justify-content-between gap-2 w-100">

                                                                {/* Left */}
                                                                <div className="d-flex align-items-center gap-1 text-danger fw-semibold small flex-grow-1 text-truncate">
                                                                    <span className="pulse-dot flex-shrink-0" />
                                                                    <span className="text-truncate">Running</span>
                                                                </div>

                                                                {/* Right */}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm px-2 py-1 fw-semibold flex-shrink-0"
                                                                    onClick={() =>
                                                                        setTimerConfirmModal({
                                                                            ...quote,
                                                                            action: "end"
                                                                        })
                                                                    }
                                                                >
                                                                    ⏹ <span className="d-none d-sm-inline">End</span>
                                                                </button>

                                                            </div>
                                                        ) : (
                                                            <div className="d-flex align-items-center justify-content-center gap-1 text-success fw-semibold small mt-1">
                                                                <span>✅ Done</span>
                                                                {/* <span className="d-none d-sm-inline">Timer Completed</span> */}
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                                {/* Add Image */}
                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Add Image"
                                                    onClick={() => {
                                                        setImageModal(quote);
                                                        SetUploadImageSide("before")
                                                    }}
                                                >
                                                    <span>🖼️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 10 }}>Before Work</span>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Add Image"
                                                    onClick={() => {
                                                        setImageModal(quote);
                                                        SetUploadImageSide("after")
                                                    }}
                                                >
                                                    <span>🖼️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 10 }}>After Work</span>
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

                                                {/* Delete */}
                                                {/* {user.role == "admin" && <button
                                                    className="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Delete Job"
                                                    onClick={() => setDeleteModal(quote)}
                                                >
                                                    <span>🗑️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Delete</span>
                                                </button>} */}

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
