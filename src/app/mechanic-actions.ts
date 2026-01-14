'use server'

import { PrismaClient } from '@prisma/client'

// Prisma singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// --- TYPES ---

export type MechanicRegistrationInput = {
    // User info
    email: string
    phone: string
    fullName: string
    userId?: string // Optional Supabase User ID

    // Profile info
    serviceType: 'mechanic' | 'breakdown'
    businessName?: string
    specialties: string[] // Array, will be joined
    yearsExperience: number
    bio?: string

    // Location
    city: string
    address: string
    serviceAreas?: string[]
    serviceRadius?: number
    lat: number
    lng: number

    // Pricing
    callOutFee?: number
    hourlyRate?: number

    // Contact
    whatsapp?: string
}

export type MechanicProfileUpdate = {
    businessName?: string
    bio?: string
    specialties?: string[]
    yearsExperience?: number
    city?: string
    address?: string
    serviceAreas?: string[]
    serviceRadius?: number
    callOutFee?: number
    hourlyRate?: number
    workingHours?: Record<string, string>
    whatsapp?: string
    phone?: string
}

export type VerificationRequestInput = {
    nationalIdUrl?: string
    businessPermitUrl?: string
    certificateUrl?: string
    planType: 'basic' | 'standard' | 'premium'
}

// --- MECHANIC REGISTRATION ---

export async function registerMechanic(input: MechanicRegistrationInput) {
    try {
        // Check if email or phone already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: input.email },
                    { phone: input.phone }
                ]
            }
        })

        if (existingUser) {
            return {
                success: false,
                error: existingUser.email === input.email
                    ? 'Email already registered'
                    : 'Phone number already registered'
            }
        }

        // Create user with mechanic role
        const user = await prisma.user.create({
            data: {
                id: input.userId, // Use provided ID if available
                email: input.email,
                phone: input.phone,
                fullName: input.fullName,
                role: input.serviceType, // 'mechanic' or 'breakdown'
                isVerified: false,
                mechanicProfile: {
                    create: {
                        serviceType: input.serviceType,
                        businessName: input.businessName,
                        bio: input.bio,
                        specialties: input.specialties.join(','),
                        yearsExperience: input.yearsExperience,
                        city: input.city,
                        address: input.address,
                        serviceAreas: input.serviceAreas?.join(','),
                        serviceRadius: input.serviceRadius || 10,
                        lat: input.lat,
                        lng: input.lng,
                        phone: input.phone,
                        whatsapp: input.whatsapp || input.phone,
                        callOutFee: input.callOutFee || 0,
                        hourlyRate: input.hourlyRate || 0,
                        availability: 'offline', // Start offline until they go online
                    }
                }
            },
            include: {
                mechanicProfile: true
            }
        })

        return {
            success: true,
            userId: user.id,
            profileId: user.mechanicProfile?.id
        }
    } catch (error) {
        console.error('Mechanic registration failed:', error)
        return { success: false, error: 'Registration failed. Please try again.' }
    }
}

// --- GET MECHANIC PROFILE (for dashboard) ---

