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

    const categorymodel = await models.categoryModel();
    if (!categorymodel) {
        throw new ApiError("Category Model No Initialised", 400);
    }

    const { name, description, status } = await req.json();
    if (!name || !description) {
        throw new AppError("Name and description fields are required", 400);
    }

    const category = await categorymodel.create({
        name, description, status
    })

    if(!category) throw new ApiError('Category Creation Failed',400);




     const logmodel = await models.logModel();
    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Create Category",
    })

    return successResponse(category, "Category created successfully", 200);
})



//get category controller
export const GET = asyncHandler(async (req) => {

    // validate request
    const user = validateRequest(req, "category", "view");

    const categorymodel = await models.categoryModel();
    if (!categorymodel) {
        throw new ApiError("Category Model No Initialised", 400);
    }

    //taking data from query
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit")) || 30;
    const offset = Number(url.searchParams.get("offset")) || 0;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where = {}
    if(startDate || endDate){
        where.createdAt = {};
        if(startDate) where.createdAt[Op.gte] = new Date(startDate);
        if(endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const data = await categorymodel.findAll({
        attributes:["id","name","createdAt","status","description"],
        limit:limit,
        offset:offset,
        where,
    })

    if(!data || data.length == 0) throw new ApiError("No Category Found!!!",400);
    
    return successResponse(data, "Category Found Successfully", 200);
})