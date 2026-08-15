import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError,AppError } from "../../../utils/errorHandler";
import {successResponse,errorResponse} from "../../../utils/response";

import {hashPassword,generateOTP,SendOtpEmail } from "../../../utils"
import { models } from "../../../models";


export const POST = asyncHandler(async(req)=>{
    const {email,otp} = await req.json();
    if (!email || !otp) {
        throw new AppError("All fields are required", 400);
    }

    const usermodel = await models.userModel();
    if(!usermodel){
        throw new AppError("User model not intialised",400);
    }

    const user = await usermodel.findOne({where:{
        email:email
    }});

    if(user.otp != otp){
        throw new AppError("Please Enter Correct OTP",400);
    }

    await user.update({ isVerified: true });

    

    return successResponse( "User Verified successfully,  !!!!",200);
})


