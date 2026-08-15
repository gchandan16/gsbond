"use client";
// ✅ CLIENT COMPONENT (CSR)
// Product creation form — name, description, status, categoryId (single select), amount

import { useState, useMemo, useEffect } from "react";

import axios from "axios";

// ── helpers ───────────────────────────────────────────────────────────────────
function toSlug(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

const fmt = (n) =>
    new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 2,
    }).format(n || 0);

// ── Reusable wrappers ─────────────────────────────────────────────────────────
function SectionCard({ step, title, subtitle, children }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom border-primary border-opacity-25 rounded-top-4 px-4 py-3 d-flex align-items-center gap-3">
                <div
                    className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 fw-bold flex-shrink-0"
                    style={{ width: 40, height: 40, fontSize: 15 }}
                >
                    {step}
                </div>
                <div>
                    <h6 className="mb-0 fw-bold text-dark">{title}</h6>
                    {subtitle && <p className="mb-0 text-secondary small">{subtitle}</p>}
                </div>
            </div>
            <div className="card-body px-4 py-4">{children}</div>
        </div>
    );
}

function Field({ label, required, hint, error, children }) {
    return (
        <div className="mb-4">
            <label className="form-label fw-semibold text-dark small mb-1">
                {label}
                {required && <span className="text-danger ms-1">*</span>}
            </label>
            {children}
            {hint && !error && <div className="form-text text-secondary mt-1">{hint}</div>}
            {error && <div className="text-danger small mt-1">⚠ {error}</div>}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductForm({ categories }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "active",
        categoryId: "",
        amount: "",
        taxIncluded: false,
        taxRate: "0",
        base: 0,
    });

    const [descCount, setDescCount] = useState(0);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        setToken(storedToken);
    }, []);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    // Auto-generate slug
    const handleNameChange = (val) => {
        set("name", val);
    };

    // Selected category object
    const selectedCategory = useMemo(
        () => categories.find((c) => c.id === Number(form.categoryId)) ?? null,
        [form.categoryId, categories]
    );

    // Derived amount values
    const amountNum = parseFloat(form.amount) || 0;
    const taxAmt = form.taxIncluded ? 0 : (amountNum * form.taxRate) / 100;
    const totalAmount = amountNum + taxAmt;

    // console.log("base", amountNum, "gst", taxAmt, "price", totalAmount);

    // ── Validation ──
    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = "Product name is required.";
        if (!form.description.trim()) e.description = "Description is required.";
        if (!form.categoryId) e.categoryId = "Please select a category.";
        if (!form.amount || amountNum <= 0) e.amount = "Enter a valid amount greater than 0.";
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product`,
            {
                name: form.name,
                description: form.description,
                status: form.status == "Active" ? 1 : 0,
                price: Number(totalAmount),
                base: Number(form.amount),
                gst: (form.taxRate).toString(),
                categoryId: form.categoryId,
            },
            {
                headers: {
                    Authorisation: `Bearer ${token}`
                }
            }
        )

        // console.log("response", response);

        if (response.data.success == true) {
            // console.log(
            //     "name", form.name,
            //     "description", form.description,
            //     "status", form.status == "Active" ? 1 : 0,
            //     "price", Number(totalAmount),
            //     "base", Number(form.amount),
            //     "gst", (form.taxRate).toString(),
            //     "categoryId", form.categoryId,)

            setSubmitted(true);
        }
        setErrors({});
    }

    // ── Success Screen ──
    if (submitted) {
        return (
            <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-4" style={{ maxWidth: 540, margin: "0 auto" }}>
                <div className="mb-3" style={{ fontSize: 56 }}>🎉</div>
                <h3 className="fw-bold text-dark mb-1">{form.name}</h3>
                {/* <p className="font-monospace text-primary small mb-1">/products/{form.slug}</p> */}

                <div className="d-flex justify-content-center gap-3 my-3">
                    <span className={`badge rounded-pill px-3 py-2 ${form.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                        {form.status == "Active" ? "Active" : "Inactive"}
                    </span>
                    {selectedCategory && (
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2">
                            {selectedCategory.icon} {selectedCategory.name}
                        </span>
                    )}
                </div>

                <div className="card border-0 bg-primary bg-opacity-10 rounded-4 px-4 py-3 mb-4 mx-auto" style={{ maxWidth: 280 }}>
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                        <span>Base Amount</span>
                        <span className="font-monospace">{fmt(amountNum)}</span>
                    </div>
                    {!form.taxIncluded && (
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                            <span>GST ({form.taxRate}%)</span>
                            <span className="font-monospace">+ {fmt(taxAmt)}</span>
                        </div>
                    )}
                    <hr className="text-primary opacity-25 my-2" />
                    <div className="d-flex justify-content-between fw-bold text-primary">
                        <span>Total</span>
                        <span className="font-monospace fs-5">{fmt(totalAmount)}</span>
                    </div>
                </div>

                <div className="alert bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 text-success small mb-4">
                    ✅ Service created successfully!
                </div>

                <div className="d-flex justify-content-center gap-3">
                    <button
                        className="btn btn-primary rounded-3 px-4"
                        onClick={() => {
                            setSubmitted(false);
                            setForm({ name: "", slug: "", description: "", status: "active", categoryId: "", amount: "", taxIncluded: false, taxRate: 18 });
                            // setSlugManual(false);
                            setDescCount(0);
                            setErrors({});
                        }}
                    >
                        + Create Another
                    </button>
                    <a href="/dashboard/services/service/all-service" className="btn btn-outline-primary rounded-3 px-4">
                        View Services
                    </a>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 780, margin: "0 auto" }}>

            {/* ── SECTION 1 — Basic Info ── */}
            <SectionCard step="1" title="Basic Information" subtitle="Service name ">

                {/* Name */}
                <Field label="Service Name" required error={errors.name} hint="Clear, descriptive name shown to customers.">
                    <input
                        type="text"
                        className={`form-control rounded-3 ${errors.name ? "is-invalid" : ""}`}
                        placeholder="Service Name"
                        value={form.name}
                        maxLength={100}
                        onChange={(e) => handleNameChange(e.target.value)}
                    />
                </Field>



            </SectionCard>

            {/* ── SECTION 2 — Description ── */}
            <SectionCard step="2" title="Description" subtitle="Describe this Service clearly">

                <Field
                    label="Description"
                    required
                    error={errors.description}
                    hint={`${descCount}/500 characters`}
                >
                    <textarea
                        className={`form-control rounded-3 ${errors.description ? "is-invalid" : ""}`}
                        rows={4}
                        placeholder="Describe what this Service includes, who it's for, and key benefits…"
                        value={form.description}
                        maxLength={500}
                        onChange={(e) => { set("description", e.target.value); setDescCount(e.target.value.length); }}
                    />
                    <div className="mt-2">
                        <div className="progress" style={{ height: 4 }}>
                            <div
                                className={`progress-bar ${descCount > 450 ? "bg-warning" : "bg-primary"}`}
                                style={{ width: `${(descCount / 500) * 100}%`, transition: "width 0.2s" }}
                            />
                        </div>
                    </div>
                </Field>

            </SectionCard>

            {/* ── SECTION 3 — Category ── */}
            <SectionCard step="3" title="Category" subtitle="Assign this product to one category">

                <Field label="Category" required error={errors.categoryId} hint="Select the category this product belongs to.">

                    {/* Category select dropdown */}
                    <select
                        className={`form-select rounded-3 mb-3 ${errors.categoryId ? "is-invalid" : ""}`}
                        value={form.categoryId}
                        onChange={(e) => set("categoryId", e.target.value)}
                    >
                        <option value="">— Select a Category —</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon}  {cat.name}
                            </option>
                        ))}
                    </select>

                    {/* Selected category preview card */}
                    {selectedCategory ? (
                        <div className="d-flex align-items-center gap-3 border border-primary border-opacity-25 bg-primary bg-opacity-10 rounded-3 px-3 py-3">
                            <div
                                className="d-flex align-items-center justify-content-center bg-white rounded-3 flex-shrink-0 shadow-sm"
                                style={{ width: 42, height: 42, fontSize: 22 }}
                            >
                                {selectedCategory.icon}
                            </div>
                            <div className="flex-fill">
                                <div className="fw-semibold text-dark small">{selectedCategory.name}</div>
                                <div className="text-secondary" style={{ fontSize: 11 }}>ID #{selectedCategory.id}</div>
                            </div>
                            <span className="badge bg-success rounded-pill px-3 py-2 small">Active</span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-3 ms-1 px-2"
                                title="Clear selection"
                                onClick={() => set("categoryId", "")}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="border border-secondary border-opacity-25 rounded-3 px-4 py-4 text-center text-secondary small bg-white">
                            <div className="mb-1" style={{ fontSize: 28 }}>📂</div>
                            No category selected yet
                        </div>
                    )}

                </Field>

            </SectionCard>

            {/* ── SECTION 4 — Pricing & Status ── */}
            <SectionCard step="4" title="Pricing & Status" subtitle="Set the product amount and visibility">

                <div className="row g-4">

                    {/* Amount */}
                    <div className="col-md-7">
                        <Field label="Amount ($)" required error={errors.amount} hint="Base price before tax.">
                            <div className="input-group">
                                <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold fs-6">$</span>
                                <input
                                    type="number"
                                    className={`form-control border-start-0 rounded-end-3 fs-5 fw-semibold ${errors.amount ? "is-invalid" : ""}`}
                                    placeholder="0.00"
                                    min={0}
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) => set("amount", e.target.value)}
                                    style={{ letterSpacing: "0.03em" }}
                                />
                            </div>
                        </Field>

                        {/* Tax toggle */}
                        <div
                            className={`border rounded-3 px-4 py-3 d-flex align-items-center justify-content-between mb-3 ${form.taxIncluded ? "border-success bg-success bg-opacity-10" : "border-secondary border-opacity-25 bg-white"}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => set("taxIncluded", !form.taxIncluded)}
                        >
                            <div>
                                <div className={`fw-semibold small ${form.taxIncluded ? "text-success" : "text-dark"}`}>
                                    {form.taxIncluded ? "✅ Tax Included in Price" : "Tax Not Included"}
                                </div>
                                <div className="text-secondary" style={{ fontSize: 11 }}>
                                    {form.taxIncluded ? "Amount already includes GST" : `GST (${form.taxRate}%) will be added on top`}
                                </div>
                            </div>
                            <div
                                className={`rounded-pill d-flex align-items-center flex-shrink-0 ${form.taxIncluded ? "bg-success" : "bg-secondary bg-opacity-25"}`}
                                style={{ width: 44, height: 24, padding: "2px 3px" }}
                            >
                                <div
                                    className="bg-white rounded-circle shadow-sm"
                                    style={{ width: 18, height: 18, marginLeft: form.taxIncluded ? "auto" : 0, transition: "margin 0.2s" }}
                                />
                            </div>
                        </div>

                        {/* Tax rate selector (hidden when tax included) */}
                        {!form.taxIncluded && (
                            <Field label="GST Rate" hint="Select applicable GST slab.">
                                <div className="d-flex flex-wrap gap-2">
                                    {[0, 5, 12, 18, 28].map((rate) => (
                                        <button
                                            key={rate}
                                            type="button"
                                            onClick={() => set("taxRate", rate)}
                                            className={`btn btn-sm rounded-pill px-3 ${form.taxRate === rate ? "btn-primary" : "btn-outline-primary"}`}
                                        >
                                            {rate === 0 ? "Exempt" : `${rate}%`}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        )}
                    </div>

                    {/* Pricing summary + Status */}
                    <div className="col-md-5 d-flex flex-column gap-3">

                        {/* Amount breakdown */}
                        <div className="card border-0 bg-primary bg-opacity-10 rounded-4 p-4">
                            <p className="text-secondary small fw-semibold text-uppercase mb-3" style={{ letterSpacing: "0.07em" }}>
                                Price Breakdown
                            </p>
                            {amountNum > 0 ? (
                                <>
                                    <div className="d-flex justify-content-between small text-dark mb-2">
                                        <span>Base Amount</span>
                                        <span className="font-monospace fw-semibold">{fmt(amountNum)}</span>
                                    </div>
                                    {!form.taxIncluded && form.taxRate > 0 && (
                                        <div className="d-flex justify-content-between small text-secondary mb-2">
                                            <span>GST ({form.taxRate}%)</span>
                                            <span className="font-monospace">+ {fmt(taxAmt)}</span>
                                        </div>
                                    )}
                                    {form.taxIncluded && (
                                        <div className="d-flex justify-content-between small text-success mb-2">
                                            <span>Tax Included</span>
                                            <span className="font-monospace">—</span>
                                        </div>
                                    )}
                                    <hr className="text-primary opacity-25 my-2" />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold text-dark">Total</span>
                                        <span className="fw-bold text-primary fs-5 font-monospace">{fmt(totalAmount)}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-secondary small text-center mb-0">Enter an amount to see breakdown.</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <p className="form-label fw-semibold text-dark small mb-2">
                                Status <span className="text-danger">*</span>
                            </p>
                            <div className="d-flex gap-3">
                                <div
                                    className={`flex-fill border rounded-3 px-3 py-3 text-center ${form.status === "Active" ? "border-success bg-success bg-opacity-10" : "border-secondary border-opacity-25 bg-white"}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => set("status", "Active")}
                                >
                                    <div style={{ fontSize: 22 }} className="mb-1">✅</div>
                                    <div className={`fw-semibold small ${form.status == "Active" ? "text-success" : "text-dark"}`}>Active</div>
                                    <div className="text-secondary" style={{ fontSize: 11 }}>Visible to users</div>
                                </div>
                                <div
                                    className={`flex-fill border rounded-3 px-3 py-3 text-center ${form.status === "Inactive" ? "border-secondary bg-secondary bg-opacity-10" : "border-secondary border-opacity-25 bg-white"}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => set("status", "Inactive")}
                                >
                                    <div style={{ fontSize: 22 }} className="mb-1">🚫</div>
                                    <div className={`fw-semibold small ${form.status == "Inactive" ? "text-secondary" : "text-dark"}`}>Inactive</div>
                                    <div className="text-secondary" style={{ fontSize: 11 }}>Hidden from site</div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </SectionCard>

            {/* ── Live Preview ── */}
            <div
                className="card border-primary border-opacity-25 rounded-4 mb-4"
                style={{ borderStyle: "dashed", borderWidth: 2 }}
            >
                <div className="card-body px-4 py-4">
                    <p className="text-secondary small fw-semibold text-uppercase mb-3" style={{ letterSpacing: "0.07em" }}>
                        Live Preview
                    </p>
                    <div className="d-flex align-items-start gap-3 flex-wrap">

                        <div className="flex-fill" style={{ minWidth: 200 }}>
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <span className="fw-bold text-dark fs-6">
                                    {form.name || <span className="text-muted fst-italic fw-normal small">Product Name</span>}
                                </span>
                                <span className={`badge rounded-pill px-2 py-1 ${form.status === "Active" ? "bg-success" : "bg-secondary"}`} style={{ fontSize: 10 }}>
                                    {form.status === "Active" ? "Active" : "Inactive"}
                                </span>
                            </div>
                            {selectedCategory && (
                                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1 small mb-2">
                                    {selectedCategory.icon} {selectedCategory.name}
                                </span>
                            )}
                            <p className="text-secondary small mb-0">
                                {form.description || <span className="fst-italic">Description will appear here…</span>}
                            </p>
                        </div>

                        <div className="text-end flex-shrink-0">
                            {amountNum > 0 ? (
                                <>
                                    <div className="fw-bold text-primary fs-4 font-monospace">{fmt(totalAmount)}</div>
                                    {!form.taxIncluded && form.taxRate > 0 && (
                                        <div className="text-secondary" style={{ fontSize: 11 }}>incl. {form.taxRate}% GST</div>
                                    )}
                                    {form.taxIncluded && (
                                        <div className="text-success" style={{ fontSize: 11 }}>Tax inclusive</div>
                                    )}
                                </>
                            ) : (
                                <span className="text-muted fst-italic small">No price set</span>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Actions ── */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-4">
                <button type="button" className="btn btn-outline-secondary rounded-3 px-4">
                    ← Back
                </button>
                <div className="d-flex gap-2">

                    <button
                        type="submit"
                        className="btn btn-primary rounded-3 px-5 fw-semibold"
                    >
                        ✅ Create Service
                    </button>
                </div>
            </div>

        </form>
    );
}