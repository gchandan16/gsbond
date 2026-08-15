import { asyncHandler } from "../../utils/asyncHandler";
import { handleError, AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";

import { validateRequest } from "../../utils"
import { models } from "../../models";
import { ApiError } from "next/dist/server/api-utils";
import { Op } from "sequelize";

//create category controller
export const POST = asyncHandler(async (req) => {

    // validate request
    const user = validateRequest(req, "category", "create");

    const logmodel = await models.logModel();
    if (!logmodel) {
        throw new ApiError("logmodel Model No Initialised", 400);
    }

    await logmodel.create({
        userId:user.indexOf,
        role:user.role,
        name:user.role,
        activity:"",
    })
    

    return successResponse(category, "Category created successfully", 200);
})
