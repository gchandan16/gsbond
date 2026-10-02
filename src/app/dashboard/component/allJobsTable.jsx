"use client";
import axios from "axios";
// ✅ CLIENT COMPONENT (CSR) — all interactivity: search, filter, modals, actions

import { useState, useMemo, useRef, useEffect } from "react";

import LogsModal from "./LogsModal"

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
    "Accepted": "#0ed733",    // teal (finished, stable)
    "Rejected": "#e5a5a5",    // teal (finished, stable)
};

const ALL_STATUSES = ["All", "Assigned", "Completed", "Accepted", "Rejected", "Pending"];


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
                                        <Image
                                            src={url}
                                            alt={`Preview ${i + 1}`}
                                            className="rounded-3"
                                            width={80}
                                            height={80}
                                            style={{ objectFit: "cover" }}
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
                        <Image
                            src={src}
                            alt={`${label} ${i + 1}`}
                            width={56}
                            height={56}
                            style={{ objectFit: "cover" }}
                        />
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



// ── Update Modal ──────────────────────────────────────────────────────────────


function UpdateModal({ quote, onClose, onSave, Services, token }) {
    // console.table(Services)
    const [tkn, setTkn] = useState(token);
    const [form, setForm] = useState({
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
        suburbs: quote.suburbs,
        specialRemark: quote.specialRemark || "",
        note: quote.note || "",
        beforeImages: quote.beforeImages,
        afterImages: quote.afterImages,
        shareToken: quote.shareToken,
        calculatedAmount: quote.calculatedAmount,
        dueAmount: quote.dueAmount,
        advanceAmount: quote.advanceAmount,
        quotedAmount: quote.quotatedAmount,
        acceptedStatus: quote.acceptedStatus,
        jobType: quote.jobType,
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
    const [copied, setCopied] = useState()
    const [selectedImage, setSelectedImage] = useState(null);


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

                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Calculated Amount ($)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">$</span>
                                    <input type="number" disabled className="form-control border-start-0 rounded-end-3 font-monospace" value={form.calculatedAmount}  />
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
                                        onChange={(e) => {
                                            const advance = parseFloat(e.target.value) || 0;
                                            setForm(f => ({
                                                ...f,
                                                advanceAmount: advance,
                                                dueAmount: (f.quotedAmount || 0) - advance,  // ✅ recalc due
                                            }));
                                        }}
                                        disabled
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

                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Status</label>
                                <div className="input-group">
                                    <input
                                        type="Text"
                                        disabled
                                        className="form-control border-start-0 rounded-end-3 font-monospace"
                                        value={form.status}
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Job Status</label>
                                <div className="input-group">
                                    <input
                                        type="Text"
                                        disabled
                                        className="form-control border-start-0 rounded-end-3 font-monospace"
                                        value={form.jobStatus}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Assigned</label>
                                <div className="input-group">
                                    <input
                                        type="Text"
                                        disabled
                                        className="form-control border-start-0 rounded-end-3 font-monospace"
                                        value={form.acceptedStatus}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Job Type</label>
                                <div className="input-group">
                                    <input
                                        type="Text"
                                        disabled
                                        className="form-control border-start-0 rounded-end-3 font-monospace"
                                        value={form.jobType}
                                    />
                                </div>
                            </div>





                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Any Remark (From Admin)
                                </label>

                                <textarea
                                    className="form-control rounded-3"
                                    rows={4}
                                    value={form.remark}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, remark: e.target.value }))
                                    }
                                    placeholder="Enter remark"
                                    style={{ resize: "vertical" }}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Any Remark (From Cleaner)
                                </label>

                                <textarea
                                    className="form-control rounded-3"
                                    rows={4}
                                    value={form.note}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, note: e.target.value }))
                                    }
                                    placeholder="Enter remark"
                                    style={{ resize: "vertical" }}
                                />
                            </div>

                            <div className="col-12 col-md-12">
                                <ImageGallery before={form.beforeImages} after={form.afterImages} />
                            </div>

                            <div className="col-12 col-md-6">
                                <button className="btn btn-sm btn-outline-primary rounded-3" onClick={handleCopyLink}>
                                    {copied ? "✓ Copied!" : "🔗 Share"}
                                </button>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Scheduled Date</label>
                                <div className="position-relative">
                                    <input type="date" disabled value={form.scheduledDate} />

                                </div>
                            </div>
                            <div className="col-12 col-md-12">
                                <label className="my-2 fw-semibold" htmlFor="Text">
                                    Special Image
                                </label>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {form?.specialImages?.length > 0 ? (
                                        form.specialImages.map((i, index) => (
                                            <div
                                                key={index}
                                                className="border rounded overflow-hidden shadow-sm"
                                                style={{
                                                    width: "100px",
                                                    height: "100px",
                                                    cursor: "pointer",
                                                    position: "relative",
                                                }}
                                                onClick={() => setSelectedImage(i)}
                                            >
                                                <Image
                                                    src={i}
                                                    alt="Special Image"
                                                    width={100}
                                                    height={100}
                                                    unoptimized
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-muted small">
                                            Not Available
                                        </span>
                                    )}
                                </div>

                                {/* FULLSCREEN PREVIEW */}
                                {selectedImage && (
                                    <div
                                        onClick={() => setSelectedImage(null)}
                                        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                                        style={{
                                            background: "rgba(0,0,0,0.85)",
                                            zIndex: 9999,
                                            padding: "20px",
                                        }}
                                    >
                                        {/* IMAGE CONTAINER */}
                                        <div
                                            className="position-relative"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* CLOSE BUTTON */}
                                            <button
                                                className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 d-flex justify-content-center align-items-center shadow"
                                                style={{
                                                    width: "35px",
                                                    height: "35px",
                                                    zIndex: 10,
                                                    transform: "translate(50%,-50%)",
                                                }}
                                                onClick={() => setSelectedImage(null)}
                                            >
                                                ✕
                                            </button>

                                            {/* LARGE IMAGE */}
                                            <img
                                                src={selectedImage}
                                                alt="Large Preview"
                                                className="rounded shadow-lg"
                                                style={{
                                                    maxWidth: "90vw",
                                                    maxHeight: "85vh",
                                                    objectFit: "contain",
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.src = "/logo1.png";
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>



                        </div>
                    </div>

                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary rounded-3 px-4 fw-semibold" onClick={() => { onSave(quote.id, quote.mainId, form); onClose(); }}>
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
                            <button className="btn btn-danger rounded-3 px-4 fw-semibold" onClick={() => { onConfirm(quote.id, quote.mainId); onClose(); }}>
                                Yes, Delete
                            </button>
                        </div>
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
        isReassign: false,
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
                                    Special Remark
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

                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1" htmlFor="Special Remark" >
                                    Select Job Type
                                </label>
                                <div
                                    className={`d-flex align-items-center justify-content-between p-3 rounded-3 border ${form.isReassign
                                        ? "border-dark bg-dark bg-opacity-10"
                                        : "border-secondary border-opacity-25"
                                        }`}
                                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            isReassign: !prev.isReassign,
                                        }))
                                    }
                                >
                                    {/* Left Content */}
                                    <div>
                                        <div className="fw-semibold text-dark">Reassign Job</div>
                                        <div className="text-secondary small">
                                            {form.isReassign
                                                ? "You are reassigning this job Again"
                                                : "You are assigning this job"}
                                        </div>
                                    </div>

                                    {/* Right Toggle Switch */}
                                    <div className="form-check form-switch m-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={form.isReassign}
                                            onChange={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    isReassign: !prev.isReassign,
                                                }))
                                            }
                                            onClick={(e) => e.stopPropagation()} // prevent double toggle
                                        />
                                    </div>
                                </div>
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



