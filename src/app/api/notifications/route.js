import {successResponse, errorResponse } from "../../utils/response";
import { models } from "../../models";
import { asyncHandler } from "../../utils/asyncHandler";
import {validateRequest} from "../../utils"


export const GET = asyncHandler(async(req)=>{


    const user = validateRequest(req, "assignedQuote", "view");

    const Notification = await models.notificationModel();

    if(!Notification){
        return errorResponse("Notification model not Initialized",400);
    }

    const notifications = await Notification.findAll({
        where:{user_id:user.id},
        order: [["createdAt", "DESC"]],
    });

    return successResponse(notifications,"Notifications fetched successfully");

})