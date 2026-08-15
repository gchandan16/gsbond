import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError,AppError } from "../../../utils/errorHandler";
import {successResponse,errorResponse} from "../../../utils/response";

import {hashPassword,generateOTP,SendOtpEmail } from "../../../utils"

import { models } from "../../../models/index";


export const POST = asyncHandler(async(req)=>{

    const {email} = await req.json();

    if(!email){
        throw new AppError("Email is required for forget password",400);
    }

    const usermodel = await models.userModel();
    if(!usermodel){
        throw new AppError("User model not intialised",400);
    }

    const existingUser = await usermodel.findOne({
        where:{
            email:email
        }
    });

    if(!existingUser) throw new AppError("Email not exist",400);

    const otp = generateOTP()
    console.log("otp",otp);
    existingUser.otp = otp;
    await existingUser.save();

    SendOtpEmail(email,otp,"existingUser",existingUser);

    return successResponse("User password change otp sent",201);
})