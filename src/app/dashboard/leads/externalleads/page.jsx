// src/app/dashboard/leads/externalleads/page.jsx

import AllLeadsTable from "../../component/allLeadsTable.jsx";
import { cookies } from "next/headers";


async function getLeads() {

    const cookieStore = await cookies();

    const token = cookieStore.get("authToken")?.value;

    console.log("AUTH TOKEN EXISTS:", !!token);


    if (!token) {
        console.log("No auth token found");
        return [];
    }


    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/leads`,
        {
            cache: "no-store",

            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    );


    console.log(
        "LEADS API STATUS:",
        response.status
    );


    if (!response.ok) {

        const errorText =
            await response.text();

        console.log(
            "LEADS API ERROR:",
            errorText
        );

        return [];
    }


    const resp =
        await response.json();


    console.log(
        "LEADS API RESPONSE:",
        resp
    );


    if (!resp?.data) {
        return [];
    }


    return resp.data.map((lead) => {

        const externalData =
            lead.externalData || {};


        const customer =
            externalData.customerDetails || {};


        const contact =
            externalData.contactDetails || {};


        const property =
            externalData.bondCleaningDetails || {};


        const extras =
            property.extras || {};


        const services = [];


        if (extras.carpet) {
            services.push("Carpet");
        }


        if (extras.pest) {
            services.push("Pest");
        }


        if (property.gardeningService) {
            services.push("Gardening");
        }


        if (property.removalistService) {
            services.push("Removalist");
        }


        return {

            // Database fields

            id: lead.id,

            status: lead.status,

            createdAt: lead.createdAt,

            movedAt: lead.movedAt,

            quoteId: lead.quoteId,


            // Customer

            name:
                customer.name || "",

            email:
                customer.email || "",

            phone:
                customer.phone || "",

            message:
                customer.message || "",


            // Contact

            contactMethods:
                contact.contactMethods || [],

            livingDuration:
                contact.livingDuration || "",

            bestTimeToContact:
                contact.bestTimeToContact || [],


            // Property

            suburb:
                property.suburb || "",

            postcode:
                property.postcode || "",

            state:
                property.stateRegion || "",

            houseType:
                property.houseType || "",

            bedroom:
                property.bedroom || "",

            bathroom:
                property.bathRoom || "",

            furnished:
                property.furnished || "",

            blinds:
                property.blinds || "",

            livingArea:
                property.livingArea || "",


            // Services

            services,

            carpet:
                Boolean(extras.carpet),

            pest:
                Boolean(extras.pest),

            gardening:
                Boolean(
                    property.gardeningService
                ),

            removalist:
                Boolean(
                    property.removalistService
                )

        };

    });

}


export default async function ExternalLeadsPage() {

    const leads = await getLeads();


    console.log(
        "FINAL LEADS FOR TABLE:",
        leads
    );


    return (

        <div className="min-vh-100 bg-light py-5">

            <div className="container-xl">

                <AllLeadsTable
                    initialLeads={leads}
                />

            </div>

        </div>

    );
}