export async function getMechanicProfile(userId: string) {
    try {
        const profile = await prisma.mechanicProfile.findFirst({
            where: { userId },
            include: {
                user: true,
                contactsReceived: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        })

        if (!profile) {
            return { success: false, error: 'Profile not found' }
        }

        // Get review stats
        const reviewStats = await prisma.review.aggregate({
            where: { targetId: userId },
            _avg: { rating: true },
            _count: { rating: true }
        })

        return {
            success: true,
            profile: {
                id: profile.id,
                userId: profile.userId,

                // User info
                fullName: profile.user.fullName,
                email: profile.user.email,
                isVerified: profile.user.isVerified,
                avatarUrl: profile.user.avatarUrl,

                // Profile info
                serviceType: profile.serviceType,
                businessName: profile.businessName,
                bio: profile.bio,
                specialties: profile.specialties.split(',').map(s => s.trim()),
                yearsExperience: profile.yearsExperience,

                // Location
                city: profile.city,
                address: profile.address,
                serviceAreas: profile.serviceAreas?.split(',').map(s => s.trim()) || [],
                serviceRadius: profile.serviceRadius,
                lat: profile.lat,
                lng: profile.lng,

                // Contact
                phone: profile.phone,
                whatsapp: profile.whatsapp,

                // Pricing
                callOutFee: profile.callOutFee,
                hourlyRate: profile.hourlyRate,

                // Availability
                availability: profile.availability,
                workingHours: profile.workingHours ? JSON.parse(profile.workingHours) : null,

                // Stats
                totalJobs: profile.totalJobs,
                avgRating: reviewStats._avg.rating || 0,
                reviewCount: reviewStats._count.rating || 0,

                // Recent contacts
                recentContacts: profile.contactsReceived.length,

                createdAt: profile.createdAt.toISOString(),
            }
        }
    } catch (error) {
        console.error('Failed to get mechanic profile:', error)
        return { success: false, error: 'Failed to load profile' }
    }
}

// --- UPDATE MECHANIC PROFILE ---

export async function updateMechanicProfile(userId: string, updates: MechanicProfileUpdate) {
    try {
        const profile = await prisma.mechanicProfile.update({
            where: { userId },
            data: {
                businessName: updates.businessName,
                bio: updates.bio,
                specialties: updates.specialties?.join(','),
                yearsExperience: updates.yearsExperience,
                city: updates.city,
                address: updates.address,
                serviceAreas: updates.serviceAreas?.join(','),
                serviceRadius: updates.serviceRadius,
                callOutFee: updates.callOutFee,
                hourlyRate: updates.hourlyRate,
                workingHours: updates.workingHours ? JSON.stringify(updates.workingHours) : undefined,
                whatsapp: updates.whatsapp,
                phone: updates.phone,
            }
        })

        return { success: true, profileId: profile.id }
    } catch (error) {
        console.error('Failed to update mechanic profile:', error)
        return { success: false, error: 'Failed to update profile' }
    }
}

// --- UPDATE AVAILABILITY ---

export async function updateMechanicAvailability(
    userId: string,
    availability: 'online' | 'busy' | 'offline'
) {
    try {
        await prisma.mechanicProfile.update({
            where: { userId },
            data: { availability }
        })

        return { success: true }
    } catch (error) {
        console.error('Failed to update availability:', error)
        return { success: false, error: 'Failed to update availability' }
    }
}

// --- VERIFICATION REQUEST ---

export async function submitVerificationRequest(
    userId: string,
    input: VerificationRequestInput
) {
    try {
        // Check for existing pending request
        const existingRequest = await prisma.verificationRequest.findFirst({
            where: {
                userId,
                status: 'pending'
            }
        })

        if (existingRequest) {
            return { success: false, error: 'You already have a pending verification request' }
        }

        const request = await prisma.verificationRequest.create({
            data: {
                userId,
                nationalIdUrl: input.nationalIdUrl,
                businessPermitUrl: input.businessPermitUrl,
                certificateUrl: input.certificateUrl,
                planType: input.planType,
                status: 'pending'
            }
        })

        return { success: true, requestId: request.id }
    } catch (error) {
        console.error('Failed to submit verification request:', error)
        return { success: false, error: 'Failed to submit verification request' }
    }
}

// --- GET VERIFICATION STATUS ---

export async function getVerificationStatus(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isVerified: true }
        })

        const latestRequest = await prisma.verificationRequest.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        return {
            success: true,
            isVerified: user?.isVerified || false,
            latestRequest: latestRequest ? {
                id: latestRequest.id,
                status: latestRequest.status,
                planType: latestRequest.planType,
                verifiedUntil: latestRequest.verifiedUntil?.toISOString(),
                createdAt: latestRequest.createdAt.toISOString(),
                adminNotes: latestRequest.status === 'rejected' ? latestRequest.adminNotes : null
            } : null
        }
    } catch (error) {
        console.error('Failed to get verification status:', error)
        return { success: false, error: 'Failed to get verification status' }
    }
}

// --- SUBMIT REVIEW ---

export async function submitReview(
    authorId: string,
    targetId: string,
    rating: number,
    comment?: string,
    tags?: string[],
    serviceRequestId?: string
) {
    try {
        // Validate rating
        if (rating < 1 || rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5' }
        }

        const review = await prisma.review.create({
            data: {
                authorId,
                targetId,
                rating,
                comment,
                tags: tags?.join(','),
                serviceRequestId
            }
        })

        // Update mechanic's cached stats
        const avgRating = await prisma.review.aggregate({
            where: { targetId },
            _avg: { rating: true }
        })

        // Find mechanic profile and update stats
        const mechanicProfile = await prisma.mechanicProfile.findFirst({
            where: { userId: targetId }
        })

        if (mechanicProfile) {
            await prisma.mechanicProfile.update({
                where: { id: mechanicProfile.id },
                data: { avgRating: avgRating._avg.rating || 0 }
            })
        }

        return { success: true, reviewId: review.id }
    } catch (error) {
        console.error('Failed to submit review:', error)
        return { success: false, error: 'Failed to submit review' }
    }
}

// --- GET MECHANIC REVIEWS ---

export async function getMechanicReviews(userId: string, limit: number = 20) {
    try {
        const reviews = await prisma.review.findMany({
            where: { targetId: userId },
            include: {
                author: {
                    select: { fullName: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return {
            success: true,
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                tags: r.tags?.split(',').map(t => t.trim()) || [],
                authorName: r.author.fullName,
                authorAvatar: r.author.avatarUrl,
                createdAt: r.createdAt.toISOString()
            }))
        }
    } catch (error) {
        console.error('Failed to get reviews:', error)
        return { success: false, error: 'Failed to load reviews' }
    }
}

// --- GET MECHANIC STATS (for dashboard) ---

export async function getMechanicStats(userId: string) {
    try {
        const profile = await prisma.mechanicProfile.findFirst({
            where: { userId }
        })

        if (!profile) {
            return { success: false, error: 'Profile not found' }
        }

        // Get contact count (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const contactsLast30Days = await prisma.contactEvent.count({
            where: {
                mechanicId: profile.id,
                createdAt: { gte: thirtyDaysAgo }
            }
        })

        // Get total contacts
        const totalContacts = await prisma.contactEvent.count({
            where: { mechanicId: profile.id }
        })

        // Get review stats
        const reviewStats = await prisma.review.aggregate({
            where: { targetId: userId },
            _avg: { rating: true },
            _count: { rating: true }
        })

        return {
            success: true,
            stats: {
                totalJobs: profile.totalJobs,
                avgRating: reviewStats._avg.rating || 0,
                reviewCount: reviewStats._count.rating || 0,
                totalContacts,
                contactsLast30Days,
                yearsActive: profile.yearsExperience
            }
        }
    } catch (error) {
        console.error('Failed to get mechanic stats:', error)
        return { success: false, error: 'Failed to load stats' }
    }
}
