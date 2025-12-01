import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantName, ownerName, email, phone, password, address, city, state } = body

    // Check if email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email },
    })

    if (existingStaff) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Create slug from restaurant name
    const slug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists and make unique if needed
    let uniqueSlug = slug
    let counter = 1
    while (await prisma.restaurant.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    // Hash password (simple hash for demo - use bcrypt in production)
    const hashedPassword = Buffer.from(password).toString('base64')

    // Create restaurant with owner in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug: uniqueSlug,
          email,
          phone,
          address,
          city,
          state,
          isActive: false,
          isVerified: false,
        },
      })

      // Create brand settings with defaults
      await tx.brandSettings.create({
        data: {
          restaurantId: restaurant.id,
        },
      })

      // Create owner staff account
      const staff = await tx.staff.create({
        data: {
          restaurantId: restaurant.id,
          name: ownerName,
          email,
          phone,
          password: hashedPassword,
          role: 'OWNER',
        },
      })

      // Generate verification code (6 digits)
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Store OTP
      await tx.oTP.create({
        data: {
          phone: email, // Using email for verification
          code,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      })

      return { restaurant, staff, code }
    })

    // In production, send email with verification code
    console.log(`Verification code for ${email}: ${result.code}`)

    return NextResponse.json({
      success: true,
      restaurantId: result.restaurant.id,
      message: 'Registration successful. Please verify your email.',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}

