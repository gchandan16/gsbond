import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

import { getModels } from "../../models";
import { validateRequest } from "../../utils";

export async function POST(req) {

    try {

        console.log("Sending quotation email...");

        const user = validateRequest(req, "quote", "create");

        const { quotehistorymodel } = await getModels();

        const formData = await req.formData();

        const id = formData.get("id");
        const to = formData.get("to");
        const subject = formData.get("subject");
        const html = formData.get("html");
        const quotePdf = formData.get("quotePdf");

        console.log("Quote ID:", id);
        console.log("Recipient:", to);
        console.log("PDF:", quotePdf?.name);
        console.log("PDF size:", quotePdf?.size);

        if (!to) {
            throw new Error("Recipient email is required");
        }

        if (!quotePdf) {
            throw new Error("Quotation PDF is required");
        }

        const pdfBuffer = Buffer.from(
            await quotePdf.arrayBuffer()
        );

        const transporter = nodemailer.createTransport({
            host: "smtpout.secureserver.net",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,

            attachments: [
                {
                    filename:
                        quotePdf.name || "quotation.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        });

        await quotehistorymodel.create({
            quote_id: id,
            user_id: user.id,
            action_type: "MAIL_SEND",
            remark: `Quotation email sent to ${to} with subject ${subject}`,
        });

        return NextResponse.json({
            success: true,
            message: "Quotation email sent successfully",
        });

    } catch (err) {

        console.error(
            "SEND QUOTATION MAIL ERROR:",
            err
        );

        return NextResponse.json(
            {
                success: false,
                error: err.message,
            },
            { status: 500 }
        );
    }
}