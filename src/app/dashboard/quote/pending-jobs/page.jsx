// app/quotes/page.jsx
// ✅ SERVER COMPONENT (SSR) — fetches all quotes server-side

import PendingJobsTable from "../../component/PendingJobsTable.jsx";
import { cookies } from "next/headers";

async function getQuotes() {


    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    // console.log("token",token)

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote?status=${"Approved"}`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) return [];

    const raw = await res.json();

    // console.log("raw",raw)

    return raw.data
    // .filter((job)=>job.jobStatus != "Assigned" && job.jobStatus != "Completed")
    .map((user, i) => ({
        id:  user.id,
        clientName: user.name,
        email: user.email,
        mobile: user.phone,
        address: user.address,
        zip: user.zip,
        services: user.services,
        calculatedAmount: parseFloat(user.calculatedAmount),
        quotedAmount: parseFloat(user.quotatedAmount),
        advanceAmount: parseFloat(user.advanceAmount),
        dueAmount: parseFloat(user.dueAmount),
        status: user.status,
        jobStatus: user.jobStatus,
        createdAt: new Date(user.createdAt).toLocaleDateString("en-IN"),
        suburbs:user?.suburbs || "",
    }));
}



async function getUsers() {

    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) return [];

    const raw = await res.json();

    return raw.data.map((user,i)=>({
        id: user.id,
        name:user.name,
        email:user.email,
        role:user.role,
        createdAt:user.createdAt,
    }))

}


export default async function PendingJobsPage() {
    const quotes = await getQuotes();

    // console.log("quotes",quotes)

    const userList = await getUsers();

    return (
        <>

            <div className="min-vh-100 bg-light py-5">
                <div className="container-xl">

                    
                    <PendingJobsTable initialQuotes={quotes} userList={userList} />

                </div>
            </div>
        </>
    );
}