// app/quotes/page.jsx
// ✅ SERVER COMPONENT (SSR) — fetches all quotes server-side

import AllJobsTable from "../../component/allJobsTable.jsx";
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

    let status = true;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign?all=${"all"}`,
        {
            cache: "no-store",
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    )
    if (!response.ok) return [];

    const resp = await response.json();

    // console.log("Response",resp);


    return resp.data.map((user, i) => ({
        id: user.quote_id,
        mainId: user.id,
        clientName: user.quote.name,
        email: user.quote.email,
        mobile: user.quote.phone,
        address: user.quote.address,
        zip: user.quote.zip || '',
        services: user.quote.services,
        status: user.quote.status,
        createdAt: new Date(user.quote.time).toLocaleDateString("en-IN"),
        beforeImages: user.quote.beforeImages,
        afterImages: user.quote.afterImages,
        jobStatus: user.quote.jobStatus,
        scheduledDate: user.quote.scheduledDate,
        timerStarted: user.startTime,
        timerEnded: user.endTime,
        remark: user.quote.remark,
        shareToken: user.quote.shareToken,
        acceptedStatus:
            user.acceptStatus === "Accept"
                ? "Accepted"
                : user.acceptStatus === "Reject"
                    ? "Rejected"
                    : "Pending" || "NA",
        cleanerEmail: user.user.email,
        cleanerName: user.user.name,
        suburbs: user.quote.suburbs,
        specialRemark :user.specialRemark,
        note :user.note,
        calculatedAmount: user.quote.calculatedAmount,
        quotatedAmount: user.quote.quotatedAmount,
        advanceAmount: user.quote.advanceAmount,
        dueAmount: user.quote.dueAmount,
        jobType:user.jobStatus,
        specialImages: user.specialImages,
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

    return raw.data.map((user, i) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    }))

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
                    <AllJobsTable initialQuotes={quotes} services={services} userList={userList} />

                </div>
            </div>
        </>
    );
}