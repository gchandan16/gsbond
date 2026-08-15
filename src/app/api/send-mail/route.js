import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

import { getModels } from "../../models"
import { validateRequest } from "../../utils"
export async function POST(req) {
  console.log("sending email");
  const user = validateRequest(req, "quote", "create");

  const { quotehistorymodel } = await getModels();



  try {
    const { id, to, subject, html } = await req.json();

    await quotehistorymodel.create({
      quote_id: id,
      user_id: user.id,
      action_type: "MAIL_SEND",
      remark: `Email send to ${to} with subject ${subject}`,
    })

    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
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
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}