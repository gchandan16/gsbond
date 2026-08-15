import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError,AppError } from "../../../utils/errorHandler";
import {successResponse,errorResponse} from "../../../utils/response";

import {hashPassword,generateOTP,SendOtpEmail } from "../../../utils/index"
import { models } from "../../../models";


export const POST = asyncHandler(async(req)=>{
    const {email,otp,newPassword} = await req.json();
    

    const usermodel = await models.userModel();
    if(!usermodel){
        throw new AppError("User model not intialised",400);
    }

    const existinUser = await usermodel.findOne({
        where:{
            email:email
        }
    })

    if(otp != existinUser.otp){
        throw new AppError("Enter correct otp",400);
    }

    const hashedPassword = await hashPassword(newPassword);

    existinUser.password = hashedPassword;
    await existinUser.save();


    
    const logmodel = await models.logModel();
    await logmodel.create({
        userId: existinUser.id,
        role: existinUser.role,
        name: existinUser.name,
        email: existinUser.email,
        activity: "Generate new password",
    })


    return successResponse("User password changed successfully successfully",201);
})