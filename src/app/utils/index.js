import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from './sendMail.js'
import {AppError} from "../utils/errorHandler.js"

import { userModel } from '../models/user.model.js';

// register hash password
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
}



//compare password 
export const comparePassword = async (password, hashedPassword) => {
  // console.log(password,hashedPassword);
    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
}


// create token
export const generateToken = async (user,permissions) => {
  // console.table(permissions);
    return jwt.sign(
        { id: user.id, email: user.email ,role:user.role,permissions:permissions},
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );
}


// generate otp
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// send verificatoin email
export const SendOtpEmail = async (email, otp) => {
    sendOTPEmail(email, otp);
}


//verify token

export const validateRequest = (req, moduleName, action) => {
  // 1️⃣ Get Authorization header
  // console.log("req",req)
  const authHeader = req.headers.get("Authorisation") || req.headers.get("authorization");

  //  console.log("authHeader",authHeader)

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized - No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  // console.log("token",token)

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Unauthorized - Invalid token", 401);
  }

    // console.log("decoded",decoded)

  // const usermodel = await userModel();
  // const user = await usermodel.findOne({ where: { id: decoded.id } });

  // if (user.sessionId != decoded.sessionId) {
    // console.log("Session expired. Logged in from another device.");
    // return errorResponse("Session expired. Logged in from another device.",401,"Multiple Device Login Detected")

    // return {
    //   success: false,
    //   status: 401,
    //   message: "Session expired. Logged in from another device.",
    //   logout: true, 
    //   clearCookies: true
    // };
  // }
  console.log("No Multiple Login, proceed")

  // 2️⃣ Get permissions from token
  const permissions = decoded.permissions || {};

  // 3️⃣ Check if module exists
  if (!permissions[moduleName]) {
    throw new AppError(`Forbidden - No permissions for module: ${moduleName}`, 403);
  }

  // 4️⃣ Check if action is allowed
  if (!permissions[moduleName][action]) {
    throw new AppError(
      `Forbidden - You do not have permission to ${action} on ${moduleName}`,
      403
    );
  }
  // console.log(decoded.permissions);
  // 5️⃣ Return user info if authorized
  return decoded; // can attach to req.user if needed
};

