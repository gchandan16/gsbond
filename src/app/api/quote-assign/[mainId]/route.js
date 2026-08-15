import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError, AppError } from "../../../utils/errorHandler";
import { successResponse, errorResponse } from "../../../utils/response";



import { validateRequest } from "../../../utils"
import { getModels } from "../../../models";
import { Op } from "sequelize";

// This controller for the Accept or reject of job by the cleaner
export const PUT = asyncHandler(async (req, { params }) => {
    // console.log("calling from update quote assign")
    const user = validateRequest(req, "assignedQuote", "edit");

    const { mainId } = await params;
    const { acceptedStatus } = await req.json();


    // console.log("jobStatus", jobStatus, "startTime", startTime, "endTime", endTime, "quoteId", quoteId, "remark", remark,"acceptedStatus",acceptedStatus);

    const { logmodel, quoteassignmodel, quotehistorymodel } = await getModels();

    if (!quoteassignmodel) {
        return errorResponse("Quote Assign model not intialised !!!");
    }

    const [updatedRows, updatedData] = await quoteassignmodel.update(
        { acceptStatus: acceptedStatus },
        {
            where: {
                id: mainId,
            },
            returning: true,
        }
    )

    if (updatedRows === 0) {
        console.log("No record found or nothing updated");
        return errorResponse("No record found or nothing updated !! ");
    }

    await quotehistorymodel.create({
        quote_id: updatedData[0].quote_id,
        user_id: user.id,
        action_type: "Job_UPDATE",
        remark: `${mainId} job is ${acceptedStatus} by cleaner`,
    })

    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: `{acceptedStatus} job id ${mainId}`,
    })

    return successResponse("Updated successfully");
});


export const DELETE = asyncHandler(async (req, { params }) => {

    const user = validateRequest(req, "assignedQuote", "edit");

    const { mainId } = await params;

    const { logmodel, quoteassignmodel } = await getModels();

    if (!quoteassignmodel) {
        return errorResponse("Quote Assign model not intialised !!!");
    }

    const [updatedRows] = await quoteassignmodel.update(
        { isDeleted: true },
        {
            where: {
                id: mainId,
            }
        }
    )

    if (updatedRows === 0) {
        console.log("No record found or nothing updated");
        return errorResponse("No record found or nothing updated !! ");
    }

    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: `Deleted job id ${mainId}`,
    })

    return successResponse("Deleted successfully");
})


// THis controller for the start timer and end timer of job by the cleaner
export const POST = asyncHandler(async (req) => {

    const user = validateRequest(req, "assignedQuote", "edit");

    const { start, end, id, mainId } = await req.json();

    const { quoteassignmodel, quotemodel, quotehistorymodel, logmodel } = await getModels();

    const existingJob = await quoteassignmodel.findOne({
        where: { id: mainId }
    });

   

    const starttimer = start ? new Date().toISOString() : null;
    const endtimer = end ? new Date().toISOString() : null;

    // ✅ START TIMER
    if (starttimer) {
        await quoteassignmodel.update(
            {
                startTime: starttimer,
            },
            {
                where: { id: mainId }
            }
        );
    }

    // ✅ END TIMER
    if (endtimer) {

        const totalMinutes = existingJob.startTime
            ? Math.round(
                (new Date(endtimer) - new Date(existingJob.startTime)) / 1000 / 60
            )
            : 0;

        await quoteassignmodel.update(
            {
                endTime: endtimer,
                isCompleted: true,
                totalTimeTaken: totalMinutes
            },
            {
                where: { id: mainId }
            }
        );

        await quotemodel.update(
            {
                jobStatus: "Completed"
            },
            {
                where: { id: id }
            }
        );
    }

    // ✅ history log
    await quotehistorymodel.create({
        quote_id: id,
        user_id: user.id,
        action_type: "JOB_UPDATED",
        remark: `Job ${mainId} ${start ? "Started" : "Ended"} by cleaner`,
    });

    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Working on Job",
    });

    return successResponse("Updated successfully", 200);
});