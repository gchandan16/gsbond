import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError,AppError } from "../../../utils/errorHandler";
import {successResponse,errorResponse} from "../../../utils/response";

import {hashPassword,generateOTP,SendOtpEmail } from "../../../utils"
import { models } from "../../../models";


export const POST = asyncHandler(async(req)=>{
    const {email,name,password,role} = await req.json();
    if (!email || !name || !password) {
        throw new AppError("All fields are required", 400);
    }

    const usermodel = await models.userModel();
    if(!usermodel){
        throw new AppError("User model not intialised",400);
    }

    const hashedPassword = await hashPassword(password);

    const otp = generateOTP()
    console.log( name,email,hashedPassword,otp)
    const data = await usermodel.create({
        name,email,password:hashedPassword,otp,role:role== "admin" ? "admin" : "operator",
    })

    SendOtpEmail(email,otp);



    const logmodel = await models.logModel();
    await logmodel.create({
        userId:"",
        role: data.role,
        name: data.name,
        email: data.email,
        activity: "Register",
    })

    return successResponse(data, "User Verification Otp successfully Sent to mail",201);
})