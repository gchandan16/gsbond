// app/quotes/page.jsx
// ✅ SERVER COMPONENT (SSR) — fetches all quotes server-side

import CompletedJobsTable from "../../component/CompletedJobsTable.jsx";
import { cookies } from "next/headers";

async function getQuotes() {


    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    const user = cookieStore.get("role")?.value;

    // console.log("user", user)

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/complete-jobs`,
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
        clientName: user.quote.name,
        email: user.quote.email,
        mobile: user.quote.phone,
        address: user.quote.address,
        zip: user.quote.zip || '',
        services: user.quote.services,
        status: user.quote.status,
        calculatedAmount: user.quote.calculatedAmount,
        quotatedAmount: user.quote.quotatedAmount,
        advanceAmount: user.quote.advanceAmount,
        createdAt: new Date(user.quote.time).toLocaleDateString("en-IN"),
        beforeImages: user.quote.beforeImages,
        afterImages: user.quote.afterImages,
        jobStatus: user.jobStatus,
        scheduledDate: user.quote.scheduledDate,
        timerStarted: user.startTime,
        timerEnded: user.endTime,
        remark: user.quote.remark,
        acceptedStatus: user.acceptStatus || "NA",
        suburbs: user.quote.suburbs,
        isCompleted:user.isCompleted  == "true" ? "Completed":"InComplete",
        note:user.note || "",
        operatorAmount:user.operatorAmount || "",
    }));

}


export default async function PendingJobsPage() {
    const quotes = await getQuotes();

    // console.log("quotes",quotes)

    // const userList = await getUsers();

    return (
        <>

            <div className="min-vh-100 bg-light py-5">
                <div className="container-xl">


                    <CompletedJobsTable initialQuotes={quotes} />

                </div>
            </div>
        </>
    );
}