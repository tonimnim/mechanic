'use server'

import { PrismaClient } from '@prisma/client'

// Prisma singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// --- TYPES ---

export type VerificationListItem = {
    id: string
    userId: string
    userName: string
    userEmail: string
    userPhone: string
    serviceType: string
    specialties: string
    city: string
    status: string
    planType: string | null
    nationalIdUrl: string | null
    businessPermitUrl: string | null
    certificateUrl: string | null
    createdAt: string
}

export type DashboardStats = {
    totalMechanics: number
    totalBreakdown: number
    verifiedCount: number
    pendingVerifications: number
    totalClients: number
    totalContacts: number
    contactsToday: number
}

// --- ADMIN AUTHORIZATION CHECK ---

async function isAdmin(adminId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
    })
    return user?.role === 'admin'
}

// --- GET DASHBOARD STATS ---

export async function getAdminDashboardStats(adminId: string): Promise<{ success: boolean; stats?: DashboardStats; error?: string }> {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [
            totalMechanics,
            totalBreakdown,
            verifiedCount,
            pendingVerifications,
            totalClients,
            totalContacts,
            contactsToday
        ] = await Promise.all([
            prisma.mechanicProfile.count({ where: { serviceType: 'mechanic' } }),
            prisma.mechanicProfile.count({ where: { serviceType: 'breakdown' } }),
            prisma.user.count({ where: { isVerified: true, role: { in: ['mechanic', 'breakdown'] } } }),
            prisma.verificationRequest.count({ where: { status: 'pending' } }),
            prisma.user.count({ where: { role: 'client' } }),
            prisma.contactEvent.count(),
            prisma.contactEvent.count({ where: { createdAt: { gte: today } } })
        ])

        return {
            success: true,
            stats: {
                totalMechanics,
                totalBreakdown,
                verifiedCount,
                pendingVerifications,
                totalClients,
                totalContacts,
                contactsToday
            }
        }
    } catch (error) {
        console.error('Failed to get admin stats:', error)
        return { success: false, error: 'Failed to load dashboard stats' }
    }
}

// --- GET WEEKLY CONTACT STATS ---

export type WeeklyContactData = {
    day: string
    contacts: number
}

export async function getWeeklyContactStats(adminId: string): Promise<{ success: boolean; data?: WeeklyContactData[]; error?: string }> {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const days: WeeklyContactData[] = []
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        // Get last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const nextDate = new Date(date)
            nextDate.setDate(nextDate.getDate() + 1)

            const count = await prisma.contactEvent.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            })

            days.push({
                day: dayNames[date.getDay()],
                contacts: count
            })
        }

        return { success: true, data: days }
    } catch (error) {
        console.error('Failed to get weekly stats:', error)
        return { success: false, error: 'Failed to load weekly stats' }
    }
}

// --- GET WEEKLY SIGNUP STATS ---

export type WeeklySignupData = {
    day: string
    mechanics: number
    drivers: number
}

export async function getWeeklySignupStats(adminId: string): Promise<{ success: boolean; data?: WeeklySignupData[]; error?: string }> {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const days: WeeklySignupData[] = []
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const nextDate = new Date(date)
            nextDate.setDate(nextDate.getDate() + 1)

            const [mechanics, drivers] = await Promise.all([
                prisma.user.count({
                    where: {
                        role: { in: ['mechanic', 'breakdown'] },
                        createdAt: { gte: date, lt: nextDate }
                    }
                }),
                prisma.user.count({
                    where: {
                        role: 'client',
                        createdAt: { gte: date, lt: nextDate }
                    }
                })
            ])

            days.push({
                day: dayNames[date.getDay()],
                mechanics,
                drivers
            })
        }

        return { success: true, data: days }
    } catch (error) {
        console.error('Failed to get weekly signup stats:', error)
        return { success: false, error: 'Failed to load signup stats' }
    }
}

// --- MECHANIC TYPES ---

