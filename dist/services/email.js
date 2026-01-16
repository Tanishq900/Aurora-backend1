"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = sendOTPEmail;
const resend_1 = require("resend");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const resendApiKey = env_1.env.resendApiKey();
const emailFrom = env_1.env.emailFrom();
let resend = null;
if (resendApiKey) {
    resend = new resend_1.Resend(resendApiKey);
}
async function sendOTPEmail(email, otpCode) {
    if (!resend) {
        if (!env_1.env.isProduction) {
            logger_1.logger.debug(`[EMAIL] OTP for ${email}: ${otpCode}`);
            logger_1.logger.warn('Resend API key not configured. OTP sent to console.');
            return;
        }
        throw new Error('Email service not configured');
    }
    try {
        await resend.emails.send({
            from: emailFrom,
            to: email,
            subject: 'Your Aurora Account Verification Code',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Verify Your Email</h1>
              </div>
              <div class="content">
                <p>Hi there,</p>
                <p>Thank you for registering with <strong>Aurora — Campus Sentinel</strong>.<br>To complete your account setup, please verify your email address.</p>
                <p><strong>Your One-Time Verification Code (OTP):</strong></p>
                <div class="otp-code">${otpCode}</div>
                <p>This code is valid for the next <strong>10 minutes</strong>.<br>If you didn't request this, you can safely ignore this message.</p>
                <p>For your security, do not share this code with anyone.</p>
                <p>Best regards,<br><strong>Aurora Security Team</strong></p>
              </div>
              <div class="footer">
                <p>Aurora Campus Sentinel © 2024</p>
              </div>
            </div>
          </body>
        </html>
      `,
            text: `Hi there,\n\nThank you for registering with Aurora — Campus Sentinel.\nTo complete your account setup, please verify your email address.\n\nYour One-Time Verification Code (OTP):\n\n${otpCode}\n\nThis code is valid for the next 10 minutes.\nIf you didn't request this, you can safely ignore this message.\n\nFor your security, do not share this code with anyone.\n\nBest regards,\nAurora Security Team`,
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to send OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
}
//# sourceMappingURL=email.js.map