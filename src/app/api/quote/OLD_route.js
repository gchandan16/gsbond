import { asyncHandler } from "../../utils/asyncHandler";
import { handleError, AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";

import { validateRequest } from "../../utils"
import { getModels } from "../../models";
import { clientModel } from "../../models/client.mdel.js"
import { ApiError } from "next/dist/server/api-utils";
import { Op } from "sequelize";

import { v4 as uuidv4 } from "uuid";

//create category controller
export const POST = asyncHandler(async (req) => {

    // validate request
    const user = validateRequest(req, "quote", "create");
    const { quotemodel, quotehistorymodel, logmodel } = await getModels();

    if (!quotemodel) throw new ApiError("Quote model not intitalised", 400)
    if (!quotehistorymodel) throw new AppError("Quote history model not intitalised", 400)

    const { name, email, phone, address, zip, services, advanceAmount, suburbs } = await req.json();

    if (!name || !email || !services) throw new AppError("Name,Email,Services are required", 400)



    let amount = 0;
    services.map((i) => {
        amount += Number(i.quotedPrice);
    })

    let amountLeft = (Number(amount.toFixed(3)) - Number(advanceAmount)).toFixed(3);

    //make entery in quote
    const quote = await quotemodel.create({
        name,
        email,
        phone,
        address,
        zip,
        services,
        calculatedAmount: amount.toFixed(3),
        quotatedAmount: amount.toFixed(3),
        status: 'Cold-lead',
        advanceAmount: advanceAmount || "0",
        dueAmount: amountLeft,
        shareToken: uuidv4(),
        suburbs: suburbs
    })

    if (!quote) throw new ApiError("Quote creation failed", 400);

    // console.log(quote, user);

    //make entry of quote history
    await quotehistorymodel.create({
        quote_id: quote.dataValues.id,
        user_id: user.id,
        action_type: "CREATED",
        remark: "New quote created"
    })


    /// need to take a client details in another table also 
    const clientmodel = await clientModel();

    const existingClient = await clientmodel.findOne({ where: { email: email } });

    if (!existingClient) {
        const newClient = await clientmodel.create({
            name,
            email,
            phone,
            address,
            suburbs,
            zip,
            clientId: uuidv4(),
        })
        if (!newClient) return errorResponse("Adding client Details failed!!!", 400);
    }

    // console.log("newClient",newClient);




    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Create Quote",
    })

    return successResponse(quote, "Quote created successfully", 200);
})


export const GET = asyncHandler(async (req) => {
    console.log("I am getting called !!!");
    const user = validateRequest(req, "assignedQuote", "view");

    // display all quotes from the main quote table
    // if (user.role == "admin") {
    const { quotemodel, quoteassignmodel, usermodel } = await getModels();

    if (!quotemodel) throw new AppError("Quote model not initialised", 400);

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit")) || 3000;
    const offset = Number(url.searchParams.get("offset")) || 0;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where = { isDeleted: false };
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const quotes = await quotemodel.findAll({
        limit: limit,
        offset: offset,
        where,
        include: [
            {
                model: quoteassignmodel,
                as: "quoteAssign",
                attributes: ["id", "user_id", "startTime", "endTime", "createdAt"],
                include: [
                    {
                        model: usermodel,  // ✅ include the actual model
                        as: "user",        // ✅ matches association alias in index.js
                        attributes: ["id", "name", "email", "role"] // ✅ only columns you need
                    }
                ]
            }
        ],
    });

    // console.log("quotes", quotes);

    // if (!quotes || quotes.length == 0) return successResponse(quotes, "Quote fetched successfully", 200);

    return successResponse(quotes, "Quote fetched successfully", 200);
    // }

})
