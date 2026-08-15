// app/categories/page.jsx
// ✅ SERVER COMPONENT (SSR)

import CategoryList from "../../../component/CategoryList";

import { cookies } from "next/headers";

async function getCategories() {

    const cookieStore =await cookies();

    const token = cookieStore.get("authToken")?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/category`, {
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
        }      
    });

    if(!response.ok) return [];

    const resp  = await response.json();
    // console.log("resp",resp); 




    const icons = ["📦", "🛠️", "💡", "🖥️", "📋", "🔧", "🎯", "📊", "🚀", "⚙️", "🔒", "🌐"];
    const featured = [true, true, true, true, true, true, true, true, true, true, true, false];

    return resp.data.map((item, i) => ({
        id: item.id,
        name: item.name.split(" ").slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        description: item.description.slice(0, 100),
        icon: icons[i % icons.length],
        status: item.status == true? "Active" : "Inactive",
        isFeatured: featured[i % featured.length],
        createdAt: new Date(item.createdAt).toLocaleDateString("en-IN"),
    }));
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <>
           

            <div className="min-vh-100 bg-light py-5">
                <div className="container-xl">

                    {/* Page Header */}
                    

                    {/* ✅ SSR data → CSR component */}
                    <CategoryList categories={categories} />

                </div>
            </div>
        </>
    );
}