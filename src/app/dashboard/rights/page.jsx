// app/dashboard/permissions/page.jsx  ✅ SERVER COMPONENT
import { models } from "../../models/index.js";
import PermissionsClient from "../component/PermissionsClient.jsx";

async function getPermissions() {
    try {
        const permissionmodel = await models.permissionModel();

        if (!permissionmodel) throw new Error("Permission model not initialised!!!");

        const permissions = await permissionmodel.findAll({
            limit: 30,
            offset: 0,
            attributes: ["id", "role", "permissions", "status"],
            raw: true
        })

        // console.log("permissions", permissions);

        return permissions || permissions;
    } catch {
        // fallback seed shape
        return [
            {
                role: "admin",
                permissions: {
                    user: { view: false, create: true, edit: true, delete: true },
                    permissions: { view: true, create: true, edit: true, delete: true },
                    quote: { view: true, create: true, edit: true, delete: true },
                    category: { view: true, create: true, edit: true, delete: true },
                    products: { view: true, create: true, edit: true, delete: true },
                    assignedQuote: { view: true, create: true, edit: true, delete: true },
                },
                status: true,
            },
            {
                role: "operator",
                permissions: {
                    user: { view: false, create: false, edit: false, delete: false },
                    permissions: { view: false, create: false, edit: false, delete: false },
                    quote: { view: false, create: false, edit: false, delete: false },
                    category: { view: false, create: false, edit: false, delete: false },
                    products: { view: false, create: false, edit: false, delete: false },
                    assignedQuote: { view: true, create: false, edit: true, delete: false },

                },
                status: true,
            },
        ];
    }
}



async function updatePermission(updated) {
    "use server";

    const permissionmodel = await models.permissionModel();

    if (!permissionmodel) throw new Error("Permission model not initialised!!!");

    await permissionmodel.update(
        {
            status:      updated.status,
            permissions: updated.permissions,
        },
        {
            where: { role: updated.role },
        }
    );
}




export default async function PermissionsPage() {
    const permissions = await getPermissions();

    return (
        <div className="min-vh-100 py-4" style={{ background: "#f0f7ff" }}>
            <div className="container-xl px-3">
                <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ fontSize: 22 }}>🔐</span>
                        <h5 className="fw-bold text-dark mb-0">Permissions</h5>
                    </div>
                    <p className="text-secondary mb-0" style={{ fontSize: 13 }}>
                        Manage role-based access control for your application
                    </p>
                </div>
                <PermissionsClient initialPermissions={permissions} updatePermission={updatePermission} />
            </div>
        </div>
    );
}