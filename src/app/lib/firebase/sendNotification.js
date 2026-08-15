import admin from "./firebaseAdmin";

// Purpose: Send push notification - Works on all Firebase Admin SDK versions
export const sendNotification = async (title, body, recipients) => {
    try {
        if (!recipients || recipients.length === 0) {
            console.error("❌ No recipients provided");
            return { success: false, error: "No recipients" };
        }

        const tokens = recipients
            .map(r => r.fcmToken)
            .filter(t => t && typeof t === 'string' && t.length > 0);

        if (tokens.length === 0) {
            console.error("❌ No valid FCM tokens found");
            return { success: false, error: "No valid tokens" };
        }

        console.log("═══════════════════════════════════════════════════════");
        console.log("📤 SENDING NOTIFICATION");
        console.log("═══════════════════════════════════════════════════════");
        console.log("Title:", title);
        console.log("Body:", body);
        console.log("Recipients count:", tokens.length);
        console.log("Tokens:", tokens.map(t => t.substring(0, 30) + "..."));

        let successCount = 0;
        let failureCount = 0;
        const messageIds = [];
        const responses = [];

        console.log("⏳ Sending via Firebase Admin SDK...");

        // ✨ SEND ONE BY ONE using send() - Works on all SDK versions
        for (let i = 0; i < tokens.length; i++) {
            try {
                const messageId = await admin.messaging().send({
                    token: tokens[i],
                    notification: {
                        title: title,
                        body: body
                    },
                    data: {
                        title: title,
                        body: body,
                        url: "/dashboard"
                    }
                });

                console.log(`✅ Message ${i + 1}: Delivered`);
                console.log(`   MessageID: ${messageId}`);
                console.log(`   Token: ${tokens[i].substring(0, 30)}...`);

                successCount++;
                messageIds.push(messageId);
                responses.push({
                    success: true,
                    messageId: messageId
                });

            } catch (error) {
                console.log(`❌ Message ${i + 1}: Failed`);
                console.log(`   Error: ${error.code}`);
                console.log(`   Message: ${error.message}`);
                console.log(`   Token: ${tokens[i].substring(0, 30)}...`);

                failureCount++;
                responses.push({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message
                    }
                });
            }
        }

        console.log("═══════════════════════════════════════════════════════");
        console.log("✅ NOTIFICATION SEND RESPONSE");
        console.log("═══════════════════════════════════════════════════════");
        console.log("Total messages:", tokens.length);
        console.log("✅ Successful:", successCount);
        console.log("❌ Failed:", failureCount);
        console.log("═══════════════════════════════════════════════════════");

        return {
            success: failureCount === 0,
            successCount: successCount,
            failureCount: failureCount,
            messageIds: messageIds,
            responses: responses
        };

    } catch (error) {
        console.error("═══════════════════════════════════════════════════════");
        console.error("❌ ERROR SENDING NOTIFICATION");
        console.error("═══════════════════════════════════════════════════════");
        console.error("Error name:", error.name);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Stack:", error.stack);
        console.error("═══════════════════════════════════════════════════════");

        return {
            success: false,
            error: error.message,
            errorCode: error.code
        };
    }
};

