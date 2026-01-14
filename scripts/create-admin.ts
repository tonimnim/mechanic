// Quick script to create admin user
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdmin() {
    const adminId = 'admin-001' // Use fixed ID for easy reference

    // Check if admin exists
    const existing = await prisma.user.findFirst({
        where: { role: 'admin' }
    })

    if (existing) {
        console.log('Admin already exists:', existing.email)
        console.log('Admin ID:', existing.id)
        return
    }

    const admin = await prisma.user.create({
        data: {
            id: adminId,
            email: 'admin@mechanicfinder.ke',
            phone: '+254700000000',
            fullName: 'Admin User',
            role: 'admin',
            isVerified: true,
        }
    })

    console.log('Created admin user!')
    console.log('Email: admin@mechanicfinder.ke')
    console.log('ID:', admin.id)
    console.log('')
    console.log('Now you need to create this user in Supabase Auth:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Authentication > Users > Add user')
    console.log('3. Use email: admin@mechanicfinder.ke')
    console.log('4. Set a password')
    console.log('5. IMPORTANT: Copy the Supabase User ID')
    console.log('6. Update the admin user ID in the database to match')
}

createAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
