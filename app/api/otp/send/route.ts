import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Generate OTP
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store OTP in database
    await prisma.oTP.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    })

    // In production, send OTP via SMS service
    // For demo, we return the OTP (remove in production!)
    console.log(`OTP for ${phone}: ${code}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production!
      demoOtp: code,
    })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}

