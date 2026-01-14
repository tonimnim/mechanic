import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mechanicfinder.ke',
      phone: '+254700000000',
      fullName: 'Admin User',
      role: 'admin',
      isVerified: true,
    }
  })
  console.log('Created admin:', admin.id)

  // 2. Create Verified Mechanic: John Kamau
  const mech1 = await prisma.user.create({
    data: {
      email: 'john@nairobi-auto.com',
      phone: '+254712345678',
      fullName: 'John Kamau',
      role: 'mechanic',
      isVerified: true,
      mechanicProfile: {
        create: {
          serviceType: 'mechanic',
          businessName: 'John Kamau Auto',
          bio: 'Specialist in Japanese cars. 15 years experience with Toyota and Subaru.',
          specialties: 'Toyota,Subaru,Engine Repair',
          yearsExperience: 15,
          city: 'Nairobi',
          address: 'Industrial Area, Road C',
          serviceAreas: 'Industrial Area,South B,South C',
          serviceRadius: 15,
          lat: -1.3005,
          lng: 36.8219,
          phone: '+254712345678',
          whatsapp: '+254712345678',
          callOutFee: 500,
          hourlyRate: 800,
          availability: 'online',
          totalJobs: 127,
          avgRating: 4.9,
        }
      }
    }
  })
  console.log('Created mechanic 1:', mech1.id)

  // 3. Create Unverified Mechanic: Kevo
  const mech2 = await prisma.user.create({
    data: {
      email: 'kevo@westlands.com',
      phone: '+254722334455',
      fullName: 'Kevin Omondi',
      role: 'mechanic',
      isVerified: false,
      mechanicProfile: {
        create: {
          serviceType: 'mechanic',
          bio: 'Quick mobile mechanic. I come to you.',
          specialties: 'General Service,Battery,Tires',
          yearsExperience: 5,
          city: 'Nairobi',
          address: 'Westlands',
          serviceAreas: 'Westlands,Parklands,Kilimani',
          serviceRadius: 10,
          lat: -1.2680,
          lng: 36.8040,
          phone: '+254722334455',
          callOutFee: 300,
          hourlyRate: 600,
          availability: 'offline',
          totalJobs: 45,
          avgRating: 4.5,
        }
      }
    }
  })
  console.log('Created mechanic 2:', mech2.id)

  // 4. Create Breakdown Service: Quick Tow
  const breakdown1 = await prisma.user.create({
    data: {
      email: 'info@quicktow.co.ke',
      phone: '+254733445566',
      fullName: 'Quick Tow Kenya',
      role: 'breakdown',
      isVerified: true,
      mechanicProfile: {
        create: {
          serviceType: 'breakdown',
          businessName: 'Quick Tow Kenya',
          bio: '24/7 Towing and roadside assistance. Fast response times.',
          specialties: 'Towing,Battery Jump,Tire Change,Fuel Delivery',
          yearsExperience: 8,
          city: 'Nairobi',
          address: 'Mombasa Road',
          serviceAreas: 'All Nairobi,Thika Road,Mombasa Road',
          serviceRadius: 50,
          lat: -1.3200,
          lng: 36.8500,
          phone: '+254733445566',
          whatsapp: '+254733445566',
          callOutFee: 1500,
          hourlyRate: 0, // Flat fee based service
          availability: 'online',
          totalJobs: 312,
          avgRating: 4.7,
        }
      }
    }
  })
  console.log('Created breakdown service:', breakdown1.id)

  // 5. Create Shop: Kirinyaga Spares
  const shop1 = await prisma.user.create({
    data: {
      email: 'sales@kirinyaga-spares.com',
      phone: '+254744556677',
      fullName: 'Kirinyaga Road Spares',
      role: 'shop',
      isVerified: true,
      shopProfile: {
        create: {
          shopName: 'Kirinyaga Road Spares',
          description: 'The biggest dealer in genuine Toyota parts in CBD.',
          inventoryCategories: 'Body Parts,Engine,Lighting',
          city: 'Nairobi',
          address: 'Kirinyaga Road, CBD',
          phone: '+254744556677',
          lat: -1.2841,
          lng: 36.8265
        }
      }
    }
  })
  console.log('Created shop:', shop1.id)

  // 6. Create Client: Anthony (You)
  const client1 = await prisma.user.create({
    data: {
      id: 'client-1', // Fixed ID for testing
      email: 'anthony@gmail.com',
      phone: '+254755667788',
      fullName: 'Anthony Kamau',
      role: 'client',
      isVerified: true,
      vehicles: {
        create: [
          {
            make: 'Subaru',
            model: 'Forester',
            year: 2015,
            plateNumber: 'KCD 123X'
          },
          {
            make: 'Toyota',
            model: 'Vitz',
            year: 2012,
            plateNumber: 'KBA 456Y'
          }
        ]
      }
    }
  })
  console.log('Created client:', client1.id)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
