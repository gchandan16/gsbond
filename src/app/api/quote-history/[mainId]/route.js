import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError, AppError } from "../../../utils/errorHandler";
import { successResponse, errorResponse } from "../../../utils/response";

import { validateRequest } from "../../../utils"
import { getModels } from "../../../models";
import { clientModel } from "../../../models/client.mdel.js"
import { ApiError } from "next/dist/server/api-utils";
import { Op } from "sequelize";

import { v4 as uuidv4 } from "uuid";

export const GET = asyncHandler(async (req,{params}) => {
    const { quotehistorymodel } = await getModels();

    const {mainId} = await params;

    console.log("mainId", mainId);

    const logs = await quotehistorymodel.findAll({
        where:{
            quote_id:mainId,
        },
        attributes: ["id", "quote_id", "user_id", "action_type", "remark","createdAt"]
    });

    // console.log(logs)

    return successResponse(logs,"Logs fetched successfully",200);
})
