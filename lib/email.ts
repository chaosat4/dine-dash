import nodemailer from 'nodemailer'

// Validate SMTP configuration
if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.warn('⚠️  SMTP credentials not configured. Email sending will fail.')
}

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const fromName = process.env.SMTP_FROM_NAME || 'Dine Dash'
const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@dinedash.com'

/**
 * Send email verification OTP
 */
export async function sendVerificationOTP(email: string, code: string, name?: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Email Verification</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px;">Hello${name ? ` ${name}` : ''},</p>
          <p style="font-size: 16px;">Thank you for registering with Dine Dash. Please use the verification code below to verify your email address:</p>
          <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h2 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request this verification, please ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Dine Dash. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: 'Verify Your Email - Dine Dash',
    html,
  })
}

/**
 * Send password reset OTP
 */
export async function sendPasswordResetOTP(email: string, code: string, name?: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px;">Hello${name ? ` ${name}` : ''},</p>
          <p style="font-size: 16px;">We received a request to reset your password. Use the OTP code below to reset your password:</p>
          <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h2 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Dine Dash. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: 'Password Reset - Dine Dash',
    html,
  })
}

/**
 * Send password reset link
 */
export async function sendPasswordResetLink(email: string, resetToken: string, name?: string): Promise<void> {
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const resetLink = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px;">Hello${name ? ` ${name}` : ''},</p>
          <p style="font-size: 16px;">We received a request to reset your password. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #667eea; word-break: break-all;">${resetLink}</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Dine Dash. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: 'Password Reset - Dine Dash',
    html,
  })
}

