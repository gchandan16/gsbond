// utils/mailer.js

import nodemailer from "nodemailer";

export const sendOTPEmail = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"GS BOND CLEANING" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verification OTP Code",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #1a73e8; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">GS BOND CLEANING</h1>
          <p style="color: #d0e4ff; margin: 6px 0 0; font-size: 13px;">Verification Code</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 40px; text-align: center;">
          <p style="color: #444; font-size: 15px; margin: 0 0 10px;">Hello,</p>
          <p style="color: #444; font-size: 15px; margin: 0 0 30px;">Use the OTP below to verify your identity. Do not share this code with anyone.</p>

          <!-- OTP Box -->
          <div style="background-color: #f0f5ff; border: 2px dashed #1a73e8; border-radius: 10px; padding: 20px 30px; display: inline-block; margin-bottom: 30px;">
            <h1 style="color: #1a73e8; font-size: 42px; letter-spacing: 12px; margin: 0; font-weight: 800;">${otp}</h1>
          </div>

          <!-- Expiry Notice -->
          <div style="background-color: #fff8e1; border-left: 4px solid #f9a825; border-radius: 4px; padding: 12px 16px; text-align: left;">
            <p style="color: #f57f17; margin: 0; font-size: 13px;">⏳ This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9f9f9; border-top: 1px solid #eee; padding: 20px 40px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
          <p style="color: #999; font-size: 12px; margin: 6px 0 0;">© ${new Date().getFullYear()} GS Bond Cleaning. All rights reserved.</p>
        </div>

      </div>
    </div>
  `,
  };

  await transporter.sendMail(mailOptions);
};