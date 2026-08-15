// app/quotes/page.jsx
// ✅ SERVER COMPONENT (SSR) — fetches all quotes server-side

import CallScheduled from "../../component/callScheduled";
import { cookies } from "next/headers";

async function getQuotes() {


    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    // console.log("token",token)

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) return [];

    const raw = await res.json();

    // console.log("raw",raw.data[0].quoteAssign)

    return raw.data.map((user, i) => ({
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
        beforeImages: user.beforeImages,
        afterImages: user.afterImages,
        scheduledDate: user?.scheduledDate || '',
        assignerName:user?.quoteAssign[0]?.user?.name || '',
        assignerEmail:user?.quoteAssign[0]?.user?.email || '',
        totalTimeTaken:user?.totalTimeTaken || '',
    }));
}




async function getServices() {

    const cookieStore =await cookies();

    const token = cookieStore.get("authToken")?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }      
    });

    if(!response.ok) throw new Error("Failed to fetch categories");

    const resp  = await response.json();
    // console.log("resp",resp);


    return resp.data.map((item, i) => ({
        id: item.id,
        name: item.name.split(" ").slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        description: item.description.slice(0, 100),
        status: item.status == true? "Active" : "Inactive",
        price:item.price,
        base:item.base,
        gst:item.gst,
        createdAt: new Date(item.createdAt).toLocaleDateString("en-IN"),
    }));
}




async function getUsers() {

    const cookieStore =await cookies();

    const token = cookieStore.get("authToken")?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }      
    });

    if(!response.ok) return [];

    const resp  = await response.json();
    // console.log("resp",resp);

    return resp.data.map((item, i) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        createdAt: new Date(item.createdAt).toLocaleDateString("en-IN"),
    }));
}



export default async function QuotesPage() {
    const quotes = await getQuotes();

    // console.log("quotes",quotes)

    const services = await getServices()
    // console.log("services",services)


    const userList= await getUsers();
    // console.log("userList",userList)




    return (
        <>

            <div className="min-vh-100 bg-light py-5">
                <div className="container-xl">

                    {/* Page Header */}
                    {/* <div className="text-center mb-5">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill mb-3 d-inline-block fs-6 fw-semibold">
                            Quote Management
                        </span>
                        <h1 className="display-5 fw-bold text-dark mb-2">
                            All <span className="text-primary">Quotes</span>
                        </h1>
                        <p className="text-secondary fs-6 mx-auto" style={{ maxWidth: 440 }}>
                            View, manage and take action on all client quotes from one place.
                        </p>
                    </div> */}

                    {/* ✅ SSR data → CSR component */}
                    <CallScheduled initialQuotes={quotes} services={services} userList={userList} />

                </div>
            </div>
        </>
    );
}