"use client";

import { useState } from "react";
import axios from "axios";

const ACTIONS = ["view", "create", "edit", "delete"];

const moduleIcons = {
    user:        "👤",
    permissions: "🔐",
    quote:       "🧾",
    category:    "📁",
    assignedQuote:"🧾",
    products:    "📦",
};

const roleBadgeClass = {
    admin:    "bg-primary bg-opacity-10 text-primary",
    operator: "bg-info bg-opacity-10 text-info",
};

function ToggleSwitch({ checked, onChange, disabled }) {
    return (
        <div
            onClick={() => !disabled && onChange(!checked)}
            style={{
                width: 36,
                height: 20,
                borderRadius: 20,
                background: checked ? "#0d6efd" : "#dee2e6",
                position: "relative",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
                opacity: disabled ? 0.5 : 1,
            }}
        >
            <div style={{
                position: "absolute",
                top: 3,
                left: checked ? 19 : 3,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "white",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
        </div>
    );
}

function PermissionCard({ roleData, onEdit }) {
    const { role, permissions, status } = roleData;
    const modules = Object.keys(permissions);

    return (
        <div className="card border-primary-subtle shadow-sm rounded-4 mb-4">
            {/* Card Header */}
            <div className="card-header bg-white border-bottom border-primary border-opacity-25 px-4 py-3 rounded-top-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 fw-bold"
                        style={{ width: 40, height: 40, fontSize: 16, textTransform: "uppercase" }}>
                        {role.slice(0, 1).toUpperCase() =="A" ? "A" : "C"}
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-bold text-dark mb-0 text-capitalize">{role == "admin" ? "Admin" : "Cleaner"}</h6>
                            <span className={`badge rounded-pill px-2 py-1 ${roleBadgeClass[role] || "bg-secondary bg-opacity-10 text-secondary"}`}
                                style={{ fontSize: 10 }}>
                                {/* {role} */}
                            </span>
                            <span className={`badge rounded-pill px-2 py-1 ${status ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"}`}
                                style={{ fontSize: 10 }}>
                                {status ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <p className="text-secondary mb-0" style={{ fontSize: 12 }}>
                            {modules.length} modules · {
                                Object.values(permissions).reduce((sum, mod) =>
                                    sum + Object.values(mod).filter(Boolean).length, 0
                                )
                            } permissions enabled
                        </p>
                    </div>
                </div>
                <button
                    className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-2 px-3"
                    style={{ fontSize: 12 }}
                    onClick={() => onEdit(roleData)}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                </button>
            </div>

            {/* Permissions Table */}
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4 text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>MODULE</th>
                            {ACTIONS.map((a) => (
                                <th key={a} className="text-center text-secondary fw-semibold border-0 text-uppercase" style={{ fontSize: 11 }}>
                                    {a}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map((mod) => (
                            <tr key={mod}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontSize: 16 }}>{moduleIcons[mod] || "⚙️"}</span>
                                        <span className="fw-medium text-dark text-capitalize">{mod}</span>
                                    </div>
                                </td>
                                {ACTIONS.map((action) => (
                                    <td key={action} className="text-center">
                                        {permissions[mod]?.[action] ? (
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1" style={{ fontSize: 11 }}>
                                                ✓
                                            </span>
                                        ) : (
                                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1" style={{ fontSize: 11 }}>
                                                ✗
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EditModal({ roleData, onClose, onSave }) {
    const [form, setForm] = useState(() => ({
        role: roleData.role,
        status: roleData.status,
        permissions: JSON.parse(JSON.stringify(roleData.permissions)), // deep clone
    }));

    const togglePermission = (mod, action) => {
        setForm((f) => ({
            ...f,
            permissions: {
                ...f.permissions,
                [mod]: {
                    ...f.permissions[mod],
                    [action]: !f.permissions[mod][action],
                },
            },
        }));
    };

    const toggleAll = (mod, value) => {
        setForm((f) => ({
            ...f,
            permissions: {
                ...f.permissions,
                [mod]: Object.fromEntries(ACTIONS.map((a) => [a, value])),
            },
        }));
    };

    const modules = Object.keys(form.permissions);

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content border-0 rounded-4 shadow-lg">

                    {/* Header */}
                    <div className="modal-header border-bottom border-primary border-opacity-25 px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3"
                                style={{ width: 38, height: 38, fontSize: 18 }}>
                                🔐
                            </div>
                            <div>
                                <h6 className="modal-title fw-bold text-dark mb-0">
                                    Edit Permissions — <span className="text-primary text-capitalize">{form.role}</span>
                                </h6>
                                <p className="text-secondary mb-0 small">Toggle access for each module and action</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 py-4">

                        {/* Status toggle */}
                        <div className="d-flex align-items-center justify-content-between border border-primary border-opacity-25 rounded-3 px-3 py-2 mb-4"
                            style={{ background: "#f8fbff" }}>
                            <div>
                                <div className="fw-semibold text-dark" style={{ fontSize: 13 }}>Role Status</div>
                                <div className="text-secondary" style={{ fontSize: 11 }}>
                                    {form.status ? "Active — role is enabled" : "Inactive — role is disabled"}
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={form.status}
                                onChange={(val) => setForm((f) => ({ ...f, status: val }))}
                            />
                        </div>

                        {/* Permissions per module */}
                        <div className="d-flex flex-column gap-3">
                            {modules.map((mod) => {
                                const allEnabled = ACTIONS.every((a) => form.permissions[mod][a]);
                                const noneEnabled = ACTIONS.every((a) => !form.permissions[mod][a]);

                                return (
                                    <div key={mod} className="border border-primary border-opacity-25 rounded-3 overflow-hidden">
                                        {/* Module header */}
                                        <div className="d-flex align-items-center justify-content-between px-3 py-2"
                                            style={{ background: "#f0f7ff", borderBottom: "1px solid #cfe2ff" }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <span style={{ fontSize: 16 }}>{moduleIcons[mod] || "⚙️"}</span>
                                                <span className="fw-semibold text-dark text-capitalize" style={{ fontSize: 13 }}>{mod}</span>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success rounded-pill px-2 py-0"
                                                    style={{ fontSize: 11 }}
                                                    onClick={() => toggleAll(mod, true)}
                                                    disabled={allEnabled}
                                                >
                                                    All On
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0"
                                                    style={{ fontSize: 11 }}
                                                    onClick={() => toggleAll(mod, false)}
                                                    disabled={noneEnabled}
                                                >
                                                    All Off
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action toggles */}
                                        <div className="d-flex flex-wrap gap-0" style={{ background: "white" }}>
                                            {ACTIONS.map((action, i) => (
                                                <div
                                                    key={action}
                                                    className="d-flex align-items-center justify-content-between px-3 py-2 flex-grow-1"
                                                    style={{
                                                        minWidth: "45%",
                                                        borderRight: i % 2 === 0 ? "1px solid #f0f0f0" : "none",
                                                        borderBottom: i < 2 ? "1px solid #f0f0f0" : "none",
                                                    }}
                                                >
                                                    <span className="text-secondary text-capitalize" style={{ fontSize: 12 }}>{action}</span>
                                                    <ToggleSwitch
                                                        checked={form.permissions[mod][action]}
                                                        onChange={() => togglePermission(mod, action)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top border-primary border-opacity-25 px-4 py-3">
                        <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary rounded-3 px-4 fw-semibold"
                            onClick={() => { onSave(form); onClose(); }}
                        >
                            Save Permissions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PermissionsClient({ initialPermissions,updatePermission  }) {
    const [permissions, setPermissions] = useState(initialPermissions);
    const [editTarget, setEditTarget] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (updated) => {
        // optimistic update
        setPermissions((p) =>
            p.map((r) => (r.role === updated.role ? { ...r, ...updated } : r))
        );

        try {
            await updatePermission(updated);  // calls server action directly
            showToast(`✅ Permissions updated for ${updated.role}`);
        } catch (err) {
            setPermissions(initialPermissions); // revert on error
            showToast("❌ Failed to update permissions");
            console.error(err);
        }
    };

    return (
        <>
            {/* Permission cards */}
            {permissions.map((p) => (
                <PermissionCard key={p.role} roleData={p} onEdit={setEditTarget} />
            ))}

            {/* Edit modal */}
            {editTarget && (
                <EditModal
                    roleData={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSave={handleSave}
                />
            )}

            {/* Toast */}
            {toast && (
                <div
                    className="position-fixed bottom-0 end-0 m-4 alert alert-primary border-primary shadow rounded-3 py-2 px-3"
                    style={{ zIndex: 9999, fontSize: 13, minWidth: 220 }}
                >
                    {toast}
                </div>
            )}
        </>
    );
}