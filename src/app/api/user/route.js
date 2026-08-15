import { asyncHandler } from "../../utils/asyncHandler";
import { handleError, AppError } from "../../utils/errorHandler";
import { successResponse, errorResponse } from "../../utils/response";
import {hashPassword,generateOTP,SendOtpEmail } from "../../utils"

import { validateRequest } from "../../utils"
import { getModels } from "../../models";
import {logModel} from "../../models/log.model"
import { Op } from "sequelize";

//get users controller
export const GET = asyncHandler(async (req) => {

    // validate request
    validateRequest(req, "user", "view");

    const {usermodel} = await getModels();

    if (!usermodel) throw new AppError("User model not intialised!!!");

    const url = new URL(req.url);
    const limit = url.searchParams.get("limit") || 30;
    const offset = url.searchParams.get("offset") || 0;

    const users = await usermodel.findAll({
        limit: limit,
        offset: offset,
    })

    // if (!users || users.length == 0) throw new AppError("Users not available", 400);

    return successResponse(users, "users fetchwed successfully", 200);
})


//create user by admin
export const POST = asyncHandler(async (req) => {

    // validate request
    const user = validateRequest(req, "user", "create");

    const {usermodel} = await getModels();

    if (!usermodel) throw new AppError("User model not intialised!!!");

    const {name,email,password,role,operatorPercentage} = await req.json();

    if(!name || !email || !password || !role ) throw new AppError("Required field are manadatory",400);

    const exisstingUser = await usermodel.findOne({
        where:
        {
            email:email
        }
    })

    if(exisstingUser) throw new AppError("Email already Exist!!!",400);

    const hashedPassword = await hashPassword(password);

    const newUser = await usermodel.create({
        name,email,password:hashedPassword,role,isVerified:true,operatorPercentage
    });

    if(!newUser) throw new AppError("User creation failed",400);


     const logmodel = await logModel();
    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Create User",
    })

    return successResponse(newUser, "User created successfully", 200);
})

