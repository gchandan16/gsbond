// app/quotes/create/page.jsx
// ✅ SERVER COMPONENT (SSR) — fetches services + tax config from API server-side

import QuoteForm from "../../component/Quoteform";
import { cookies } from "next/headers";

// ── Fetch available services from your backend ──────────────────────────────
async function getServices() {
    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    // console.log("token",token)

    const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!resp.ok) throw new Error("Failed to fetch quotes");

    const respo = await resp.json();

    // console.log("respo",respo);

    const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=8", {
        cache: "no-store", // SSR — fresh on every request
    });

    if (!res.ok) throw new Error("Failed to fetch services");

    const raw = await res.json();

    const units = ["1", "1", "1", "1", "1"];

    const names = [
        "Consulting",
        "Installation",
        "Maintenance",
        "Site Inspection",
        "Support Plan",
        "Custom Development",
        "Training Session",
        "Documentation",
    ];

    return respo.data.map((item, i) => ({
        id: item.id,
        name: item.name,
        gst: item.gst,
        base: item.base,
        description: item.description,
        categoryId: item.categoryId,
        category: item.category,
        unitPrice: parseFloat((item.price).toFixed(2)),
        unit: units[i % units.length],
    }));
}

// ── Fetch tax / discount config from your backend ───────────────────────────
async function getQuoteConfig() {
    // Replace with your real API endpoint
    return {
        taxRate: 0,        // GST 18%
        discountOptions: [0, 5, 10, 15, 20],
    };
}

export default async function QuoteCreatePage() {
    // Both fetches run in parallel on the server
    const [services, config] = await Promise.all([getServices(), getQuoteConfig()]);

    return (
        <>
            
            <div className="min-vh-100 bg-light py-5">
                <div className="container">

                    

                    {/* ✅ Pass SSR data to CSR component */}
                    <QuoteForm services={services} config={config} />

                </div>
            </div>
        </>
    );
}