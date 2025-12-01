import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!directUrl) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

console.log('✅ DATABASE_URL is set')

// Use pg adapter for seed script
const pool = new Pool({ connectionString: directUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create Platform Super Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dinedash.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  const hashedPassword = Buffer.from(adminPassword).toString('base64')
  
  const existingAdmin = await prisma.platformAdmin.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.platformAdmin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    })
    console.log(`✅ Created platform super admin: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
  } else {
    console.log(`ℹ️  Platform admin already exists: ${adminEmail}`)
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

