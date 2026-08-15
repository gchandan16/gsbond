// app/categories/create/page.jsx
// ✅ SERVER COMPONENT (SSR)

import CategoryForm from "../../../component/CategoryForm";

// Fetch existing categories from API (for slug uniqueness check & parent options)
async function getCategories() {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=8", {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch categories");

    const raw = await res.json();

    const icons = ["📦", "🛠️", "💡", "🖥️", "📋", "🔧", "🎯", "📊"];

    return raw.map((item, i) => ({
        id: item.id,
        name: item.title.split(" ").slice(0, 3).join(" "),
        icon: icons[i % icons.length],
    }));
}

export default async function CreateCategoryPage() {
    const parentCategories = await getCategories();

    return (
        <>
    

            <div className="min-vh-100 bg-light py-5">
                <div className="container">

                    {/* Page Header */}
                    

                    {/* ✅ SSR data → CSR component */}
                    <CategoryForm parentCategories={parentCategories} />

                </div>
            </div>
        </>
    );
}