// ── Main Component ────────────────────────────────────────────────────────────
export default function AllJobsTable({ initialQuotes, services, userList }) {
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
    const [uploadImageSide, SetUploadImageSide] = useState(null);
    const [updateModal, setUpdateModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
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

    async function handleUpdate(id, mainId, form) {
        setQuotes((qs) => {
            return qs.map((q) => q.mainId === mainId
                ?
                { ...q, ...form }
                :
                q)
        });


        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign`,
                {
                    quoteId: id,
                    mainId: mainId,
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



    async function handleDelete(id, mainId) {
        setQuotes((qs) => qs.filter((q) => q.mainId !== mainId));
        console.log("mainId", mainId, "id", id);
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign/${mainId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        showToast("Job deleted. 🗑️", "danger");
    }



    async function handleAssign(id, form) {

        const formData = new FormData();

        formData.append("quotes", JSON.stringify([id]));
        formData.append("operators", JSON.stringify([form.assignedUser]));

        formData.append("otherDetails", form.scheduleDate);
        formData.append("isReassign", String(form.isReassign)); // ensure string
        formData.append("specialRemark", form.specialRemark || "");

        // ✅ multiple images
        if (form.specialImages && form.specialImages.length) {
            for (let i = 0; i < form.specialImages.length; i++) {
                formData.append("specialImages", form.specialImages[i]);
            }
        }

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            }
        )
        // console.log(form);
        window.location.reload();
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
            return q.clientName.toLowerCase().includes(s) || q.email.toLowerCase().includes(s) || q.id.toString().includes(s);
        });
        if (statusFilter !== "All") data = data.filter((q) => (q.jobStatus === statusFilter || q.acceptedStatus === statusFilter));
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
    const completeCount = quotes.filter((q) => q.jobStatus === "Completed").length;
    const acceptedCount = quotes.filter((q) => q.acceptedStatus === "Accepted").length;
    const pendingCount = quotes.filter((q) => q.acceptedStatus === "Pending").length;




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
            {imageModal && <AddImageModal quote={imageModal} onClose={() => setImageModal(null)} onSave={handleImageSave} side={uploadImageSide} />}
            {updateModal && <UpdateModal quote={updateModal} onClose={() => setUpdateModal(null)} onSave={handleUpdate} Services={service} token={token} />}
            {deleteModal && <DeleteModal quote={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} />}
            {<LogsModal
                show={showModal}
                onClose={() => setShowModal(false)}
                logs={selectedRow?.logs || []}
                quoteId={selectedRow?.quote_id}
            />}

            {/* ── Stats row ── */}
            <div className="row g-2 g-md-3 mb-4">
                {[
                    { label: "Total", value: quotes.length, icon: "📋", color: "primary" },
                    { label: "Completed", value: completeCount, icon: "✅", color: "success" },
                    { label: "Accept", value: acceptedCount, icon: "♾️", color: "success" },
                    { label: "Pending", value: pendingCount, icon: "⏳", color: "warning" },
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
                                <th role="button" className="user-select-none" onClick={() => { toggleSort("id") }}>
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
                                <th role="button" className="user-select-none text-center" onClick={() => toggleSort("status")}>
                                    Cleaner
                                </th>
                                <th role="button" className="user-select-none text-center" onClick={() => toggleSort("status")}>
                                    Assigned
                                </th>
                                <th role="button" className="user-select-none d-none d-lg-table-cell" onClick={() => toggleSort("createdAt")}>
                                    Date
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

                                                <div>
                                                    <div className="fw-semibold text-dark small">{quote.clientName}</div>
                                                    <div className="text-secondary font-monospace" style={{ fontSize: 11 }}>{quote.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="d-none d-lg-table-cell">
                                            <div className="small text-dark">{quote.mobile}</div>
                                        </td>



                                        {/* Status */}
                                        <td className="text-center">
                                            <span className={`${STATUS_BADGE[quote.jobStatus]?.className ?? "badge text-white"} rounded-pill px-3 py-2`} style={{ background: STATUS_COLOR[quote.jobStatus] ?? "#374151" }}>
                                                {quote.jobStatus}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="d-flex align-items-center gap-2">

                                                <div>
                                                    <div className="fw-semibold text-dark small">{quote.cleanerName}</div>
                                                    <div className="text-secondary font-monospace" style={{ fontSize: 11 }}>{quote.cleanerEmail}</div>
                                                </div>
                                            </div>
                                        </td>


                                        <td className="text-center">
                                            <span className={`${STATUS_BADGE[quote.acceptedStatus]?.className ?? "badge text-white"} rounded-pill px-3 py-2`} style={{ background: STATUS_COLOR[quote.acceptedStatus] ?? "#374151" }}>
                                                {quote.acceptedStatus}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="d-none d-lg-table-cell">
                                            <span className="text-secondary small">{quote.scheduledDate}</span>
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
                                                {user.role == "admin" && <button
                                                    className="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Delete Job"
                                                    onClick={() => setDeleteModal(quote)}
                                                >
                                                    <span>🗑️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Delete</span>
                                                </button>}

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
