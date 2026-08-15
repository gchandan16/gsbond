"use client";
// ✅ CLIENT COMPONENT (CSR) — receives SSR data as props, handles interactivity

import { useState, useMemo } from "react";

const ROLE_BADGES = {
    Admin: "badge bg-primary",
    Editor: "badge bg-success",
    Viewer: "badge bg-secondary",
    Moderator: "badge bg-info text-dark",
    Analyst: "badge bg-warning text-dark",
};

const ALL_ROLES = ["All", "Admin", "Editor", "Viewer", "Moderator", "Analyst"];

function getInitials(name) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

export default function UsersTable({ users }) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [sortField, setSortField] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    // Filter + sort
    const filtered = useMemo(() => {
        let data = users.filter((u) => {
            const q = search.toLowerCase();
            return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        });
        if (roleFilter !== "All") data = data.filter((u) => u.role === roleFilter);
        data = [...data].sort((a, b) => {
            const av = a[sortField]?.toLowerCase?.() ?? "";
            const bv = b[sortField]?.toLowerCase?.() ?? "";
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        return data;
    }, [users, search, roleFilter, sortField, sortDir]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    function handleSort(field) {
        if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortField(field); setSortDir("asc"); }
        setCurrentPage(1);
    }

    function SortArrow({ field }) {
        if (sortField !== field) return <span className="text-secondary ms-1">↕</span>;
        return <span className="text-primary ms-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
    }

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

            {/* ── Toolbar ── */}
            <div className="card-header bg-white border-bottom border-primary border-opacity-25 p-3">
                <div className="row g-2 align-items-center">

                    {/* Search */}
                    <div className="col-12 col-md-4">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-primary">
                                🔍
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search name or email…"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>

                    {/* Role filter pills */}
                    <div className="col-12 col-md-6">
                        <div className="d-flex flex-wrap gap-2">
                            {ALL_ROLES.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => { setRoleFilter(r); setCurrentPage(1); }}
                                    className={`btn btn-sm rounded-pill px-3 ${roleFilter === r
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Count */}
                    <div className="col-12 col-md-2 text-md-end">
                        <span className="text-secondary small">
                            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                </div>
            </div>

            {/* ── Table ── */}
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                        <tr>
                            <th className="ps-4" style={{ width: 44 }}>
                                <input type="checkbox" className="form-check-input" />
                            </th>
                            <th
                                role="button"
                                className="user-select-none"
                                onClick={() => handleSort("name")}
                            >
                                Name <SortArrow field="name" />
                            </th>
                            <th
                                role="button"
                                className="user-select-none"
                                onClick={() => handleSort("email")}
                            >
                                Email <SortArrow field="email" />
                            </th>
                            <th
                                role="button"
                                className="user-select-none"
                                onClick={() => handleSort("role")}
                            >
                                Role <SortArrow field="role" />
                            </th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="text-center py-5 text-secondary">
                                        <div className="fs-1 mb-2">🔍</div>
                                        <p className="mb-0">No users match your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map((user) => (
                                <tr key={user.id}>
                                    {/* Checkbox */}
                                    <td className="ps-4">
                                        <input type="checkbox" className="form-check-input" />
                                    </td>

                                    {/* Name + Avatar */}
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold flex-shrink-0"
                                                style={{ width: 38, height: 38, fontSize: 13 }}
                                            >
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <div className="fw-semibold text-dark small">{user.name}</div>
                                                <div className="text-secondary" style={{ fontSize: 11 }}>
                                                    ID #{user.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td>
                                        <span className="text-secondary small font-monospace">
                                            {user.email}
                                        </span>
                                    </td>

                                    {/* Role Badge */}
                                    <td>
                                        <span className={`${ROLE_BADGES[user.role] ?? "badge bg-secondary"} rounded-pill px-3 py-2`}>
                                            {user.role}
                                        </span>
                                    </td>

                                    {/* Action Dropdown */}
                                    <td className="text-center">
                                        <div className="dropdown">
                                            <button
                                                className="btn btn-sm btn-outline-primary rounded-circle px-2"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                ⋮
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                                <li>
                                                    <button
                                                        className="dropdown-item d-flex align-items-center gap-2"
                                                        onClick={() => alert(`Edit: ${user.name}`)}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        className="dropdown-item d-flex align-items-center gap-2"
                                                        onClick={() => alert(`Deactivate: ${user.name}`)}
                                                    >
                                                        🚫 Deactivate
                                                    </button>
                                                </li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                    <button
                                                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                                                        onClick={() => alert(`Delete: ${user.name}`)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="card-footer bg-white border-top border-primary border-opacity-25 d-flex justify-content-between align-items-center px-4 py-3">
                    <span className="text-secondary small">
                        Page {currentPage} of {totalPages}
                    </span>
                    <nav>
                        <ul className="pagination pagination-sm mb-0 gap-1">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link rounded-3 border-primary text-primary"
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                    ← Prev
                                </button>
                            </li>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                                    <button
                                        className="page-link rounded-3"
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button
                                    className="page-link rounded-3 border-primary text-primary"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                >
                                    Next →
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

        </div>
    );
}