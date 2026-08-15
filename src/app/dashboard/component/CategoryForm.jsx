"use client";
// ✅ CLIENT COMPONENT (CSR)
// Full category creation form — name, slug, description, status, icon, parent, sort order

import { useState, useEffect } from "react";
import axios from "axios";


// ── Slug generator ────────────────────────────────────────────────────────────
function toSlug(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

// ── Icon picker options ───────────────────────────────────────────────────────
const ICON_OPTIONS = [
    "📦", "🛠️", "💡", "🖥️", "📋", "🔧", "🎯", "📊",
    "🚀", "⚙️", "🔒", "🌐", "📱", "🖨️", "🔌", "💼",
];

// ── Reusable form field wrapper ───────────────────────────────────────────────
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

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({ icon, title, subtitle, children, stepNumber }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom border-primary border-opacity-25 rounded-top-4 px-4 py-3 d-flex align-items-center gap-3">
                <div
                    className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 flex-shrink-0 fw-bold"
                    style={{ width: 40, height: 40, fontSize: stepNumber ? 15 : 18 }}
                >
                    {stepNumber ?? icon}
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function CategoryForm({ parentCategories }) {
    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        status: "active",
        icon: "📦",
        parentId: "",
        sortOrder: 0,
        isFeatured: false,
        metaTitle: "",
        metaDescription: "",
    });

    const [slugManual, setSlugManual] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);
  }, []);

    // Auto-generate slug from name
    // useEffect(() => {
    //     if (!slugManual && form.name) {
    //         setForm((f) => ({ ...f, slug: toSlug(f.name) }));
    //     }
    // }, [form.name, slugManual]);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    // ── Validation ──
    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = "Category name is required.";
        // if (!form.slug.trim()) e.slug = "Slug is required.";
        if (!form.description.trim()) e.description = "Description is required.";
        if (form.description.length > 500)
            e.description = "Description must be under 500 characters.";
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        // console.log("`${process.env.NEXT_PUBLIC_BACKEND_URL}/category`",`${process.env.NEXT_PUBLIC_BACKEND_URL}/category`);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category`, 
            {
            name: form.name,
            description: form.description,
            status: form.status === "active" ? 1 : 0,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
    );

        // console.log(response.data.data);
        if (response.data.data.status == true) {
            setSubmitted(true);
        } else {

        }
        setErrors({});
        // setSubmitted(true);
    }

    // ── Success screen ──
    if (submitted) {
        return (
            <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-4" style={{ maxWidth: 520, margin: "0 auto" }}>
                <div className="mb-3" style={{ fontSize: 56 }}>{form.icon}</div>
                <span className={`badge rounded-pill px-3 py-2 mb-3 d-inline-block mx-auto ${form.status === "active" ? "bg-success" : "bg-secondary"}`}>
                    {form.status === "active" ? "Active" : "Inactive"}
                </span>
                <h3 className="fw-bold text-dark mb-1">{form.name}</h3>
                <p className="font-monospace text-primary small mb-3">/{form.slug}</p>
                <p className="text-secondary mb-4 px-3">{form.description}</p>
                <div className="alert bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 text-success small mb-4">
                    ✅ Category created successfully!
                </div>
                <div className="d-flex justify-content-center gap-3">
                    <button
                        className="btn btn-primary rounded-3 px-4"
                        onClick={() => {
                            setSubmitted(false);
                            setForm({ name: "", slug: "", description: "", status: "active", icon: "📦", parentId: "", sortOrder: 0, isFeatured: false, metaTitle: "", metaDescription: "" });
                            setSlugManual(false);
                            setCharCount(0);
                        }}
                    >
                        + Create Another
                    </button>
                    <a href="/dashboard/services/category/all-category" className="btn btn-outline-primary rounded-3 px-4">
                        View All Categories
                    </a>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 780, margin: "0 auto" }}>

            {/* ── SECTION 1 — Basic Info ── */}
            <SectionCard stepNumber="1" title="Basic Information" subtitle="Name, slug and icon for this category">

                {/* Name */}
                <Field label="Category Name" required error={errors.name} hint="Use a clear, short name (Category')">
                    <input
                        type="text"
                        className={`form-control rounded-3 ${errors.name ? "is-invalid" : ""}`}
                        placeholder="Enter category"
                        value={form.name}
                        maxLength={80}
                        onChange={(e) => set("name", e.target.value)}
                    />
                </Field>

                {/* Slug */}
                {/* <Field label="URL Slug" required error={errors.slug} hint="Auto-generated from name. Edit to customise.">
                    <div className="input-group">
                        <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 small font-monospace">
                            /categories/
                        </span>
                        <input
                            type="text"
                            className={`form-control border-start-0 font-monospace rounded-end-3 ${errors.slug ? "is-invalid" : ""}`}
                            placeholder="electrical-services"
                            value={form.slug}
                            onChange={(e) => {
                                setSlugManual(true);
                                set("slug", toSlug(e.target.value));
                            }}
                        />
                        {slugManual && (
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary ms-2 rounded-3 px-3"
                                title="Reset to auto-generated slug"
                                onClick={() => { setSlugManual(false); set("slug", toSlug(form.name)); }}
                            >
                                ↺ Reset
                            </button>
                        )}
                    </div>
                </Field> */}

                {/* Icon picker */}
                <Field label="Category Icon" hint="Pick an emoji icon that represents this category.">
                    <div className="d-flex flex-wrap gap-2 mb-2">
                        {ICON_OPTIONS.map((ic) => (
                            <button
                                key={ic}
                                type="button"
                                onClick={() => set("icon", ic)}
                                className={`btn rounded-3 px-2 py-1 ${form.icon === ic ? "btn-primary" : "btn-outline-secondary"}`}
                                style={{ fontSize: 20, lineHeight: 1.4, minWidth: 44 }}
                                title={ic}
                            >
                                {ic}
                            </button>
                        ))}
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-2">
                        <span className="text-secondary small">Selected:</span>
                        <span
                            className="badge bg-primary bg-opacity-10 text-primary rounded-3 px-3 py-2"
                            style={{ fontSize: 18 }}
                        >
                            {form.icon}
                        </span>
                    </div>
                </Field>

            </SectionCard>

            {/* ── SECTION 2 — Description ── */}
            <SectionCard stepNumber="2" title="Description" subtitle="Describe what this category covers">

                <Field
                    label="Description"
                    required
                    error={errors.description}
                    hint={`${charCount}/500 characters — Shown on category pages and search results.`}
                >
                    <textarea
                        className={`form-control rounded-3 ${errors.description ? "is-invalid" : ""}`}
                        rows={4}
                        placeholder="Briefly describe this category and what services or products it includes…"
                        value={form.description}
                        maxLength={500}
                        onChange={(e) => {
                            set("description", e.target.value);
                            setCharCount(e.target.value.length);
                        }}
                    />
                    {/* Character progress bar */}
                    <div className="mt-2">
                        <div className="progress" style={{ height: 4 }}>
                            <div
                                className={`progress-bar ${charCount > 450 ? "bg-warning" : "bg-primary"}`}
                                style={{ width: `${(charCount / 500) * 100}%`, transition: "width 0.2s" }}
                            />
                        </div>
                    </div>
                </Field>

            </SectionCard>

            {/* ── SECTION 3 — Status & Settings ── */}
            <SectionCard stepNumber="3" title="Status & Settings" subtitle="Visibility, hierarchy and display order">

                <div className="row g-4">

                    {/* Status */}
                    <div className="col-md-6">
                        <Field label="Status" required hint="Controls whether this category is visible on the site.">
                            <div className="d-flex gap-3">

                                {/* Active card */}
                                <div
                                    className={`flex-fill border rounded-3 px-3 py-3 text-center cursor-pointer ${form.status === "active" ? "border-success bg-success bg-opacity-10" : "border-secondary border-opacity-25 bg-white"}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => set("status", "active")}
                                >
                                    <div style={{ fontSize: 24 }} className="mb-1">✅</div>
                                    <div className={`fw-semibold small ${form.status === "active" ? "text-success" : "text-dark"}`}>Active</div>
                                    <div className="text-secondary" style={{ fontSize: 11 }}>Visible to users</div>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        className="d-none"
                                        checked={form.status === "active"}
                                        onChange={() => set("status", "active")}
                                    />
                                </div>

                                {/* Inactive card */}
                                <div
                                    className={`flex-fill border rounded-3 px-3 py-3 text-center ${form.status === "inactive" ? "border-secondary bg-secondary bg-opacity-10" : "border-secondary border-opacity-25 bg-white"}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => set("status", "inactive")}
                                >
                                    <div style={{ fontSize: 24 }} className="mb-1">🚫</div>
                                    <div className={`fw-semibold small ${form.status === "inactive" ? "text-secondary" : "text-dark"}`}>Inactive</div>
                                    <div className="text-secondary" style={{ fontSize: 11 }}>Hidden from site</div>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="inactive"
                                        className="d-none"
                                        checked={form.status === "inactive"}
                                        onChange={() => set("status", "inactive")}
                                    />
                                </div>

                            </div>
                        </Field>
                    </div>

                    {/* Featured toggle */}
                    <div className="col-md-6">
                        <Field label="Featured Category" hint="Featured categories appear on the homepage.">
                            <div
                                className={`border rounded-3 px-4 py-3 d-flex align-items-center justify-content-between ${form.isFeatured ? "border-primary bg-primary bg-opacity-10" : "border-secondary border-opacity-25 bg-white"}`}
                                style={{ cursor: "pointer" }}
                                onClick={() => set("isFeatured", !form.isFeatured)}
                            >
                                <div>
                                    <div className={`fw-semibold small ${form.isFeatured ? "text-primary" : "text-dark"}`}>
                                        {form.isFeatured ? "⭐ Featured" : "Not Featured"}
                                    </div>
                                    <div className="text-secondary" style={{ fontSize: 11 }}>
                                        {form.isFeatured ? "Shows on homepage" : "Click to feature"}
                                    </div>
                                </div>
                                <div
                                    className={`rounded-pill d-flex align-items-center flex-shrink-0 ${form.isFeatured ? "bg-primary" : "bg-secondary bg-opacity-25"}`}
                                    style={{ width: 44, height: 24, padding: "2px 3px", transition: "background 0.2s" }}
                                >
                                    <div
                                        className="bg-white rounded-circle shadow-sm"
                                        style={{
                                            width: 18, height: 18,
                                            marginLeft: form.isFeatured ? "auto" : 0,
                                            transition: "margin 0.2s",
                                        }}
                                    />
                                </div>
                            </div>
                        </Field>
                    </div>

                </div>
            </SectionCard>

            {/* ── SECTION 4 — SEO (collapsible) ── */}
            {/* <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div
                    className="card-header bg-white border-bottom border-primary border-opacity-25 rounded-top-4 px-4 py-3 d-flex align-items-center justify-content-between"
                    data-bs-toggle="collapse"
                    data-bs-target="#seoSection"
                    style={{ cursor: "pointer" }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 fw-bold flex-shrink-0"
                            style={{ width: 40, height: 40, fontSize: 15 }}
                        >
                            4
                        </div>
                        <div>
                            <h6 className="mb-0 fw-bold text-dark">SEO Settings</h6>
                            <p className="mb-0 text-secondary small">Optional — meta title and description for search engines</p>
                        </div>
                    </div>
                    <span className="text-primary small fw-semibold">Toggle ▾</span>
                </div>

                <div className="collapse" id="seoSection">
                    <div className="card-body px-4 py-4">
                        <div className="row g-3">
                            <div className="col-12">
                                <Field label="Meta Title" hint="Recommended: 50–60 characters. Leave blank to use category name.">
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="e.g. Electrical Services | Your Company"
                                        maxLength={60}
                                        value={form.metaTitle}
                                        onChange={(e) => set("metaTitle", e.target.value)}
                                    />
                                </Field>
                            </div>
                            <div className="col-12">
                                <Field label="Meta Description" hint="Recommended: 150–160 characters.">
                                    <textarea
                                        className="form-control rounded-3"
                                        rows={3}
                                        maxLength={160}
                                        placeholder="A short summary shown in Google search results…"
                                        value={form.metaDescription}
                                        onChange={(e) => set("metaDescription", e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* ── Preview card ── */}
            <div className="card border-0 border-primary border-opacity-25 rounded-4 mb-4" style={{ borderStyle: "dashed", borderWidth: 2 }}>
                <div className="card-body px-4 py-4">
                    <p className="text-secondary small fw-semibold text-uppercase mb-3" style={{ letterSpacing: "0.07em" }}>
                        Live Preview
                    </p>
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 flex-shrink-0"
                            style={{ width: 52, height: 52, fontSize: 26 }}
                        >
                            {form.icon}
                        </div>
                        <div className="flex-fill">
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="fw-bold text-dark fs-6">
                                    {form.name || <span className="text-muted fw-normal fst-italic">Category Name</span>}
                                </span>
                                <span className={`badge rounded-pill px-2 py-1 ${form.status === "active" ? "bg-success" : "bg-secondary"}`} style={{ fontSize: 10 }}>
                                    {form.status === "active" ? "Active" : "Inactive"}
                                </span>
                                {form.isFeatured && (
                                    <span className="badge bg-warning text-dark rounded-pill px-2 py-1" style={{ fontSize: 10 }}>⭐ Featured</span>
                                )}
                            </div>
                            {/* <div className="font-monospace text-primary small mb-1">
                                /categories/{form.slug || <span className="text-muted fst-italic">your-slug</span>}
                            </div> */}
                            <p className="text-secondary small mb-0">
                                {form.description || <span className="fst-italic">Description will appear here…</span>}
                            </p>
                        </div>
                        {form.parentId && (
                            <div className="text-end flex-shrink-0">
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 small">
                                    Under: {parentCategories.find((c) => c.id === Number(form.parentId))?.name}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Actions ── */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-4">
                <button type="button" className="btn btn-outline-secondary rounded-3 px-4">
                    ← Back
                </button>
                <div className="d-flex gap-2">
                    {/* <button
                        type="button"
                        className="btn btn-outline-primary rounded-3 px-4"
                        onClick={() => { set("status", "inactive"); setTimeout(() => handleSubmit({ preventDefault: () => { } }), 0); }}
                    >
                        💾 Save as Draft
                    </button> */}
                    <button
                        type="submit"
                        className="btn btn-primary rounded-3 px-5 fw-semibold"
                    >
                        ✅ Create Category
                    </button>
                </div>
            </div>

        </form>
    );
}