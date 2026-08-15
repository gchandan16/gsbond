"use client"

import React, { useState, useMemo } from 'react'



const ClientTable = ({ clients }) => {
    const [client, setClient] = useState(clients || []);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [currentPage, setPage] = useState(1);
    const perPage = 12;

    // console.log("client", client);
    const ALL_STATUSES = ["All", "Active", "InActive"];


    const filtered = useMemo(() => {
        let data = client.filter((q) => {
            const srch = search.toLowerCase();

            return (
                q.name.toLowerCase().includes(srch) ||
                q.email.toLowerCase().includes(srch)
            );
        });

        if (statusFilter !== "All") {
            data = data.filter((q) => q.status === statusFilter);
        }

        return data;
    }, [client, search, statusFilter]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);


    return (
        <div>
            {/* {toast && (
                <div
                    className={`position-fixed top-0 end-0 m-4 alert alert-${toast.type === "danger" ? "danger" : "success"} border-0 shadow rounded-3 px-4 py-3`}
                    style={{ zIndex: 9999, minWidth: 280 }}
                >
                    {toast.msg}
                </div>
            )} */}

            {/* ── Main card ── */}
            <div className='card border-0 shadow-sm rounded-4 overflow-hidden'>
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



                    </div>
                </div>
                <div className='table-responsive'>
                    <table className='table table-hover align-middle mb-0'>
                        <thead className='table-primary'>
                            <tr>
                                <th className='ps-4' style={{ width: 44 }}>
                                    <input type="checkbox" className='form-check-input' />
                                </th>
                                <th className='user-select-none'>
                                    Client Id
                                </th>
                                <th className='user-select-none'>
                                    Name
                                </th>
                                <th className='user-select-none'>
                                    Email
                                </th>
                                <th className='user-select-none'>
                                    Phone
                                </th>
                                <th className='user-select-none'>
                                    Status
                                </th>
                                <th className='user-select-none'>
                                    Date
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={10}>
                                            <div className="text-center py-5 text-secondary">
                                                <div className="mb-2" style={{ fontSize: 40 }}>📋</div>
                                                <p className="mb-0 fw-semibold">No Client found</p>
                                                <p className="small mb-0">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((c) => (
                                        <tr key={c.id}>

                                            <td className="ps-4">
                                                <input type="checkbox" className="form-check-input" />
                                            </td>

                                            {/* client Id */}
                                            <td>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span>{c.id}</span>
                                                </div>
                                            </td>

                                            {/* client Name */}
                                            <td>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span>{c.name}</span>
                                                </div>
                                            </td>

                                            {/* client email */}
                                            <td>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span>{c.email}</span>
                                                </div>
                                            </td>

                                            {/* client phone */}
                                            <td>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span>{c.phone}</span>
                                                </div>
                                            </td>

                                            {/* client status */}
                                            <td>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span className={`badge px-3 py-2 rounded-pill ${c.status == "Active" ? "bg-success" : "bg-danger"
                                                        }`}
                                                        >{c.status}</span>
                                                </div>
                                            </td>
                                            {/* client status */}
                                            <td>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span>
                                                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>

                {/* pagination */}
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
        </div>
    )
}

export default ClientTable