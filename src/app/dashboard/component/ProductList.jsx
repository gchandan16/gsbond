"use client";
import axios from "axios";
// ✅ CLIENT COMPONENT (CSR)

import { useState, useMemo, useEffect } from "react";


// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n || 0);

function toSlug(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ product, categories, onClose, onSave }) {
    // console.table(product)
    const [form, setForm] = useState({
        name: product.name,
        description: product.description,
        status: product.status,
        categoryId: product.categoryId,
        baseAmount: product.baseAmount,
        taxRate: product.taxRate,
    });
    const [slugManual, setSlugManual] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleNameChange = (val) => {
        set("name", val);
        if (!slugManual) set("slug", toSlug(val));
    };

    const taxAmt = ((form.baseAmount || 0) * form.taxRate) / 100;
    const totalAmount = (parseFloat(form.baseAmount) || 0) + taxAmt;

    const selectedCat = categories.find((c) => c.id === Number(form.categoryId));

    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required.";
        // if (!form.slug.trim()) e.slug = "Slug is required.";
        if (!form.description.trim()) e.description = "Description is required.";
        if (!form.categoryId) e.categoryId = "Category is required.";
        if (!form.baseAmount || parseFloat(form.baseAmount) <= 0) e.baseAmount = "Enter a valid amount.";
        return e;
    }

    async function handleSave() {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        const taxA = (parseFloat(form.baseAmount) * form.taxRate) / 100;

        // console.table(form);


        // showToast("Product updated successfully! ✏️");
        // console.log("response",response)

        onSave(product.id, {
            ...form,
            categoryId: Number(form.categoryId),
            categoryName: selectedCat?.name ?? product.categoryName,
            categoryIcon: selectedCat?.icon ?? product.categoryIcon,
            baseAmount: parseFloat(form.baseAmount),
            taxAmt: taxA,
            totalAmount: parseFloat(form.baseAmount) + taxA,
        });
        onClose();
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content border-0 rounded-4 shadow-lg">

                    {/* Header */}
                    <div className="modal-header border-bottom border-primary border-opacity-25 px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 flex-shrink-0"
                                style={{ width: 40, height: 40, fontSize: 18 }}
                            >
                                ✏️
                            </div>
                            <div>
                                <h6 className="modal-title fw-bold text-dark mb-0">Edit Service</h6>
                                <p className="text-secondary small mb-0">ID #{product.id} · {product.createdAt}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 py-4">
                        <div className="row g-3">

                            {/* Name */}
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Service Name <span className="text-danger">*</span></label>
                                <input
                                    className={`form-control rounded-3 ${errors.name ? "is-invalid" : ""}`}
                                    value={form.name}
                                    maxLength={100}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>



                            {/* Description */}
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">Description <span className="text-danger">*</span></label>
                                <textarea
                                    className={`form-control rounded-3 ${errors.description ? "is-invalid" : ""}`}
                                    rows={3}
                                    maxLength={500}
                                    value={form.description}
                                    onChange={(e) => set("description", e.target.value)}
                                />
                                <div className="form-text">{form.description.length}/500</div>
                                {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                            </div>

                            {/* Category */}
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Category <span className="text-danger">*</span></label>
                                <select
                                    className={`form-select rounded-3 ${errors.categoryId ? "is-invalid" : ""}`}
                                    value={form.categoryId}
                                    onChange={(e) => set("categoryId", e.target.value)}
                                >
                                    <option value="">— Select Category —</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.icon}  {c.name}</option>
                                    ))}
                                </select>
                                {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                            </div>

                            {/* Status */}
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Status</label>
                                <select className="form-select rounded-3" value={form.status} onChange={(e) => set("status", e.target.value)}>
                                    <option value="Active">✅ Active</option>
                                    <option value="Inactive">🚫 Inactive</option>
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">Base Amount ($) <span className="text-danger">*</span></label>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">$</span>
                                    <input
                                        type="number"
                                        className={`form-control border-start-0 rounded-end-3 font-monospace ${errors.baseAmount ? "is-invalid" : ""}`}
                                        min={0}
                                        step="0.01"
                                        value={form.baseAmount}
                                        onChange={(e) => set("baseAmount", e.target.value)}
                                    />
                                </div>
                                {errors.baseAmount && <div className="text-danger small mt-1">⚠ {errors.baseAmount}</div>}
                            </div>

                            {/* Tax rate */}
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">GST Rate</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {[0, 5, 12, 18, 28].map((r) => (
                                        <button
                                            key={r} type="button"
                                            className={`btn btn-sm rounded-pill px-3 ${form.taxRate === r ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => set("taxRate", r)}
                                        >
                                            {r === 0 ? "Exempt" : `${r}%`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price summary */}
                            {parseFloat(form.baseAmount) > 0 && (
                                <div className="col-12">
                                    <div className="card border-0 bg-primary bg-opacity-10 rounded-3 px-4 py-3 d-flex flex-row flex-wrap gap-4 align-items-center">
                                        <div className="small text-secondary">Base: <span className="fw-semibold text-dark font-monospace">{fmt(form.baseAmount)}</span></div>
                                        {form.taxRate > 0 && <div className="small text-secondary">GST ({form.taxRate}%): <span className="fw-semibold text-dark font-monospace">+ {fmt(taxAmt)}</span></div>}
                                        <div className="ms-auto fw-bold text-primary">Total: <span className="fs-5 font-monospace">{fmt(totalAmount)}</span></div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary rounded-3 px-5 fw-semibold" onClick={handleSave}>✅ Save Changes</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ product, onClose, onConfirm }) {
    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <div className="modal-body text-center px-4 py-5">
                        <div className="mb-3" style={{ fontSize: 50 }}>🗑️</div>
                        <h5 className="fw-bold text-dark mb-1">Delete Product?</h5>
                        <p className="text-secondary small mb-1">You are about to permanently delete</p>
                        <p className="fw-bold text-dark mb-1">{product.name}</p>
                        <p className="font-monospace text-primary small mb-1">/products/{product.slug}</p>
                        <div className="d-flex justify-content-center gap-2 my-3">
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 small">
                                {product.categoryIcon} {product.categoryName}
                            </span>
                            <span className="badge bg-primary rounded-pill px-3 py-2 small font-monospace">
                                {fmt(product.totalAmount)}
                            </span>
                        </div>
                        <div className="alert bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 text-danger small mb-4">
                            ⚠️ This action cannot be undone.
                        </div>
                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                            <button className="btn btn-danger rounded-3 px-4 fw-semibold" onClick={() => { onConfirm(product.id); onClose(); }}>
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
export default function ProductList({ products: initial, categories }) {
    const [products, setProducts] = useState(initial);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [categoryFilter, setCategory] = useState("All");
    const [sortField, setSortField] = useState("createdAt");
    const [sortDir, setSortDir] = useState("desc");
    const [editModal, setEditModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [currentPage, setPage] = useState(1);
    const perPage = 10;

    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        setToken(storedToken);
    }, []);


    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    async function handleSave(id, data) {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product/${id}`,
            {
                name: data.name,
                description: data.description,
                status: data.status === "Active" ? 1 : 0,
                categoryId: data.categoryId,
                gst: (data.taxRate || 0).toString(),
                base: Number(data.baseAmount),
                price: Number(data.baseAmount) + (Number(data.baseAmount) * Number(data.taxRate || 0)) / 100, // ✅ Correct
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        setProducts((ps) => ps.map((p) => p.id === id ? { ...p, ...data } : p));
        showToast("Product updated successfully! ✏️");
    }

    async function handleDelete(id) {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        setProducts((ps) => ps.filter((p) => p.id !== id));
        showToast("Product deleted. 🗑️", "danger");
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
        let data = products.filter((p) => {
            const q = search.toLowerCase();
            return (
                p.name.toLowerCase().includes(q)
            );
        });
        if (statusFilter !== "All") data = data.filter((p) => p.status === statusFilter.toLowerCase());
        if (categoryFilter !== "All") data = data.filter((p) => p.categoryName === categoryFilter);
        data = [...data].sort((a, b) => {
            let av = a[sortField], bv = b[sortField];
            if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return data;
    }, [products, search, statusFilter, categoryFilter, sortField, sortDir]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    const activeCount = products.filter((p) => p.status === "Active").length;
    const inactiveCount = products.filter((p) => p.status === "Inactive").length;
    const totalValue = products.reduce((s, p) => s + p.totalAmount, 0);


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
            {editModal && <EditModal product={editModal} categories={categories} onClose={() => setEditModal(null)} onSave={handleSave} />}
            {deleteModal && <DeleteModal product={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} />}

            {/* ── Stats row ── */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total Services", value: products.length, icon: "📦", color: "primary" },
                    { label: "Active", value: activeCount, icon: "✅", color: "success" },
                    { label: "Inactive", value: inactiveCount, icon: "🚫", color: "secondary" },
                    { label: "Total Value", value: fmt(totalValue), icon: "💰", color: "warning", isText: true },
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

                        {/* Search */}
                        <div className="col-12 col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-primary">🔍</span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Search Services..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Status filter */}
                        <div className="col-12 col-md-3">
                            <div className="d-flex gap-2">
                                {["All", "Active", "Inactive"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setStatus(s); setPage(1); }}
                                        className={`btn btn-sm rounded-pill px-3 flex-fill ${statusFilter === s ? "btn-primary" : "btn-outline-primary"}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category filter */}
                        <div className="col-12 col-md-4">
                            <div className="d-flex flex-wrap gap-2">
                                <button
                                    onClick={() => { setCategory("All"); setPage(1); }}
                                    className={`btn btn-sm rounded-pill px-3 ${categoryFilter === "All" ? "btn-primary" : "btn-outline-primary"}`}
                                >
                                    All
                                </button>
                                {categories.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => { setCategory(c.name); setPage(1); }}
                                        className={`btn btn-sm rounded-pill px-3 ${categoryFilter === c.name ? "btn-primary" : "btn-outline-primary"}`}
                                    >
                                        {c.icon} {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Count + new */}
                        <div className="col-12 col-md-2 d-flex justify-content-md-end align-items-center gap-3">
                            <span className="text-secondary small">{filtered.length} Services{filtered.length !== 1 ? "s" : ""}</span>
                            <a href="/dashboard/services/service/create" className="btn btn-primary btn-sm rounded-3 px-3 text-nowrap">+ New</a>
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
                                <th role="button" className="user-select-none" onClick={() => toggleSort("name")}>
                                    Service <SortArrow field="name" />
                                </th>
                                <th className="d-none d-md-table-cell">Category</th>
                                <th className="d-none d-lg-table-cell">Description</th>

                                <th className="text-center d-none d-lg-table-cell">GST</th>
                                <th role="button" className="user-select-none text-end" onClick={() => toggleSort("totalAmount")}>
                                    Total <SortArrow field="totalAmount" />
                                </th>
                                <th role="button" className="user-select-none text-center" onClick={() => toggleSort("status")}>
                                    Status <SortArrow field="status" />
                                </th>
                                <th className="d-none d-lg-table-cell">Created</th>
                                <th className="text-center" style={{ minWidth: 140 }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>
                                        <div className="text-center py-5 text-secondary">
                                            <div className="mb-2" style={{ fontSize: 40 }}>📦</div>
                                            <p className="fw-semibold mb-0">No products found</p>
                                            <p className="small mb-0">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((product) => (
                                    <tr key={product.id}>

                                        <td className="ps-4">
                                            <input type="checkbox" className="form-check-input" />
                                        </td>

                                        {/* Product name */}
                                        <td>
                                            <div className="fw-semibold text-dark small">{product.name}</div>

                                        </td>

                                        {/* Category */}
                                        <td className="d-none d-md-table-cell">
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 small">
                                                {product.categoryIcon} {product.categoryName}
                                            </span>
                                        </td>

                                        {/* Description */}
                                        <td className="d-none d-lg-table-cell" style={{ maxWidth: 180 }}>
                                            <span className="text-secondary small text-truncate d-block" style={{ maxWidth: 180 }}>
                                                {product.description}
                                            </span>
                                        </td>



                                        {/* GST */}
                                        <td className="text-center d-none d-lg-table-cell">
                                            {Number(product.taxRate) > 0 ? (
                                                <span className="badge bg-light text-dark border rounded-pill px-2 small">{product.taxRate}%</span>
                                            ) : (
                                                <span className="text-muted small">Exempt</span>
                                            )}
                                        </td>

                                        {/* Total */}
                                        <td className="text-end">
                                            <span className="fw-bold text-primary font-monospace small">{fmt(product.totalAmount)}</span>
                                        </td>

                                        {/* Status */}
                                        <td className="text-center">
                                            {product.status === "Active" ? (
                                                <span className="badge bg-success rounded-pill px-3 py-2">Active</span>
                                            ) : (
                                                <span className="badge bg-secondary rounded-pill px-3 py-2">Inactive</span>
                                            )}
                                        </td>

                                        {/* Date */}
                                        <td className="d-none d-lg-table-cell">
                                            <span className="text-secondary small">{product.createdAt}</span>
                                        </td>

                                        {/* ── Actions ── */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">

                                                {/* Edit */}
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Edit Product"
                                                    onClick={() => setEditModal(product)}
                                                >
                                                    <span>✏️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Edit</span>
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Delete Product"
                                                    onClick={() => setDeleteModal(product)}
                                                >
                                                    <span>🗑️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Delete</span>
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
                            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} Services
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