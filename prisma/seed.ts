import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

console.log('✅ DATABASE_URL is set')

// Use standard pg adapter for seed script (works in Node.js environment)
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dinedash.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPassword, // In production, hash this password
        name: 'Admin',
        phone: '0000000000',
        role: 'ADMIN',
        verified: true,
      }
    })
    console.log(`✅ Created admin user with email: ${adminEmail}`)
  } else {
    console.log(`ℹ️  Admin user already exists`)
  }

  // Create tables (upsert to avoid duplicates)
  const tableNumbers = [1, 2, 3, 4, 5]
  const tables = await Promise.all(
    tableNumbers.map((number) =>
      prisma.table.upsert({
        where: { number },
        update: { isActive: true },
        create: { number, isActive: true },
      })
    )
  )
  console.log(`✅ Created/Updated ${tables.length} tables`)

  // Create categories (only if they don't exist)
  const categoryNames = [
    { name: 'Starters', sortOrder: 1 },
    { name: 'Main Course', sortOrder: 2 },
    { name: 'Biryani', sortOrder: 3 },
    { name: 'Breads', sortOrder: 4 },
    { name: 'Desserts', sortOrder: 5 },
    { name: 'Beverages', sortOrder: 6 },
  ]

  const categories = []
  for (const cat of categoryNames) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name }
    })
    if (!existing) {
      const created = await prisma.category.create({
        data: { ...cat, isActive: true }
      })
      categories.push(created)
    } else {
      categories.push(existing)
    }
  }
  console.log(`✅ Categories ready (${categories.length} total)`)

  // Create menu items
  const menuItems = [
    // Starters
    { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled to perfection with spices', price: 299, isVeg: true, categoryId: categories[0].id, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
    { name: 'Chicken 65', description: 'Spicy deep-fried chicken with curry leaves and chilies', price: 349, isVeg: false, categoryId: categories[0].id, image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400' },
    { name: 'Veg Manchurian', description: 'Crispy vegetable balls in tangy manchurian sauce', price: 249, isVeg: true, categoryId: categories[0].id },
    { name: 'Fish Fry', description: 'Crispy fried fish marinated with spices', price: 399, isVeg: false, categoryId: categories[0].id },
    
    // Main Course
    { name: 'Butter Chicken', description: 'Tender chicken in rich tomato and butter gravy', price: 399, isVeg: false, categoryId: categories[1].id, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
    { name: 'Palak Paneer', description: 'Cottage cheese cubes in creamy spinach gravy', price: 329, isVeg: true, categoryId: categories[1].id, image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400' },
    { name: 'Dal Makhani', description: 'Slow-cooked black lentils in creamy tomato gravy', price: 279, isVeg: true, categoryId: categories[1].id },
    { name: 'Kadai Chicken', description: 'Chicken cooked with bell peppers in kadai masala', price: 379, isVeg: false, categoryId: categories[1].id },
    { name: 'Paneer Butter Masala', description: 'Paneer cubes in rich buttery tomato gravy', price: 349, isVeg: true, categoryId: categories[1].id },
    
    // Biryani
    { name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken and spices', price: 399, isVeg: false, categoryId: categories[2].id, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
    { name: 'Veg Biryani', description: 'Fragrant rice with mixed vegetables and dum cooking', price: 299, isVeg: true, categoryId: categories[2].id },
    { name: 'Mutton Biryani', description: 'Slow-cooked mutton with fragrant basmati rice', price: 499, isVeg: false, categoryId: categories[2].id },
    
    // Breads
    { name: 'Butter Naan', description: 'Soft leavened bread brushed with butter', price: 69, isVeg: true, categoryId: categories[3].id },
    { name: 'Garlic Naan', description: 'Naan topped with fresh garlic and coriander', price: 79, isVeg: true, categoryId: categories[3].id },
    { name: 'Tandoori Roti', description: 'Whole wheat bread baked in tandoor', price: 49, isVeg: true, categoryId: categories[3].id },
    { name: 'Laccha Paratha', description: 'Layered flaky paratha with butter', price: 69, isVeg: true, categoryId: categories[3].id },
    
    // Desserts
    { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose-flavored syrup', price: 149, isVeg: true, categoryId: categories[4].id, image: 'https://images.unsplash.com/photo-1666190050431-e564928cb9b2?w=400' },
    { name: 'Rasmalai', description: 'Soft cheese patties in saffron-flavored milk', price: 169, isVeg: true, categoryId: categories[4].id },
    { name: 'Kulfi', description: 'Traditional Indian ice cream with pistachios', price: 129, isVeg: true, categoryId: categories[4].id },
    
    // Beverages
    { name: 'Masala Chai', description: 'Traditional Indian spiced tea', price: 49, isVeg: true, categoryId: categories[5].id },
    { name: 'Mango Lassi', description: 'Creamy yogurt smoothie with alphonso mango', price: 129, isVeg: true, categoryId: categories[5].id, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
    { name: 'Fresh Lime Soda', description: 'Refreshing lemon soda - sweet or salted', price: 79, isVeg: true, categoryId: categories[5].id },
    { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 149, isVeg: true, categoryId: categories[5].id },
  ]

  // Create menu items (only if they don't exist)
  let itemsCreated = 0
  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({
      where: {
        name: item.name,
        categoryId: item.categoryId,
      }
    })
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          ...item,
          isAvailable: true,
          sortOrder: 0,
        },
      })
      itemsCreated++
    }
  }
  console.log(`✅ Menu items ready (${itemsCreated} created, ${menuItems.length - itemsCreated} already existed)`)

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

