import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword, token } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      )
    }

    if (!code && !token) {
      return NextResponse.json(
        { error: 'Either OTP code or reset token is required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Find reset OTP/token
    const resetIdentifier = token || code
    const otp = await prisma.oTP.findFirst({
      where: {
        phone: `reset:${email}`,
        code: resetIdentifier,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code/token' },
        { status: 400 }
      )
    }

    // Find user (Staff or PlatformAdmin)
    const staff = await prisma.staff.findUnique({
      where: { email },
    })

    const platformAdmin = staff
      ? null
      : await prisma.platformAdmin.findUnique({
          where: { email },
        })

    if (!staff && !platformAdmin) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = Buffer.from(newPassword).toString('base64')

    // Update password and mark OTP as verified
    await prisma.$transaction([
      // Update password
      staff
        ? prisma.staff.update({
            where: { id: staff.id },
            data: { password: hashedPassword },
          })
        : prisma.platformAdmin.update({
            where: { id: platformAdmin!.id },
            data: { password: hashedPassword },
          }),
      // Mark OTP as verified
      prisma.oTP.update({
        where: { id: otp.id },
        data: { verified: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

