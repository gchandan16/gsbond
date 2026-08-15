import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError, AppError } from "../../../utils/errorHandler";
import { successResponse, errorResponse } from "../../../utils/response";
import { getModels } from "../../../models";

export async function GET(req, { params }) {
    const { shareToken } = await params;
    const { quotemodel } = await getModels();

    const quote = await quotemodel.findOne({
        where: { shareToken: shareToken },
        attributes: [
            "id", "name", "status", "jobStatus", "beforeImages",
            "afterImages"
        ] 
    });

    if (!quote) return errorResponse(400,"Link Expired !!!!");

    return successResponse(quote,"Data fetched successfully",201);
}