import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CORRECT Supabase UUID from user
const SUPABASE_UUID = 'c1c1ba41-c814-447e-8e12-de843721f51d'

async function fixAdmin() {
    // Delete any existing admin
    await prisma.user.deleteMany({ where: { email: 'admin@mechanicfinder.ke' } })
    console.log('Deleted old admin entries')

    // Create with correct Supabase UUID
    const admin = await prisma.user.create({
        data: {
            id: SUPABASE_UUID,
            email: 'admin@mechanicfinder.ke',
            phone: '+254700000000',
            fullName: 'Admin User',
            role: 'admin',
            isVerified: true,
        }
    })

    console.log('Created admin with correct ID:', admin.id)
    console.log('Try logging in now!')
}

fixAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
