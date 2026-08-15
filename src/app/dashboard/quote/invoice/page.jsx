// app/invoices/page.jsx
// ✅ SERVER COMPONENT (SSR) — provides static quote data to the CSR component

import InvoiceList from "../../component/InvoiceList";
import { cookies } from "next/headers";

// Static quote data (replace with your real API fetch)
async function getQuotes() {

    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoice`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) return [];

    const raw = await res.json();

    return raw.data
//   .filter(user => user.status === "Approved")
  .map((user, i) => ({
    id: user.id,
    invoiceNo: `${user.QuoteData.id}${Date.now()}`,
    clientName: user.QuoteData.name,
    email: user.QuoteData.email,
    mobile: user.QuoteData.phone,
    address: user.QuoteData.address,
    zip: user.QuoteData.zip,
    services: user.QuoteData.services,
    calculatedAmount: parseFloat(user.QuoteData.calculatedAmount || 0).toFixed(2),
    status: user.QuoteData.status,
    createdAt: new Date(user.QuoteData.createdAt).toLocaleDateString("en-IN"),
    quotatedAmount: user.QuoteData.quotatedAmount,
    dueAmount: user.QuoteData.dueAmount,
    advanceAmount: user.QuoteData.advanceAmount,
  }));

    // return [

    //     {
    //         id: "QT-1005",
    //         invoiceNo: "INV-2024-005",
    //         clientName: "Vikram Singh",
    //         email: "vikram@nexgen.co.in",
    //         mobile: "+61 70011 22334",
    //         address: "8, Park Street, Kolkata, West Bengal",
    //         zip: "700016",
    //         gstin: "19UVWXY7890Z5S9",
    //         services: [
    //             { name: "Custom Development", qty: 15, unit: "hr", unitPrice: 3200 },
    //             { name: "Installation", qty: 1, unit: "unit", unitPrice: 9500 },
    //             { name: "Training Session", qty: 2, unit: "day", unitPrice: 5000 },
    //         ],
    //         discount: 20,
    //         taxRate: 18,
    //         status: "Approved",
    //         createdAt: "18 Feb 2025",
    //     },
    // ];
}

export default async function InvoicesPage() {
    const quotes = await getQuotes();

    // console.log("quotesquotesquotesquotesquotesquotes",quotes);

    return (
        <>

            <div className="min-vh-100 bg-light py-5">
                <div className="container-xl">

                    {/* Page Header */}
                    {/* <div className="text-center mb-5">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill mb-3 d-inline-block fs-6 fw-semibold">
                            Invoice Management
                        </span>
                        <h1 className="display-5 fw-bold text-dark mb-2">
                            Download <span className="text-primary">Invoices</span>
                        </h1>
                        <p className="text-secondary fs-6 mx-auto" style={{ maxWidth: 440 }}>
                            View all quotes and download a professional PDF invoice for any entry.
                        </p>
                    </div> */}

                    {/* ✅ SSR data → CSR component */}
                    <InvoiceList quotes={quotes} />

                </div>
            </div>
        </>
    );
}