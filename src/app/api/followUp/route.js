import { asyncHandler } from "../../utils/asyncHandler";
import { handleError, AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";

import { validateRequest } from "../../utils"
import { getModels } from "../../models";
import { Op } from "sequelize";



export const POST = asyncHandler(async (req) => {
  const user = validateRequest(req, "quote", "create");

  const { followupmodel, quotehistorymodel } = await getModels();

  if (!followupmodel) {
    return errorResponse("400", "Follow up model not initialised");
  }

  const { quoteId, reminderDate, reminderTime, priority, note } = await req.json();

  if (!quoteId || !note) return errorResponse(400, "QuoteId and Note is mandatory");

  const data = await followupmodel.create({
    quote_id: quoteId,
    reminderDate,
    reminderTime,
    priority,
    note,
  })

  if (!data) return errorResponse(400, "Follow up creation failed !!!");

  await quotehistorymodel.create({
    quote_id: quoteId,
    user_id: user.id,
    action_type: "FollowUp_ADDED",
    remark: `Follow up added for ${reminderDate} on ${reminderTime} by ${note}`,
  })

  return successResponse(200, "Follow up created for a Quote");
})


export const GET = asyncHandler(async (req) => {
  const { followupmodel, quotemodel } = await getModels();

  if (!followupmodel) {
    return errorResponse(400, "Follow up model not initialised");
  }

  // ✅ get query param
  const { searchParams } = new URL(req.url);
  const quoteId = searchParams.get("quoteId");

  // ✅ dynamic where condition
  const whereClause = {};
  if (quoteId) {
    whereClause.quote_id = quoteId; // ⚠️ match DB field
  }

  const data = await followupmodel.findAll({
    where: whereClause,
    attributes: ["id", "quote_id", "reminderDate", "reminderTime", "priority", "note"],
    include: [
      {
        model: quotemodel,
        as: "quote",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  return successResponse(data, "Followups fetched successfully", 200);
});