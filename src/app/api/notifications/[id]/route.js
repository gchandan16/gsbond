import { asyncHandler } from "../../../utils/asyncHandler";
import { models } from "../../../models";
import { successResponse, errorResponse } from "../../../utils/response";

export const PUT = asyncHandler(async (req, { params }) => {
    const { id } = await params;


    const Notification = await models.notificationModel();

    if (!Notification) {
        return errorResponse("Notification model not initialized", 400);
    }

    // Update read status
    const [updatedRows] = await Notification.update(
        { read: true },
        { where: { id } }
    );

    if (updatedRows === 0) {
        return errorResponse("Notification not found", 404);
    }

    return successResponse("Updated to Read", 200);
});







export const GET = asyncHandler(async (req, { params }) => {
    const { id } = await params;


    const Notification = await models.notificationModel();

    if (!Notification) {
        return errorResponse("Notification model not initialized", 400);
    }

    const notification = await Notification.findOne({
        where: { id }
    });

    if (!notification) {
        return errorResponse("Notification not found", 404);
    }

    return successResponse(notification,"Notification fetched successfully");
});