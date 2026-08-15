// src/app/api/notification/save-fcm-token/route.js
import { NextResponse } from "next/server";
import { models } from "../../../models/index.js";

export const POST = async (req) => {

    console.log("═══════════════════════════════════════════════════════");
    console.log("💾 SAVING FCM TOKEN TO DATABASE");
    console.log("═══════════════════════════════════════════════════════");

    try {
        // ✅ GET TOKEN FROM REQUEST BODY
        const { token,email } = await req.json();

        console.log("Token:", token?.substring(0, 30) + "...");
        console.log("Token length:", token?.length);
        console.log("Token type:", typeof token);

        // ✅ VALIDATE TOKEN
        if (!token || typeof token !== 'string' || token.length === 0) {
            console.error("❌ Invalid token provided");
            return NextResponse.json(
                { success: false, error: "Invalid token" },
                { status: 400 }
            );
        }

        // ✅ GET USER MODEL
        const usermodel = await models.userModel();
        if (!usermodel) {
            console.error("❌ User model not initialized");
            return NextResponse.json(
                { success: false, error: "User model error" },
                { status: 500 }
            );
        }

        // ✅ VERIFY USER EXISTS
        console.log("🔍 Checking if user exists...");
        const existingUser = await usermodel.findOne({
            where: { email: email },
            raw: true
        });

        if (!existingUser) {
            console.error("❌ User not found with email:", email);
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        console.log("✅ User found:");
        console.log("   ID:", existingUser.id);
        console.log("   Email:", existingUser.email);

        // ✅ UPDATE TOKEN
        console.log("📝 Updating FCM token in database...");
        const [affectedRows] = await usermodel.update(
            { fcmToken: token },
            { where: { email: email } }
        );

        console.log("Update result:", affectedRows, "rows affected");

        if (affectedRows === 0) {
            console.error("❌ No rows updated - update failed");
            return NextResponse.json(
                { success: false, error: "Update failed - no rows affected" },
                { status: 500 }
            );
        }

        // ✅ VERIFY TOKEN WAS SAVED
        console.log("🔍 Verifying token was saved...");
        const updatedUser = await usermodel.findOne({
            where: { email: email },
            raw: true
        });

        if (updatedUser.fcmToken !== token) {
            console.error("❌ Token verification failed");
            return NextResponse.json(
                { success: false, error: "Token verification failed" },
                { status: 500 }
            );
        }

        console.log("═══════════════════════════════════════════════════════");
        console.log("✅ FCM TOKEN SAVED SUCCESSFULLY");
        console.log("═══════════════════════════════════════════════════════");

        return NextResponse.json({
            success: true,
            message: 'FCM Token saved successfully',
            userId: updatedUser.id,
            email: updatedUser.email
        }, { status: 200 });

    } catch (error) {
        console.error("❌ ERROR SAVING FCM TOKEN");
        console.error("Error message:", error.message);
        console.error("Stack:", error.stack);

        return NextResponse.json({
            success: false,
            error: error.message || "Unknown error occurred"
        }, { status: 500 });
    }
};