export type MechanicListItem = {
    id: string
    name: string
    email: string
    phone: string
    serviceType: 'mechanic' | 'breakdown'
    specialties: string[]
    city: string
    isVerified: boolean
    isOnline: boolean
    rating: number
    reviewCount: number
    contactCount: number
    verificationStatus: 'none' | 'pending' | 'approved' | 'rejected'
    createdAt: string
}

// --- GET ALL MECHANICS ---

export async function getAllMechanics(
    adminId: string,
    filters?: {
        search?: string
        serviceType?: 'all' | 'mechanic' | 'breakdown'
        verificationStatus?: 'all' | 'verified' | 'pending' | 'unverified'
        isOnline?: boolean
    }
): Promise<{ success: boolean; mechanics?: MechanicListItem[]; error?: string }> {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // Build where clause
        const where: any = {
            role: { in: ['mechanic', 'breakdown'] }
        }

        if (filters?.serviceType && filters.serviceType !== 'all') {
            where.role = filters.serviceType
        }

        if (filters?.verificationStatus === 'verified') {
            where.isVerified = true
        } else if (filters?.verificationStatus === 'unverified') {
            where.isVerified = false
        }

        if (filters?.search) {
            where.OR = [
                { fullName: { contains: filters.search } },
                { email: { contains: filters.search } },
                { phone: { contains: filters.search } }
            ]
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                mechanicProfile: true,
                verificationRequests: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                reviewsReceived: {
                    select: { rating: true }
                },
                _count: {
                    select: {
                        reviewsReceived: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Filter by online status if specified
        let filteredUsers = users
        if (filters?.isOnline !== undefined) {
            filteredUsers = users.filter(u =>
                (u.mechanicProfile?.availability === 'online') === filters.isOnline
            )
        }

        const mechanics: MechanicListItem[] = filteredUsers.map(user => {
            const avgRating = user.reviewsReceived.length > 0
                ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / user.reviewsReceived.length
                : 0

            const verificationStatus = user.verificationRequests.length > 0
                ? user.verificationRequests[0].status as 'pending' | 'approved' | 'rejected'
                : 'none'

            return {
                id: user.id,
                name: user.fullName,
                email: user.email,
                phone: user.phone,
                serviceType: user.role as 'mechanic' | 'breakdown',
                specialties: user.mechanicProfile?.specialties?.split(',') || [],
                city: user.mechanicProfile?.city || 'Unknown',
                isVerified: user.isVerified,
                isOnline: user.mechanicProfile?.availability === 'online',
                rating: Math.round(avgRating * 10) / 10,
                reviewCount: user._count.reviewsReceived,
                contactCount: 0, // TODO: implement contact counting
                verificationStatus,
                createdAt: user.createdAt.toISOString()
            }
        })

        return { success: true, mechanics }
    } catch (error) {
        console.error('Failed to get mechanics:', error)
        return { success: false, error: 'Failed to load mechanics' }
    }
}

// --- SET MECHANIC VERIFICATION STATUS ---

export async function setMechanicVerificationStatus(
    adminId: string,
    userId: string,
    verified: boolean
): Promise<{ success: boolean; error?: string }> {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isVerified: verified }
        })

        return { success: true }
    } catch (error) {
        console.error('Failed to update verification status:', error)
        return { success: false, error: 'Failed to update status' }
    }
}

// --- GET PENDING VERIFICATIONS ---

export async function getPendingVerifications(adminId: string): Promise<{ success: boolean; requests?: VerificationListItem[]; error?: string }> {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const requests = await prisma.verificationRequest.findMany({
            where: { status: 'pending' },
            include: {
                user: {
                    include: { mechanicProfile: true }
                }
            },
            orderBy: { createdAt: 'asc' } // Oldest first (FIFO)
        })

        return {
            success: true,
            requests: requests.map(r => ({
                id: r.id,
                userId: r.userId,
                userName: r.user.fullName,
                userEmail: r.user.email,
                userPhone: r.user.phone,
                serviceType: r.user.mechanicProfile?.serviceType || 'unknown',
                specialties: r.user.mechanicProfile?.specialties || '',
                city: r.user.mechanicProfile?.city || '',
                status: r.status,
                planType: r.planType,
                nationalIdUrl: r.nationalIdUrl,
                businessPermitUrl: r.businessPermitUrl,
                certificateUrl: r.certificateUrl,
                createdAt: r.createdAt.toISOString()
            }))
        }
    } catch (error) {
        console.error('Failed to get pending verifications:', error)
        return { success: false, error: 'Failed to load verifications' }
    }
}

