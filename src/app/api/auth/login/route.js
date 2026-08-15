import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError, AppError } from "../../../utils/errorHandler";
import { successResponse, errorResponse } from "../../../utils/response.js";

import { generateToken, comparePassword } from "../../../utils/index.js"
import { models } from "../../../models";



import { sendNotification } from "../../../lib/firebase/sendNotification"


//login controller
export const POST = asyncHandler(async (req) => {


    const { email, password, userAgent } = await req.json();
    if (!email || !password) {
        throw new AppError("All fields are required", 400);
    }

    console.log("userAgent", userAgent);
    let os = "Unknown";
    let browser = "Unknown";
    let device = "Desktop";

    // OS
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
    else if (userAgent.includes("Mac")) os = "MacOS";

    // Browser
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Brave")) browser = "Brave";
    else if (userAgent.includes("Edg")) browser = "Edge";

    // Device
    if (userAgent.includes("Mobile")) device = "Mobile";

    const usermodel = await models.userModel();
    if (!usermodel) {
        throw new AppError("User model not intialised", 400);
    }

    const user = await usermodel.findOne({
        where: {
            email: email,
        },
        attributes: {
            exclude: ["otp", "time", "userDocument", "documents", "dateOfJoining", "dateOfBirth", "updatedAt"]
        },
        raw: true,
    })

    if (!user) {
        throw new AppError("Please Register first", 404);
    }
    // console.log(user);
    const passMatch = await comparePassword(password, user.password);
    if (!passMatch) {
        throw new AppError("Please Enter correct passsword", 400);
    }

    await usermodel.update(
        {
            os,
            device,
            browser
        },
        {
            where: { email }
        }
    );

    const permissionmodel = await models.permissionModel();
    const permissions = await permissionmodel.findOne({
        where: {
            role: user.role,
        },
        raw: true
    })

    // console.log("permissons", permissions.permissions)

    // create token after password match
    const token = await generateToken(user, permissions.permissions);



    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = [
        `authToken=${token}; Path=/; ${isProd
            ? "HttpOnly; Secure; SameSite=None; Domain=crm.gsbondcleaning.com.au;"
            : "SameSite=Lax;"} Max-Age=${3 * 24 * 60 * 60}`,

        `role=${JSON.stringify(user.role)}; Path=/; ${isProd
            ? "HttpOnly; Secure; SameSite=None; Domain=crm.gsbondcleaning.com.au;"
            : "SameSite=Lax;"} Max-Age=${3 * 24 * 60 * 60}`,
    ];

    const data = { user, token, permissions: permissions.permissions };

    await sendNotification("New Login", `${user.email} login successfully`, [{ fcmToken: user.fcmToken }])


    const logmodel = await models.logModel();
    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: `Login on ${os} with ${browser} and ${device}`,
    })

    const notificationmodel = await models.notificationModel();

    await notificationmodel.create({
        user_id:user.id,
        title:"Login",
        description:`${email} login successfully`,
    })

    return new Response(JSON.stringify({
        success: true,
        data,
        message: "User login successfully"
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": cookieOptions.join(", "),  // ✅ Set cookies via header
        }
    });
})