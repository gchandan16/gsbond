import { asyncHandler } from "../../utils/asyncHandler";
import { handleError, AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";

import { sendNotification } from "../../lib/firebase/sendNotification"


import { validateRequest } from "../../utils"
import { getModels } from "../../models";
import { models } from "../../models";
import { ApiError } from "next/dist/server/api-utils";
import { Op, Sequelize } from "sequelize";






//create quote assign controller
export const POST = asyncHandler(async (req) => {

    // validate request
    const user = validateRequest(req, "assignedQuote", "create");

    const { quoteassignmodel, quotemodel, quotehistorymodel, logmodel, usermodel } = await getModels();

    if (!quoteassignmodel) throw new ApiError("Quote Assign Model not intialised", 400);


    const data = await req.formData();
    const operatorsRaw = data.get("operators");
    const quotesRaw = data.get("quotes");

    const otherDetails = data.get("otherDetails");
    const isReassign = data.get("isReassign") === "true"; // ✅ convert to boolean
    const specialRemark = data.get("specialRemark");

    // console.log("operatorsRaw", operatorsRaw, "quotesRaw", quotesRaw);

    let operators = [];
    let quotes = [];

    try {
        operators = JSON.parse(operatorsRaw);
        quotes = JSON.parse(quotesRaw);
    } catch (err) {
        throw new Error("Invalid operators or quotes format");
    }

    const files = data.getAll("specialImages"); console.log("FILES:", files.length);

    const fs = require("fs");
    const path = require("path");

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const imagePaths = [];
    for (const file of files) {
        if (!file || !file.type?.startsWith("image/")) continue;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);

        imagePaths.push(`/uploads/${fileName}`);
    }
    const operator = await usermodel.findOne({
        where: {
            id: operators[0].id,
        },
        attributes: ["id", "email", "fcmToken", "os", "operatorPercentage"],
    })

    const quote = await quotemodel.findOne({
        where: {
            id: quotes[0],
        }
    })

    const amount = parseFloat(quote?.quotatedAmount) || 0;
    const percentage = parseFloat(operator?.operatorPercentage) || 0;

    let operatorAmount = (amount * percentage) / 100;
    operatorAmount = Number(operatorAmount.toFixed(2));

    let arr = [];
    for (let i = 0; i < operators.length; i++) {
        for (let j = 0; j < quotes.length; j++) {
            arr.push(
                {
                    user_id: operators[i].id,
                    status: true,
                    quote_id: quotes[j],
                    otherDetails: otherDetails || "",
                    jobStatus: isReassign === true ? "Reclean" : "Fresh",
                    specialRemark: specialRemark,
                    specialImages: imagePaths,
                    operatorAmount: operatorAmount,
                }
            )
        }
    }




    quote.scheduledDate = otherDetails;
    quote.jobStatus = 'Assigned';
    await quote.save();

    await quoteassignmodel.bulkCreate(arr);

    await quotehistorymodel.create({
        quote_id: quotes[0],
        user_id: user.id,
        action_type: "JOB_Assigned",
        remark: `Job Assigned to ${operators[0].email} with status ${isReassign === true ? "Reclean" : "Fresh"}`
    })



    const authToken = (req.headers.get("Authorisation") || req.headers.get("authorization")).split(' ')[1];


    // if(operator.os != "iOS"){
    await sendNotification(
        "New Job",
        `${operator.email} Gets a New Job`,
        [{ fcmToken: operator.fcmToken }]
    );
    // }
    // else{
    //await sendApnsRequest(operator.fcmToken, "New Job", `${operator.email} Gets a New Job`,authToken )
    // }

    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Quote Assigned",
    })

    const notificationmodel = await models.notificationModel();

    await notificationmodel.create({
        user_id: operator.id,
        title: "NEW JOB",
        description: `${operator.email} got new Job of Type ${isReassign === true ? "Reclean" : "Fresh"}`,
    })

    return successResponse("Quotes Assigned successfully", 200);
})


