import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/utils'
import { sendPasswordResetOTP, sendPasswordResetLink } from '@/lib/email'
import * as crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'otp' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists (Staff or PlatformAdmin)
    const staff = await prisma.staff.findUnique({
      where: { email },
    })

    const platformAdmin = staff
      ? null
      : await prisma.platformAdmin.findUnique({
          where: { email },
        })

    if (!staff && !platformAdmin) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a password reset code has been sent.',
      })
    }

    const userName = staff?.name || platformAdmin?.name

    if (type === 'link') {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token in OTP table (using phone field for email)
      await prisma.oTP.create({
        data: {
          phone: `reset:${email}`, // Prefix to distinguish from regular OTPs
          code: resetToken,
          expiresAt,
          verified: false,
        },
      })

      // Send reset link
      try {
        await sendPasswordResetLink(email, resetToken, userName)
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        return NextResponse.json(
          { error: 'Failed to send reset email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset link has been sent to your email.',
      })
    } else {
      // Generate OTP
      const code = generateOTP()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store OTP (using phone field for email)
      await prisma.oTP.create({
        data: {
          phone: `reset:${email}`, // Prefix to distinguish from regular OTPs
          code,
          expiresAt,
          verified: false,
        },
      })

      // Send OTP email
      try {
        await sendPasswordResetOTP(email, code, userName)
      } catch (emailError) {
        console.error('Failed to send password reset OTP:', emailError)
        return NextResponse.json(
          { error: 'Failed to send reset OTP' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset OTP has been sent to your email.',
      })
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