// --- APPROVE VERIFICATION ---

export async function approveVerification(
    adminId: string,
    requestId: string,
    durationMonths: number = 12 // Default 1 year
) {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const request = await prisma.verificationRequest.findUnique({
            where: { id: requestId }
        })

        if (!request) {
            return { success: false, error: 'Request not found' }
        }

        // Calculate expiry date
        const verifiedUntil = new Date()
        verifiedUntil.setMonth(verifiedUntil.getMonth() + durationMonths)

        // Update request to 'approved' status
        // NOTE: user.isVerified is NOT set here - it's only set after M-Pesa payment
        await prisma.verificationRequest.update({
            where: { id: requestId },
            data: {
                status: 'approved',
                reviewedBy: adminId,
                reviewedAt: new Date(),
                // verifiedUntil is NOT set here - it's set after payment
            }
        })

        // Do NOT update user.isVerified here! 
        // That happens only after successful M-Pesa payment in the callback

        return { success: true }
    } catch (error) {
        console.error('Failed to approve verification:', error)
        return { success: false, error: 'Failed to approve verification' }
    }
}

// --- REJECT VERIFICATION ---

export async function rejectVerification(
    adminId: string,
    requestId: string,
    reason: string
) {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await prisma.verificationRequest.update({
            where: { id: requestId },
            data: {
                status: 'rejected',
                adminNotes: reason,
                reviewedBy: adminId,
                reviewedAt: new Date()
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Failed to reject verification:', error)
        return { success: false, error: 'Failed to reject verification' }
    }
}

// --- REVOKE VERIFICATION ---

export async function revokeVerification(adminId: string, userId: string, reason: string) {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isVerified: false }
        })

        // Add note to latest verification request
        await prisma.verificationRequest.updateMany({
            where: { userId, status: 'approved' },
            data: {
                status: 'revoked',
                adminNotes: `Revoked: ${reason}`,
                reviewedBy: adminId,
                reviewedAt: new Date()
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Failed to revoke verification:', error)
        return { success: false, error: 'Failed to revoke verification' }
    }
}

// --- GET ALL CLIENTS (for admin) ---

export async function getAllClients(adminId: string) {
    if (!await isAdmin(adminId)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const clients = await prisma.user.findMany({
            where: { role: 'client' },
            include: {
                _count: {
                    select: {
                        contactsMade: true,
                        reviewsWritten: true,
                        vehicles: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return {
            success: true,
            clients: clients.map(c => ({
                id: c.id,
                fullName: c.fullName,
                email: c.email,
                phone: c.phone,
                contactsMade: c._count.contactsMade,
                reviewsWritten: c._count.reviewsWritten,
                vehicleCount: c._count.vehicles,
                createdAt: c.createdAt.toISOString()
            }))
        }
    } catch (error) {
        console.error('Failed to get clients:', error)
        return { success: false, error: 'Failed to load clients' }
    }
}

// --- CREATE ADMIN USER (for initial setup) ---

export async function createAdminUser(email: string, phone: string, fullName: string, secretKey: string) {
    // Simple secret key check for initial admin creation
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return { success: false, error: 'Invalid secret key' }
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] }
        })

        if (existingUser) {
            return { success: false, error: 'User already exists' }
        }

        const admin = await prisma.user.create({
            data: {
                email,
                phone,
                fullName,
                role: 'admin',
                isVerified: true
            }
        })

        return { success: true, userId: admin.id }
    } catch (error) {
        console.error('Failed to create admin:', error)
        return { success: false, error: 'Failed to create admin user' }
    }
}
