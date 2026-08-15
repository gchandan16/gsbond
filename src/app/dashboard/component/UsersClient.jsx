"use client";

import axios from "axios";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";



const roleBadge = (role) => {
    const map = {
        admin: "badge bg-primary bg-opacity-10 text-primary",
        operator: "badge bg-info bg-opacity-10 text-info",
    };
    return <span className={map[role] || "badge bg-secondary bg-opacity-10 text-secondary"}>{role}</span>;
};

const avatarColors = ["bg-primary", "bg-success", "bg-info", "bg-warning", "bg-danger", "bg-secondary"];
const initials = (name) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export default function UsersClient({ initialUsers }) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [addUser, setAddUser] = useState(false); // ✅ boolean flag, not a user object
    const [editUser, setEditUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", role: "operator", documents: [], dateOfJoining: "", dateOfBirth: "",operatorPercentage:"" });
    const [form1, setForm1] = useState({ name: "", email: "", role: "operator", password: "",operatorPercentage:"" });

    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        setToken(storedToken);
    }, []);


    const filtered = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase()) // ✅ added role search
    );

    // ✅ opens the add modal and resets form1
    const openAddModal = () => {
        setForm1({ name: "", email: "", role: "operator", password: "" });
        setAddUser(true);
    };


    const router = useRouter();



    // ✅ appends new user to the array
    const saveUser = async () => {
        setUsers((p) => [...p, { id: Date.now(), ...form1 }]);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
            {
                name: form1.name,
                email: form1.email,
                password: form1.password,
                role: form1.role,
                operatorPercentage:form1.operatorPercentage
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        setAddUser(false);
        window.location.reload();
    };

    const openEdit = (user) => {
        setEditUser(user);
        setForm({ name: user.name, email: user.email, role: user.role, documents: user?.documents || [], dateOfJoining: user?.dateOfJoining, dateOfBirth: user?.dateOfBirth,operatorPercentage:user?.operatorPercentage });
    };

    const saveEdit = async () => {
        try {
            // Build FormData to support file uploads
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            formData.append("role", form.role);
            formData.append("dateOfJoining", form.dateOfJoining || "");
            formData.append("dateOfBirth", form.dateOfBirth || "");
            formData.append("operatorPercentage", form.operatorPercentage || "");

            // Append documents array
            // Each doc: { name: "Aadhar", file: File, preview: "blob:..." }
            (form.documents || []).forEach((doc, index) => {
                formData.append(`documents[${index}][name]`, doc.name);
                if (doc.file) {
                    formData.append(`documents[${index}][file]`, doc.file);
                }
            });

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${editUser.id}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
                }
            );

            // Update local state with server response if available, else use form
            const updatedUser = response.data?.data || { ...editUser, ...form };
            setUsers((p) =>
                p.map((u) => (u.id === editUser.id ? updatedUser : u))
            );

            setEditUser(null);
        } catch (error) {
            console.error("Failed to update user:", error?.response?.data || error.message);
            // Optionally show a toast/alert here
        }
    };

    const confirmDelete = async () => {
        try {
            setUsers((p) => p.filter((u) => u.id !== deleteUser.id));

            const token = localStorage.getItem("authToken"); // or from cookies

            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${deleteUser.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json", // ✅ correct for DELETE
                    },
                }
            );

            setDeleteUser(null);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    return (
        <div className="p-4" style={{ background: "#f0f7ff", minHeight: "100%" }}>

            {/* Page title */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h5 className="fw-bold text-dark mb-1" style={{ fontSize: 18 }}>User Management</h5>
                    <p className="text-secondary mb-0" style={{ fontSize: 13 }}>Manage admin accounts and access rights</p>
                </div>
                {/* ✅ calls openAddModal, not saveUser */}
                <button className="btn btn-primary d-flex align-items-center gap-2 fw-semibold" style={{ fontSize: 13 }} onClick={openAddModal}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add User
                </button>
            </div>

            {/* Table card */}
            <div className="card border-primary-subtle shadow-sm">
                <div className="card-header bg-white border-primary-subtle d-flex align-items-center justify-content-between py-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-dark" style={{ fontSize: 14 }}>All Users</span>
                        <span className="badge bg-primary bg-opacity-10 text-primary">{filtered.length}</span>
                    </div>
                    <div className="input-group input-group-sm" style={{ width: 220 }}>
                        <span className="input-group-text bg-white border-primary-subtle text-secondary">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            className="form-control border-primary-subtle"
                            placeholder="Search users…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                        <thead className="table-light">
                            <tr>
                                {/* <th className="text-secondary fw-semibold border-0 ps-4" style={{ fontSize: 11 }}>ID</th> */}
                                <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>NAME</th>
                                <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>EMAIL</th>
                                <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>Percentage (%)</th>
                                <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>ROLE</th>
                                <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-secondary py-5">No users match your search.</td>
                                </tr>
                            ) : (
                                filtered.map((user) => (
                                    <tr key={user.id}>
                                        {/* <td className="ps-4 text-secondary" style={{ fontSize: 12 }}>#{user.id}</td> */}
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 ${avatarColors[user.id % avatarColors.length]}`}
                                                    style={{ width: 32, height: 32, fontSize: 12 }}
                                                >
                                                    {initials(user.name)}
                                                </div>
                                                <span className="fw-medium text-dark">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-secondary">{user.email}</td>
                                        <td className="text-secondary">{user.operatorPercentage}%</td>
                                        <td>{roleBadge(user.role == "admin" ? "Admin" : "Cleaner")}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-2 py-1"
                                                    style={{ fontSize: 12 }}
                                                    onClick={() => openEdit(user)}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-2 py-1"
                                                    style={{ fontSize: 12 }}
                                                    onClick={() => setDeleteUser(user)}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                        <path d="M10 11v6" /><path d="M14 11v6" />
                                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="card-footer bg-white border-primary-subtle d-flex align-items-center justify-content-between py-2">
                    <span className="text-secondary" style={{ fontSize: 12 }}>
                        Showing {filtered.length} of {users.length} users
                    </span>
                    <div className="d-flex gap-3">
                        {["admin", "operator"].map((r) => (
                            <span key={r} className="text-secondary" style={{ fontSize: 11 }}>
                                {r}: {users.filter((u) => u.role === r).length}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {addUser && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setAddUser(false)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-primary-subtle shadow">
                            <div className="modal-header border-primary-subtle">
                                <h5 className="modal-title text-dark fw-bold" style={{ fontSize: 15 }}>Add User</h5>
                                <button className="btn-close" onClick={() => setAddUser(false)} />
                            </div>
                            <div className="modal-body d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Full Name</label>
                                    <input className="form-control border-primary-subtle" value={form1.name}
                                        onChange={(e) => setForm1({ ...form1, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Email Address</label>
                                    <input className="form-control border-primary-subtle" type="email" value={form1.email}
                                        onChange={(e) => setForm1({ ...form1, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Share Percentage (%)</label>
                                    <input
                                        className="form-control border-primary-subtle col-3"
                                        type="number"
                                        value={form1.operatorPercentage}
                                        placeholder="eg. - 60.5 "
                                        onChange={(e) => setForm1({ ...form1, operatorPercentage: e.target.value })}
                                    />
                                    
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Password</label>
                                    <input className="form-control border-primary-subtle" type="password" value={form1.password}
                                        onChange={(e) => setForm1({ ...form1, password: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Role</label>
                                    {/* ✅ both value and onChange now use form1 */}
                                    <select className="form-select border-primary-subtle" value={form1.role}
                                        onChange={(e) => setForm1({ ...form1, role: e.target.value })}>
                                        <option value="operator">Operator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer border-primary-subtle">
                                <button className="btn btn-light border" onClick={() => setAddUser(false)}>Cancel</button>
                                <button className="btn btn-primary fw-semibold" onClick={saveUser}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editUser && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setEditUser(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-primary-subtle shadow">
                            <div className="modal-header border-primary-subtle">
                                <h5 className="modal-title text-dark fw-bold" style={{ fontSize: 15 }}>Edit User</h5>
                                <button className="btn-close" onClick={() => setEditUser(null)} />
                            </div>
                            <div className="modal-body d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Full Name</label>
                                    <input className="form-control border-primary-subtle" value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Email Address</label>
                                    <input className="form-control border-primary-subtle" type="email" value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Share Percentage (%)</label>
                                    <input className="form-control border-primary-subtle" placeholder="eg:- 50.00" type="number" value={form.operatorPercentage}
                                        onChange={(e) => setForm({ ...form, operatorPercentage: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>Role</label>
                                    <select className="form-select border-primary-subtle" value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                        <option value="operator">Operator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>D.O.J</label>
                                    <input className="form-control border-primary-subtle" type="date" value={form.dateOfJoining ? new Date(form.dateOfJoining).toISOString().slice(0, 10) : ""}
                                        onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label text-secondary fw-medium" style={{ fontSize: 12 }}>D.O.B</label>
                                    <input className="form-control border-primary-subtle" type="date" value={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().slice(0, 10) : ""}
                                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                                </div>

                                {/* Documents Section */}
                                <div>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <label className="form-label text-secondary fw-medium mb-0" style={{ fontSize: 12 }}>Documents</label>
                                        <button
                                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-2 py-1"
                                            style={{ fontSize: 11 }}
                                            onClick={() =>
                                                setForm({
                                                    ...form,
                                                    documents: [...(form.documents || []), { name: "", file: null, preview: null }],
                                                })
                                            }
                                        >
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                            Add Document
                                        </button>
                                    </div>

                                    {(!form.documents || form.documents.length === 0) && (
                                        <p className="text-secondary mb-0" style={{ fontSize: 12 }}>No documents added yet.</p>
                                    )}

                                    <div className="d-flex flex-column gap-2">
                                        {(form.documents || []).map((doc, index) => (
                                            <div key={index} className="border border-primary-subtle rounded p-2 d-flex flex-column gap-2" style={{ background: "#f8fbff" }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    {/* Document name input */}
                                                    <input
                                                        className="form-control form-control-sm border-primary-subtle"
                                                        placeholder="Document name (e.g. Aadhar, PAN)"
                                                        value={doc.name}
                                                        style={{ fontSize: 12 }}
                                                        onChange={(e) => {
                                                            const updated = [...form.documents];
                                                            updated[index] = { ...updated[index], name: e.target.value };
                                                            setForm({ ...form, documents: updated });
                                                        }}
                                                    />
                                                    {/* Remove button */}
                                                    <button
                                                        className="btn btn-sm btn-outline-danger px-2 py-1 flex-shrink-0"
                                                        style={{ fontSize: 11 }}
                                                        onClick={() => {
                                                            const updated = form.documents.filter((_, i) => i !== index);
                                                            setForm({ ...form, documents: updated });
                                                        }}
                                                    >
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* File input */}
                                                <input
                                                    className="form-control form-control-sm border-primary-subtle"
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    style={{ fontSize: 12 }}
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;
                                                        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
                                                        const updated = [...form.documents];
                                                        updated[index] = { ...updated[index], file, preview };
                                                        setForm({ ...form, documents: updated });
                                                    }}
                                                />

                                                {/* Image preview */}
                                                {doc.preview && (
                                                    <img
                                                        src={doc.preview}
                                                        alt={doc.name || "preview"}
                                                        style={{ height: 80, width: "auto", objectFit: "cover", borderRadius: 6, border: "1px solid #cfe2ff" }}
                                                    />
                                                )}

                                                {/* PDF label (no preview) */}
                                                {doc.file && !doc.preview && (
                                                    <span className="text-secondary" style={{ fontSize: 11 }}>
                                                        📄 {doc.file.name}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* End Documents Section */}

                            </div>
                            <div className="modal-footer border-primary-subtle">
                                <button className="btn btn-light border" onClick={() => setEditUser(null)}>Cancel</button>
                                <button className="btn btn-primary fw-semibold" onClick={saveEdit}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteUser && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setDeleteUser(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-primary-subtle shadow">
                            <div className="modal-header border-primary-subtle">
                                <h5 className="modal-title text-dark fw-bold" style={{ fontSize: 15 }}>Delete User</h5>
                                <button className="btn-close" onClick={() => setDeleteUser(null)} />
                            </div>
                            <div className="modal-body">
                                <p className="text-secondary mb-0" style={{ fontSize: 13 }}>
                                    Are you sure you want to delete{" "}
                                    <span className="fw-semibold text-dark">{deleteUser.name}</span>? This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer border-primary-subtle">
                                <button className="btn btn-light border" onClick={() => setDeleteUser(null)}>Cancel</button>
                                <button className="btn btn-danger fw-semibold" onClick={() => confirmDelete()}>Delete User</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}