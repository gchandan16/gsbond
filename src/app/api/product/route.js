import { asyncHandler } from "../../utils/asyncHandler";
import { handleError, AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";

import { validateRequest } from "../../utils"
import { getModels  } from "../../models";
import { ApiError } from "next/dist/server/api-utils";
import { Op } from "sequelize";

//create product controller
export const POST = asyncHandler(async (req) => {

    // validate request
    const user = validateRequest(req, "products", "create");

    const {productmodel,logmodel} = await getModels() ;
    if (!productmodel) {
        throw new ApiError("Product Model Not Initialised", 400);
    }

    const { name, description, status,price,base, categoryId ,gst} = await req.json();
    if (!name || !description || !categoryId) {
        throw new AppError("Name and description and Category fields are required", 400);
    }

    const product = await productmodel.create({
        name, description, status, categoryId, price,gst,base
    })

    if(!product) throw new ApiError('Product Creation Failed',400);



        await logmodel.create({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            activity: "Create Product",
        })

    return successResponse(product, "Product created successfully", 200);
})

export const GET = asyncHandler(async (req) => {

    // validate request
    // const user = validateRequest(req, "products", "view");

    const {categorymodel} = await getModels() ;
    const {productmodel} = await getModels() ;
    
    if (!categorymodel || !productmodel) {
        throw new ApiError("Category and Product Model Not Initialised", 400);
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

    const data = await productmodel.findAll({
        attributes:["id","name","createdAt","price","categoryId","status","gst","description","base"],
        include:[{
            model:categorymodel,
            as:"category",
            attributes:["id","name","description"]
        }],
        limit:limit,
        offset:offset,
        where,
    })

    if(!data || data.length == 0) throw new ApiError("No Products Found!!!",400);
    
    return successResponse(data, "Products Found Successfully", 200);
})