// app/products/create/page.jsx
// ✅ SERVER COMPONENT (SSR)
// Fetches category list server-side, passes to CSR form component

import ProductForm from "../../../component/ProductForm";

import { cookies } from "next/headers";

async function getCategories() {

    const cookieStore =await cookies();

    const token = cookieStore.get("authToken")?.value;


    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }      
    });

    if (!res.ok) throw new Error("Failed to fetch categories");

    const raw = await res.json();

    const icons = ["📦", "🛠️", "💡", "🖥️", "📋", "🔧", "🎯", "📊", "🚀", "⚙️"];

    return raw.data.map((item, i) => ({
        id: item.id,
        name: item.name
            .split(" ")
            .slice(0, 3)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        icon: icons[i % icons.length],
        status: item.status == true ? "Active" : "Inactive", // only show active ones in form
    }));
}

export default async function CreateProductPage() {
    const categories = await getCategories();

    // Only pass active categories to the form
    const activeCategories = categories.filter((c) => c.status == "Active");

    return (
        <>
            

            <div className="min-vh-100 bg-light py-5">
                <div className="container">

                    

                    {/* ✅ SSR categories → CSR form */}
                    <ProductForm categories={activeCategories} />

                </div>
            </div>
        </>
    );
}