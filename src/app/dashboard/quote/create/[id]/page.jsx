import QuoteformExternal from "../../../component/QuoteformExternal";
import { cookies } from "next/headers";
async function getServices(id) {

    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/external/${id}`;

    console.log("External Data ID:", id);
    console.log("API URL:", url);
    console.log("Token exists:", !!token);

    const resp = await fetch(url, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });


    console.log("STATUS:", resp.status);
    console.log("STATUS TEXT:", resp.statusText);

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
const products = respo.data.products;
const lead =respo.data.lead;
const formattedProducts =products.map((item, i) => ({
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

     return {
        lead: lead,
        products: formattedProducts
    }; 
}

// ── Fetch tax / discount config from your backend ───────────────────────────
async function getQuoteConfig() {
    // Replace with your real API endpoint
    return {
          taxRate: Number(process.env.NEXT_PUBLIC_GST_RATE || 0),
        discountOptions: [0, 5, 10, 15, 20],
    };
}


export default async function QuoteExternalCreatePage({ params }) {

    const { id } = await params;

    console.log("External Quote ID:", id);
// Both fetches run in parallel on the server
    const [externalData, config] = await Promise.all([getServices(id), getQuoteConfig()]);
    const lead = externalData.lead;
    const services = externalData.products;

    return (
        <>
             
                        <div className="min-vh-100 bg-light py-5">
                            <div className="container">
            
                                
            
                                {/* ✅ Pass SSR data to CSR component */}
                                <QuoteformExternal services={services} config={config} leads={lead}  />
            
                            </div>
                        </div>
        </>
    );
}