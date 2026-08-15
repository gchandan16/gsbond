import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";

import { validateRequest } from "../../utils";
import { getModels } from "../../models";
import { Op } from "sequelize";

export const GET = asyncHandler(async (req) => {

    const user = validateRequest(req, "assignedQuote", "view");

    // console.log("user",user);

    const { quotemodel, quoteassignmodel } = await getModels();
    if (!quoteassignmodel) throw new AppError("Quote Assign model not initialised", 400); // Fix 1: use local AppError

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit")) || 30;
    const offset = Number(url.searchParams.get("offset")) || 0;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    if (user.role !== "admin") {
        where.user_id = user.id;
    }

    const quotations = await quoteassignmodel.findAll({
        where,
        isDeleted:false,
        attributes: ["id", "user_id", "quote_id"],
        include: [
            {
                model: quotemodel,
                as: "quote",
                attributes: ["id", "status", "time", "jobStatus", "scheduledDate"],
            },
        ],
        limit,
        offset,
        raw: true,
        nest: true,
    });

    if (!quotations || quotations.length === 0) {
        return errorResponse("Quotations Not Available", 400); // Fix 2: return so execution stops
    }

    const todayStr = new Date().toISOString().split("T")[0]; // Fix 3: single source of truth for today's date string

    const upcoming = quotations.filter((i) => {
        const scheduledStr = i.quote?.scheduledDate?.toString().split("T")[0]; // Fix 3: normalise to date string before comparing
        return scheduledStr > todayStr;
    });

    const todayPending = quotations.filter((i) => {
        const scheduledStr = i.quote?.scheduledDate?.toString().split("T")[0]; // Fix 3: same normalisation
        return scheduledStr === todayStr && i.quote?.jobStatus !== "Completed";
    });

    const todayComplete = quotations.filter((i) => {
        const scheduledStr = i.quote?.scheduledDate?.toString().split("T")[0]; // Fix 3: same normalisation
        return scheduledStr === todayStr && i.quote?.jobStatus === "Completed";
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const last30Days = new Date(todayStart);
    last30Days.setDate(todayStart.getDate() - 30);

    const tomorrow = new Date(todayStart); // Fix 4: use tomorrow as upper bound so today's jobs are included
    tomorrow.setDate(todayStart.getDate() + 1);

    const monthlyScheduled = quotations.filter((i) => {
        const scheduled = new Date(i.quote.scheduledDate);
        return (
            scheduled >= last30Days &&
            scheduled < tomorrow && // Fix 4: < tomorrow instead of <= today (which excluded today)
            i.quote.jobStatus === "Completed"
        );
    });
    console.log(
        "monthlyScheduled:", monthlyScheduled.length,
            "upcoming:", upcoming.length,
            "todayPending:", todayPending.length,
            "todayComplete:", todayComplete.length,
    )
    return successResponse(
        {
            monthlyScheduled: monthlyScheduled.length,
            upcoming: upcoming.length,
            todayPending: todayPending.length,
            todayComplete: todayComplete.length,
        },
        "Jobs fetched successfully",
        200
    );
});