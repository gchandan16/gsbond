import { asyncHandler } from "../../utils/asyncHandler";
import { handleError, AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";



import { validateRequest } from "../../utils"
import { getModels } from "../../models";
import { ApiError } from "next/dist/server/api-utils";
import { Op, Sequelize } from "sequelize";



export const GET = asyncHandler(async (req) => {

    const user = validateRequest(req, "assignedQuote", "view");
    const { quotemodel, usermodel, quoteassignmodel } = await getModels();
    if (!quoteassignmodel) throw new ApiError("Quote Assign model not intialised", 400);


    const url = new URL(req.url);
    const JobStatus = String(url.searchParams.get("JobStatus"));
    const limit = Number(url.searchParams.get("limit")) || 1000;
    const offset = Number(url.searchParams.get("offset")) || 0;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};

        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    if(user.role == "operator"){
        where.user_id = user.id;
        where.isCompleted = true;
    }
    else if(user.role == "admin"){
        where.isCompleted = true;
    }

    console.log("where",where);

    const quotations = await quoteassignmodel.findAll({
        where: {
            ...where,
            isDeleted: false,
        },
        attributes: [
            "id",
            "user_id",
            "quote_id",
            "acceptStatus",
            "jobStatus",
            "startTime",
            "endTime",
            "isCompleted",
            "note",
            "operatorAmount",
        ],
        include: [
            {
                model: quotemodel,
                as: "quote",
                attributes: [
                    "id",
                    "name",
                    "email",
                    "services",
                    "phone",
                    "address",
                    "zip",
                    "status",
                    "time",
                    "jobStatus",
                    "scheduledDate",
                    "remark",
                    "quotatedAmount",
                    "advanceAmount",
                    "calculatedAmount",
                    "suburbs",
                    "beforeImages",
                    "afterImages"
                ],
            }
        ],
        limit: limit,
        offset: offset,
    });



    // console.log("quotations", quotations[0].quote);
    return successResponse(quotations, "Quote fetched successfully", 200);

})