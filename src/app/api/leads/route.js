import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errorHandler";
import { successResponse } from "../../utils/response";

import { validateRequest } from "../../utils";
import { getModels } from "../../models";


export const GET = asyncHandler(async (req) => {

    console.log("GET /api/leads called");

    const user = validateRequest(req, "leads", "view");

    const { leadmodel } = await getModels();

    if (!leadmodel) {
        throw new AppError(
            "Lead model not initialised",
            400
        );
    }

    const url = new URL(req.url);

    const limit =
        Number(url.searchParams.get("limit")) || 100;

    const offset =
        Number(url.searchParams.get("offset")) || 0;

    const leads = await leadmodel.findAll({
        limit,
        offset,
        order: [
            ["id", "DESC"]
        ]
    });

    console.log("Total leads:", leads.length);

    return successResponse(
        leads,
        "Leads fetched successfully",
        200
    );
});