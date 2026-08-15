// app/quotes/page.jsx
// ✅ SERVER COMPONENT (SSR) — fetches all quotes server-side

import AssignPendingQuoteTable from "../../component/AssignPendingQuoteTable.jsx";
import { cookies } from "next/headers";

async function getQuotes() {


    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    // console.log("token",token)

    // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote`, {
    //     cache: "no-store",
    //     headers: {
    //         Authorization: `Bearer ${token}`,
    //     }
    // });

    // if (!res.ok) return [];

    // const raw = await res.json();

    let status = "Pending";
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign?status=${status}`,
        {
            cache: "no-store",
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    )
    if(!response.ok) return [];

    const resp = await response.json();

    // console.log("Response",resp);


    return resp.data.map((user, i) => ({
        mainId:user.id,
        id: user.quote_id,
        clientName: user.quote.name,
        email: user.quote.email,
        mobile: user.quote.phone,
        address: user.quote.address,
        zip: user.quote.zip || '',
        services: user.quote.services,
        status: user.quote.status,
        createdAt: new Date(user.quote.time).toLocaleDateString("en-IN"),
        jobStatus: user.jobStatus,
        scheduledDate: user.quote.scheduledDate,
        remark: user.quote.remark,
        acceptedStatus: user.acceptStatus || "NA",
        suburbs:user.quote?.suburbs || "",
        specialRemark:user?.specialRemark || "",
    }));
}




async function getServices() {


    return {
        id: 1,
        name: "",
        description: "",
        icon: "",
        status: "",
        isFeatured: "",
        createdAt: "",
    };
}
async function getUsers() {

    return {
        id: 1,
        name: "item.name",
        email: "item.email",
        role: "item.rol",
        createdAt: "",
    };
}

export default async function QuotesPage() {
    const quotes = await getQuotes();

    // console.log("quotes",quotes)

    const services = await getServices()
    // console.log("services",services)


    const userList = await getUsers();
    // console.log("userList",userList)




    return (
        <>

            <div className="min-vh-100 bg-light py-5">
                <div className="container-xl">

                    {/* Page Header */}
                    

                    {/* ✅ SSR data → CSR component */}
                    <AssignPendingQuoteTable initialQuotes={quotes} services={services} userList={userList} />

                </div>
            </div>
        </>
    );
}