export const GET = asyncHandler(async (req) => {


    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];


    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];


    const user = validateRequest(req, "assignedQuote", "view");
    const { quotemodel, usermodel, quoteassignmodel } = await getModels();
    if (!quoteassignmodel) throw new ApiError("Quote Assign model not intialised", 400);


    const url = new URL(req.url);
    const status = String(url.searchParams.get("status"));
    const JobStatus = String(url.searchParams.get("JobStatus"));
    const limit = Number(url.searchParams.get("limit")) || 1000;
    const all = (url.searchParams.get("all")) || "No"; // this to get all quotes instead of taking by userId 
    const offset = Number(url.searchParams.get("offset")) || 0;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};

        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    if (["Accept", "Pending", "Reject"].includes(status)) {
        where.acceptStatus = status;
    }
    console.log("all,", all)

    if (all == "No") {
        where.user_id = user.id
    }

    if (JobStatus == "Reclean") {
        where.jobStatus = "Reclean"
    }
    if (JobStatus == "Completed") {
        where.jobStatus = "Completed"
    }
    console.log("where,", where)

    if (user.role == "operator") {

        // Condition to show jobs before 1 day worksing fine
        const dateCondition = `DATE("quote"."scheduledDate") IN ('${todayStr}', '${tomorrowStr}')`;

        // making overAll condition if Pending dont show email,phone,address until job get accepted
        console.log("todayStr", todayStr, "yesterdayStr", yesterdayStr, "tomorrowStr", tomorrowStr)
        console.log("dateCondition", dateCondition);


        // This condition for the Accept status then show only email, phone, address;
        const acptCondition = `("QuoteAssign"."acceptStatus") = 'Accept'`;

        const combinedCondition = `(${dateCondition} AND ${acptCondition})`;


        const quotations = await quoteassignmodel.findAll({
            where: {
                ...where,
                isDeleted: false,
                isCompleted: false,
            },
            attributes: ["id", "user_id", "quote_id", "acceptStatus", "startTime", "endTime", "jobStatus", "note", "specialImages",
                [
                    Sequelize.literal(`CASE WHEN ${combinedCondition} THEN "QuoteAssign"."specialRemark" ELSE '' END`), "specialRemark",
                ],
            ],
            include: [
                {
                    model: quotemodel,
                    as: "quote",
                    attributes: [
                        "id",
                        "services",
                        "status",
                        "jobStatus",
                        "scheduledDate",
                        "remark",
                        "zip",
                        "name",
                        "suburbs",

                        // ✅ conditional fields

                        [
                            Sequelize.literal(`CASE WHEN ${combinedCondition} THEN "quote"."email" ELSE '' END`),
                            "email",
                        ],
                        [
                            Sequelize.literal(`CASE WHEN ${combinedCondition} THEN "quote"."phone" ELSE '' END`),
                            "phone",
                        ],
                        [
                            Sequelize.literal(`CASE WHEN ${combinedCondition} THEN "quote"."address" ELSE '' END`),
                            "address",
                        ],
                    ],
                },
                {
                    model: usermodel,
                    as: "user",
                    attributes: ["id", "name", "email"],
                },
            ],
            limit,
            offset,
        });

        return successResponse(quotations, "Quote fetched successfully", 200);
    }

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
            "specialRemark",
            "note",
            "specialImages",
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
                    "beforeImages",
                    "afterImages",
                    "shareToken",
                    "time",
                    "jobStatus",
                    "scheduledDate",
                    "remark",
                    "quotatedAmount",
                    "calculatedAmount",
                    "advanceAmount",
                    "dueAmount",
                    "suburbs"
                ],
            },
            {
                model: usermodel,
                as: "user",
                attributes: [
                    "id",
                    "name",
                    "email",
                ],
            },
        ],
        limit: limit,
        offset: offset,
    });



    // console.log("quotations", quotations[0].quote);
    return successResponse(quotations, "Quote fetched successfully", 200);

})


export const PUT = asyncHandler(async (req) => {
    // console.log("calling from update quote assign")
    const user = validateRequest(req, "assignedQuote", "edit");
    const { jobStatus, startTime, endTime, quoteId, mainId, remark, acceptedStatus, note } = await req.json();


    console.log("jobStatus", jobStatus, "mainId", mainId, "startTime", startTime, "endTime", endTime, "quoteId", quoteId, "remark", remark, "acceptedStatus", acceptedStatus);

    const { quotemodel, logmodel, quoteassignmodel, quotehistorymodel } = await getModels();

    if (['Pending', 'Accept', 'Reject'].includes(acceptedStatus)) {
        await quoteassignmodel.update(
            { acceptStatus: acceptedStatus },
            {
                where: {
                    id: mainId,
                },
            }
        );
        console.log("entry done");
        await quotehistorymodel.create({
            quote_id: quoteId,
            user_id: user.id,
            action_type: "JOB_UPDATED",
            remark: `${mainId} job is ${acceptedStatus} by cleaner`,
        })
    }


    if (!quotemodel) throw new Error("Quote model not initialised", 400);

    const quote = await quotemodel.findOne({
        where: { id: quoteId },
    });


    if (!quote) throw new Error("Quote not found", 404);

    // console.log(quote)

    if (startTime) {
        const job = await quoteassignmodel.findOne({
            where: {
                id: mainId,
            }
        });

        job.startTime = new Date().toISOString(); // ✅ "2026-03-25T08:00:00.000Z"
        job.note = note;
        await job.save();


        await quotehistorymodel.create({
            quote_id: quoteId,
            user_id: user.id,
            action_type: "JOB_UPDATED",
            remark: `${mainId} job is started at ${new Date().toISOString()} by cleaner`,
        })
    }

    if (endTime) {

        const job = await quoteassignmodel.findOne({
            where: {
                id: mainId,
            }
        })
        const end = new Date();
        const start = new Date(job.startTime); // ✅ parses ISO string correctly

        job.endTime = end.toISOString();
        job.totalTimeTaken = Math.round((end - start) / 1000 / 60); // ✅ Date - Date = ms

        quote.jobStatus = "Completed";
        job.isCompleted = true;
        job.note = note;
        await job.save();


        await quotehistorymodel.create({
            quote_id: quoteId,
            user_id: user.id,
            action_type: "JOB_UPDATED",
            remark: `${mainId} job is ended at ${new Date().toISOString()} by cleaner`,
        })
    }

    if (remark) {
        quote.remark = remark
    }

    if (note) {
        await quoteassignmodel.update({ note: note }, { where: { id: mainId } });
    }
    await quote.save();


    // adding quote history

    // await quotehistorymodel.create({
    //     quote_id: quoteId,
    //     user_id: user.id,
    //     status: quote.status,
    //     remark: "Working on Quote",
    // })


    // addi log entry

    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Working on Job",
    })

    return successResponse("Updated successfully");
});