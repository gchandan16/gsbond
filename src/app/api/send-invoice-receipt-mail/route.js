
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

import { getModels } from "../../models";
import { validateRequest } from "../../utils";

export async function POST(req) {
  try {
    // Validate user permission
    const user = validateRequest(req, "quote", "create");

    const { quotehistorymodel } = await getModels();
    const formData = await req.formData();

    const id = formData.get("id");
    const to = formData.get("to");
    const subject = formData.get("subject");
    const html = formData.get("html");

    // Get one or multiple PDF attachments
    const pdfFiles = formData.getAll("quotePdf");

    if (!to || typeof to !== "string") {
      throw new Error("Recipient email is required.");
    }

    if (!pdfFiles.length) {
      throw new Error("Please attach an Invoice or Receipt PDF.");
    }

    // Validate and prepare all PDF attachments
    const attachments = await Promise.all(
      pdfFiles.map(async (file) => {
        if (
          typeof file.arrayBuffer !== "function" ||
          file.size === 0 ||
          file.type !== "application/pdf"
        ) {
          throw new Error("Invalid PDF attachment.");
        }

        return {
          filename: file.name || "document.pdf",
          content: Buffer.from(await file.arrayBuffer()),
          contentType: "application/pdf",
        };
      })
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

    // Send one email containing all selected PDFs
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: subject || "Invoice / Receipt - GS Bond Cleaning",
      html:
        html ||
        "<p>Please find your selected documents attached.</p>",
      attachments,
    });

    // Record the email in quote history
    await quotehistorymodel.create({
      quote_id: id,
      user_id: user.id,
      action_type: "MAIL_SEND",
      remark: `Invoice/Receipt email sent to ${to}. Attachments: ${attachments
        .map((file) => file.filename)
        .join(", ")}`,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
      attachments: attachments.map((file) => file.filename),
    });
  } catch (err) {
    console.error("SEND INVOICE/RECEIPT EMAIL ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to send email.",
      },
      { status: 500 }
    );
  }
}
