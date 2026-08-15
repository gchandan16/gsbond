// app/client/page.jsx

//  server component (ssr) - fetched all clients server-side

import ClientTable from "../component/ClientTable.jsx"
import { cookies } from "next/headers";


async function getClients() {
    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/client`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });


    if (!res.ok) return [];

    const raw = await res.json();
    return raw.data.map((client, i) => ({
        id: client?.id || 1,
        name: client?.name  || "Nikunj",
        email: client?.email || "nikunjkumar2911@gmail",
        phone: client?.phone || "6603929332",
        address: client?.address || "address kw",
        status: client?.status == true ? "Active" : "Inactive" || "true",
        createdAt: client?.createdAt || "12-02-2025",
    }))
}


export default async function ClientPage() {
    const clients = await getClients();

    return (
        <>
            <div className="min-vh-100 bg-light py-5">
                <div className="container-xl">
                    <ClientTable clients={clients}/>
                </div>
            </div>
        </>
    )
}