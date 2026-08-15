// app/products/page.jsx
// ✅ SERVER COMPONENT (SSR)

import ProductList from "../../../component/ProductList";

import { cookies } from "next/headers";


async function getProducts() {
    const cookieStore =await cookies();

    const token = cookieStore.get("authToken")?.value;

    const products = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product`,
        {
            cache: "no-store",
            headers:{
                Authorisation:`Bearer ${token}`
            }
        }
    )
    if(!products.ok) throw new Error("Products fetching failed");

    const prds = await products.json();

    console.log("prds",prds);   

    return prds.data.map((p, i) => {

        return {
            id: p.id,
            name: p.name.split(" ").slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            description: p.description.slice(0,100),
            status: p.status == true ? "Active" :"Inactive",
            categoryId: p.categoryId,
            categoryName: p?.category?.name || 'NA',
            baseAmount:p.base,
            taxRate:p.gst ?? p.gst,
            totalAmount: p.price,
            createdAt: new Date(p.createdAt).toLocaleDateString("en-IN"),
        };
    });
}

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
    return resp.data;
}

export default async function ProductsPage() {
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);

    return (
        <>
            

            <div className="min-vh-100 bg-light py-5">
                <div className="container-xl">

                    

                    {/* ✅ SSR data → CSR */}
                    <ProductList products={products} categories={categories} />

                </div>
            </div>
        </>
    );
}