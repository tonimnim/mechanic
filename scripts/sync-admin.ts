import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Update admin user ID to match Supabase UUID
const SUPABASE_ADMIN_UUID = 'ctc9xa91-c814-447a-8a12-dab8437f651d'

async function syncAdminId() {
    const admin = await prisma.user.findFirst({
        where: { email: 'admin@mechanicfinder.ke' }
    })

    if (!admin) {
        console.log('No admin user found. Creating one...')
        await prisma.user.create({
            data: {
                id: SUPABASE_ADMIN_UUID,
                email: 'admin@mechanicfinder.ke',
                phone: '+254700000000',
                fullName: 'Admin User',
                role: 'admin',
                isVerified: true,
            }
        })
        console.log('Created admin with Supabase ID!')
    } else if (admin.id !== SUPABASE_ADMIN_UUID) {
        console.log('Updating admin ID from', admin.id, 'to', SUPABASE_ADMIN_UUID)
        await prisma.user.update({
            where: { id: admin.id },
            data: { id: SUPABASE_ADMIN_UUID }
        })
        console.log('Done!')
    } else {
        console.log('Admin ID already matches Supabase UUID')
    }
}

syncAdminId()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
