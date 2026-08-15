'use server'

import { models } from "../../../models/index.js";
import { cookies } from "next/headers.js";
import jwt from 'jsonwebtoken';
/**
 * Save the retrieved FCM token into database with userID
 * FIXED: Proper validation, error handling, and verification
 */
export const saveFcmToken = async (token) => {

    console.log("═══════════════════════════════════════════════════════");
    console.log("💾 SAVING FCM TOKEN TO DATABASE");
    console.log("═══════════════════════════════════════════════════════");
    console.log("Token:", token?.substring(0, 30) + "...");
    console.log("Token length:", token?.length);
    console.log("Token type:", typeof token);

    // ✅ VALIDATE TOKEN
    if (!token || typeof token !== 'string' || token.length === 0) {
        console.error("❌ Invalid token provided");
        console.log("═══════════════════════════════════════════════════════");
        return { success: false, error: "Invalid token" };
    }

    try {
        // ✅ GET EMAIL FROM COOKIES
        const cookieStore = await cookies();
        const authToken = cookieStore.get("authToken")?.value;
        
        
        let decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        
        const emailValues = decoded.email?.replace(/"/g, '');

        console.log("emailValues from decoded:", emailValues);

        if (!emailValues) {
            console.error("❌ Email not found in cookies");
            console.log("═══════════════════════════════════════════════════════");
            return { success: false, error: "Email not found in session" };
        }

        // ✅ GET USER MODEL
        const usermodel = await models.userModel();

        if (!usermodel) {
            console.error("❌ User model not initialized");
            console.log("═══════════════════════════════════════════════════════");
            return { success: false, error: "User model error" };
        }

        // ✅ VERIFY USER EXISTS FIRST
        console.log("🔍 Checking if user exists...");
        const existingUser = await usermodel.findOne({
            where: { email: emailValues },
            raw: true
        });

        if (!existingUser) {
            console.error("❌ User not found with email:", emailValues);
            console.log("═══════════════════════════════════════════════════════");
            return { success: false, error: "User not found" };
        }

        console.log("✅ User found:");
        console.log("   ID:", existingUser.id);
        console.log("   Email:", existingUser.email);
        console.log("   Current token:", existingUser.fcmToken?.substring(0, 20) + "...");

        // ✅ UPDATE TOKEN
        console.log("📝 Updating FCM token in database...");
        const [affectedRows] = await usermodel.update(
            { fcmToken: token },
            { where: { email: emailValues } }
        );

        console.log("Update result:", affectedRows, "rows affected");

        // ✅ VALIDATE UPDATE (THIS IS THE KEY FIX!)
        if (affectedRows === 0) {
            console.error("❌ No rows updated - update failed");
            console.log("═══════════════════════════════════════════════════════");
            return { success: false, error: "Update failed - no rows affected" };
        }

        if (affectedRows > 1) {
            console.warn("⚠️ Multiple rows updated (unexpected):", affectedRows);
        }

        // ✅ VERIFY TOKEN WAS SAVED
        console.log("🔍 Verifying token was saved...");
        const updatedUser = await usermodel.findOne({
            where: { email: emailValues },
            raw: true
        });

        if (updatedUser.fcmToken !== token) {
            console.error("❌ Token verification failed - token not saved correctly");
            console.log("   Expected:", token?.substring(0, 20) + "...");
            console.log("   Got:", updatedUser.fcmToken?.substring(0, 20) + "...");
            console.log("═══════════════════════════════════════════════════════");
            return { success: false, error: "Token verification failed" };
        }

        console.log("✅ Token verified in database");
        console.log("   New token:", updatedUser.fcmToken?.substring(0, 20) + "...");

        console.log("═══════════════════════════════════════════════════════");
        console.log("✅ FCM TOKEN SAVED SUCCESSFULLY");
        console.log("═══════════════════════════════════════════════════════");

        return {
            success: true,
            message: 'FCM Token saved successfully',
            userId: updatedUser.id,
            email: updatedUser.email
        };

    } catch (error) {
        console.error("═══════════════════════════════════════════════════════");
        console.error("❌ ERROR SAVING FCM TOKEN");
        console.error("═══════════════════════════════════════════════════════");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Stack:", error.stack);
        console.error("═══════════════════════════════════════════════════════");

        return {
            success: false,
            error: error.message || "Unknown error occurred"
        };
    }
}