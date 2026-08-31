import { asyncHandler } from "../../utils/asyncHandler";
import { handleError, AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";

import { validateRequest } from "../../utils"
import { getModels } from "../../models";
import { clientModel } from "../../models/client.mdel.js"
import { ApiError } from "next/dist/server/api-utils";
import { Op } from "sequelize";

import { v4 as uuidv4 } from "uuid";


export const GET = asyncHandler(async (req) => {

    // Same authentication/permission approach as Quotes
    const user = validateRequest(req, "quote", "view");

    const { externalquotemodel } = await getModels();

    if (!externalquotemodel) {
        throw new AppError(
            "External Quote model not initialized",
            400
        );
    }

    const externalQuotes = await externalquotemodel.findAll({
        where: {
            status: 0
        },
        order: [
            ["createdAt", "DESC"]
        ]
    });
console.log("EXTERNAL QUOTES:", externalQuotes);
    return successResponse(
        externalQuotes,
        "External quotes fetched successfully",
        200
    );
});


export const POST = asyncHandler(async (req) => {

    console.log("===== EXTERNAL QUOTE CREATE START =====");

    // Same permission as normal quote creation
    const user = validateRequest(req, "quote", "create");

    const {
        quotemodel,
        quotehistorymodel,
        logmodel,
        leadmodel
    } = await getModels();


    if (!quotemodel) {
        throw new AppError(
            "Quote model not initialised",
            400
        );
    }

    if (!quotehistorymodel) {
        throw new AppError(
            "Quote history model not initialised",
            400
        );
    }

    if (!leadmodel) {
        throw new AppError(
            "Lead model not initialised",
            400
        );
    }


    // ==========================================
    // 1. Get request body
    // ==========================================

    const {
        leadId,

        name,
        email,
        phone,
        address,
        zip,

        services,

        advanceAmount,
        suburbs,

        otherDetails,

        quotationType,
        cleaningType,

        source
    } = await req.json();


    console.log("Lead ID:", leadId);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Services:", services);
    console.log("Quotation Type:", quotationType);
    console.log("Cleaning Type:", cleaningType);
    console.log("Source:", source);


    // ==========================================
    // 2. Validate
    // ==========================================

    if (!leadId) {
        throw new AppError(
            "Lead ID is required",
            400
        );
    }

    if (!name || !email || !services) {
        throw new AppError(
            "Name, Email, Services are required",
            400
        );
    }


    if (!Array.isArray(services) || services.length === 0) {
        throw new AppError(
            "At least one service is required",
            400
        );
    }


    // ==========================================
    // 3. Find Lead
    // ==========================================

    const lead =
        await leadmodel.findByPk(leadId);


    if (!lead) {
        throw new AppError(
            "Lead not found",
            404
        );
    }


    console.log(
        "Lead found:",
        lead.toJSON()
    );


    // ==========================================
    // 4. Calculate amount
    // ==========================================

    let amount = 0;

    services.forEach((item) => {

        amount += Number(
            item.quotedPrice || 0
        );

    });


    const advance = Number(advanceAmount || 0);

    const amountLeft =
        (
            Number(amount.toFixed(3)) -
            advance
        ).toFixed(3);


    // ==========================================
    // 5. Create Quote
    // SAME Quote table
    // ==========================================

    const quote =
        await quotemodel.create({
            name,
            email,
            phone,
            address,
            zip,
            services,
            calculatedAmount:amount.toFixed(3),
            quotatedAmount:amount.toFixed(3),
            status: "Cold-lead",
            advanceAmount: advanceAmount || "0",
            dueAmount:amountLeft,
            shareToken:uuidv4(),
            suburbs,

            // External-specific fields
            quotationType,
            cleaningType,
            source: source || "EXTERNAL",
            otherDetails:otherDetails || ""
        });


    if (!quote) {

        throw new AppError(
            "Quote creation failed",
            400
        );

    }


    console.log(
        "===== QUOTE CREATED ====="
    );

    console.log(
        "Quote ID:",
        quote.dataValues.id
    );


    // ==========================================
    // 6. Quote History
    // ==========================================

    await quotehistorymodel.create({

        quote_id:  quote.dataValues.id,

        user_id: user.id,

        action_type: "CREATED",

        remark:"External quote created"

    });


    // ==========================================
    // 7. Client
    // Same logic as existing Quote API
    // ==========================================

    const clientmodel =
        await clientModel();


    const existingClient =
        await clientmodel.findOne({
            where: { email: email}
        });


    if (!existingClient) {

        const newClient =    await clientmodel.create({
                                            name,
                                            email,
                                            phone,
                                            address,
                                            suburbs,
                                            zip,
                                            clientId: uuidv4()
                                        });


        if (!newClient) {

            return errorResponse( "Adding client Details failed!!!",400 );

        }

    }


    // ==========================================
    // 8. UPDATE LEAD
    // ==========================================

    await leadmodel.update(
        {
            quoteId: quote.dataValues.id,
            status:1,
            movedAt:new Date()
        },
        {
            where: { id: leadId }
        }

    );

    console.log( "===== LEAD UPDATED =====" );
    console.log( "Lead ID:",  leadId);
    console.log( "Quote ID:",  quote.dataValues.id );


    // ==========================================
    // 9. Activity Log
    // ==========================================

    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Create External Quote"
    });


    // ==========================================
    // 10. Return
    // ==========================================

    return successResponse(quote,"External quote created successfully", 200 );

});