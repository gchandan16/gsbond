"use client";
import axios from "axios";
// ✅ CLIENT COMPONENT (CSR)
// Category list with search, filter, update modal, delete confirm — Bootstrap only

import { useState, useMemo, useEffect } from "react";




// ── helpers ───────────────────────────────────────────────────────────────────
function toSlug(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

const ICON_OPTIONS = [
    "📦", "🛠️", "💡", "🖥️", "📋", "🔧", "🎯", "📊",
    "🚀", "⚙️", "🔒", "🌐", "📱", "🖨️", "🔌", "💼",
];

// ── Update Modal ──────────────────────────────────────────────────────────────
function UpdateModal({ category, allCategories, onClose, onSave }) {
    // console.log("onclick update",category);
    const [form, setForm] = useState({
        name: category.name,
        description: category.description,
        status: category.status,
        icon: category.icon,
        isFeatured: category.isFeatured,
    });
    const [errors, setErrors] = useState({});

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    function handleNameChange(val) {
        set("name", val);
    }

    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required.";
        if (!form.description.trim()) e.description = "Description is required.";
        return e;
    }

    async function handleSave() {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        onSave(category.id, form);
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
                                style={{ width: 40, height: 40, fontSize: 20 }}
                            >
                                {form.icon}
                            </div>
                            <div>
                                <h6 className="modal-title fw-bold text-dark mb-0">Update Category</h6>
                                <p className="text-secondary small mb-0">ID #{category.id} · Created {category.createdAt}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 py-4">
                        <div className="row g-3">

                            {/* Name */}
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Category Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    className={`form-control rounded-3 ${errors.name ? "is-invalid" : ""}`}
                                    value={form.name}
                                    maxLength={80}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>

                           

                            {/* Description */}
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">
                                    Description <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className={`form-control rounded-3 ${errors.description ? "is-invalid" : ""}`}
                                    rows={3}
                                    maxLength={500}
                                    value={form.description}
                                    onChange={(e) => set("description", e.target.value)}
                                />
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                                <div className="form-text">{form.description.length}/500 characters</div>
                            </div>

                            {/* Icon picker */}
                            <div className="col-12">
                                <label className="form-label small fw-semibold text-dark mb-1">Icon</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {ICON_OPTIONS.map((ic) => (
                                        <button
                                            key={ic} type="button"
                                            className={`btn rounded-3 px-2 py-1 ${form.icon === ic ? "btn-primary" : "btn-outline-secondary"}`}
                                            style={{ fontSize: 18, minWidth: 40 }}
                                            onClick={() => set("icon", ic)}
                                        >{ic}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-dark mb-1">Status</label>
                                <select
                                    className="form-select rounded-3"
                                    value={form.status}
                                    onChange={(e) => set("status", e.target.value)}
                                >
                                    <option value="Active">✅ Active</option>
                                    <option value="Inactive">🚫 Inactive</option>
                                </select>
                            </div>

                            

                            

                            {/* Featured toggle */}
                            <div className="col-12">
                                <div
                                    className={`border rounded-3 px-4 py-3 d-flex align-items-center justify-content-between ${form.isFeatured ? "border-primary bg-primary bg-opacity-10" : "border-secondary border-opacity-25"}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => set("isFeatured", !form.isFeatured)}
                                >
                                    <div>
                                        <div className={`fw-semibold small ${form.isFeatured ? "text-primary" : "text-dark"}`}>
                                            {form.isFeatured ? "⭐ Featured Category" : "Not Featured"}
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: 11 }}>
                                            {form.isFeatured ? "Displayed on homepage" : "Click to mark as featured"}
                                        </div>
                                    </div>
                                    <div
                                        className={`rounded-pill d-flex align-items-center flex-shrink-0 ${form.isFeatured ? "bg-primary" : "bg-secondary bg-opacity-25"}`}
                                        style={{ width: 44, height: 24, padding: "2px 3px" }}
                                    >
                                        <div
                                            className="bg-white rounded-circle shadow-sm"
                                            style={{ width: 18, height: 18, marginLeft: form.isFeatured ? "auto" : 0, transition: "margin 0.2s" }}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary rounded-3 px-5 fw-semibold" onClick={handleSave}>
                            ✅ Save Changes
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ category, onClose, onConfirm }) {
    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <div className="modal-body text-center px-4 py-5">
                        <div className="mb-3" style={{ fontSize: 52 }}>{category.icon}</div>
                        <h5 className="fw-bold text-dark mb-1">Delete Category?</h5>
                        <p className="text-secondary small mb-1">You are about to permanently delete</p>
                        <p className="fw-bold text-dark mb-1">{category.name}</p>

                        

                        <div className="alert bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 text-danger small mb-4">
                            🗑️ This action cannot be undone.
                        </div>

                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>Cancel</button>
                            <button
                                className="btn btn-danger rounded-3 px-4 fw-semibold"
                                onClick={() => { onConfirm(category.id); onClose(); }}
                            >
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
export default function CategoryList({ categories: initial }) {
    const [categories, setCategories] = useState(initial);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [updateModal, setUpdateModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [currentPage, setPage] = useState(1);
    const perPage = 12;

    const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);
  }, []);


    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    // console.log("categories",categories);

    async function handleUpdate(id, form) {
        setCategories((cats) =>
            cats.map((c) => c.id === id ? { ...c, ...form } : c)
        );
        const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/${id}`,
            {
                name:form.name,
                description:form.description,
                status:form.status == "Active"? 1 : 0,
            },
            {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            }
        )
        showToast("Category updated successfully! ✏️");
    }

    async function handleDelete(id) {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category/${id}`,
            {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            }
        );
        setCategories((cats) => cats.filter((c) => c.id !== id));
        showToast("Category deleted. 🗑️", "danger");
    }

    const filtered = useMemo(() => {
        let data = categories.filter((c) => {
            const q = search.toLowerCase();
            return c.name.toLowerCase().includes(q);
        });
        if (statusFilter === "Active") data = data.filter((c) => c.status === "Active");
        if (statusFilter === "Inactive") data = data.filter((c) => c.status === "Inactive");
        if (statusFilter === "Featured") data = data.filter((c) => c.isFeatured);
        return data;
    }, [categories, search, statusFilter]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    const parentOf = (id) => categories.find((c) => c.id === id);

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
            {updateModal && (
                <UpdateModal
                    category={updateModal}
                    allCategories={categories}
                    onClose={() => setUpdateModal(null)}
                    onSave={handleUpdate}
                />
            )}
            {deleteModal && (
                <DeleteModal
                    category={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onConfirm={handleDelete}
                />
            )}

            {/* ── Stats row ── */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total", value: categories.length, icon: "📦", color: "primary" },
                    { label: "Active", value: categories.filter((c) => c.status === "Active").length, icon: "✅", color: "success" },
                    { label: "Inactive", value: categories.filter((c) => c.status === "Inactive").length, icon: "🚫", color: "secondary" },
                    { label: "Featured", value: categories.filter((c) => c.isFeatured).length, icon: "⭐", color: "warning" },
                ].map((stat) => (
                    <div key={stat.label} className="col-6 col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 px-4 py-3 d-flex flex-row align-items-center gap-3">
                            <div
                                className={`d-flex align-items-center justify-content-center bg-${stat.color} bg-opacity-10 rounded-3 flex-shrink-0`}
                                style={{ width: 44, height: 44, fontSize: 22 }}
                            >
                                {stat.icon}
                            </div>
                            <div>
                                <div className={`fw-bold fs-5 text-${stat.color === "warning" ? "dark" : stat.color}`}>{stat.value}</div>
                                <div className="text-secondary small">{stat.label}</div>
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
                                    placeholder="Search name or slug…"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-5">
                            <div className="d-flex flex-wrap gap-2">
                                {["All", "Active", "Inactive", "Featured"].map((s) => (
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

                        <div className="col-12 col-md-3 d-flex justify-content-md-end align-items-center gap-3">
                            <span className="text-secondary small">{filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}</span>
                            <a href="/dashboard/services/category/create" className="btn btn-primary btn-sm rounded-3 px-3 text-nowrap">
                                + New Category
                            </a>
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
                                <th>Category</th>
                                <th className="d-none d-lg-table-cell">Description</th>
                                <th className="text-center">Status</th>
                                <th className="d-none d-lg-table-cell">Created</th>
                                <th className="text-center" style={{ minWidth: 140 }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>
                                        <div className="text-center py-5 text-secondary">
                                            <div className="mb-2" style={{ fontSize: 40 }}>📂</div>
                                            <p className="fw-semibold mb-0">No categories found</p>
                                            <p className="small mb-0">Try adjusting your search or filter</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((cat) => (
                                    <tr key={cat.id}>

                                        <td className="ps-4">
                                            <input type="checkbox" className="form-check-input" />
                                        </td>

                                        {/* Category name + icon */}
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div
                                                    className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 flex-shrink-0"
                                                    style={{ width: 38, height: 38, fontSize: 20 }}
                                                >
                                                    {cat.icon}
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="fw-semibold text-dark small">{cat.name}</span>
                                                        {cat.isFeatured && (
                                                            <span className="badge bg-warning text-dark rounded-pill px-2" style={{ fontSize: 9 }}>⭐ Featured</span>
                                                        )}
                                                    </div>
                                                    <div className="text-secondary" style={{ fontSize: 11 }}>ID #{cat.id}</div>
                                                </div>
                                            </div>
                                        </td>

                                        

                                        {/* Description */}
                                        <td className="d-none d-lg-table-cell" style={{ maxWidth: 200 }}>
                                            <span className="text-secondary small text-truncate d-block" style={{ maxWidth: 200 }}>
                                                {cat.description}
                                            </span>
                                        </td>

                                       

                                        

                                        {/* Status */}
                                        <td className="text-center">
                                            {cat.status === "Active" ? (
                                                <span className="badge bg-success rounded-pill px-3 py-2">Active</span>
                                            ) : (
                                                <span className="badge bg-secondary rounded-pill px-3 py-2">Inactive</span>
                                            )}
                                        </td>

                                        

                                        {/* Created date */}
                                        <td className="d-none d-lg-table-cell">
                                            <span className="text-secondary small">{cat.createdAt}</span>
                                        </td>

                                        {/* ── Actions ── */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">

                                                {/* Update */}
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Edit Category"
                                                    onClick={() => setUpdateModal(cat)}
                                                >
                                                    <span>✏️</span>
                                                    <span className="d-none d-xl-inline" style={{ fontSize: 12 }}>Edit</span>
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center gap-1 px-2"
                                                    title="Delete Category"
                                                    onClick={() => setDeleteModal(cat)}
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
                            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
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