'use server'

import { PrismaClient } from '@prisma/client'

// Prisma singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Simple password hashing (for demo - use bcrypt in production)
function hashPassword(password: string): string {
    // Simple hash for demo - replace with bcrypt
    return Buffer.from(password).toString('base64')
}

function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash
}

// --- TYPES ---

export type LoginResult = {
    success: boolean
    user?: {
        id: string
        email: string
        phone: string
        fullName: string
        role: string
        isVerified: boolean
        avatarUrl: string | null
    }
    error?: string
}

// --- LOGIN ---

export async function loginWithPhone(phone: string, password: string): Promise<LoginResult> {
    try {
        // Find user by phone
        const user = await prisma.user.findUnique({
            where: { phone },
            include: {
                mechanicProfile: true,
                shopProfile: true
            }
        })

        if (!user) {
            return { success: false, error: 'No account found with this phone number' }
        }

        // For now, since we don't have password in schema, we'll accept any password
        // TODO: Add passwordHash field to User model and verify properly
        // In production: if (!verifyPassword(password, user.passwordHash)) { ... }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
                isVerified: user.isVerified,
                avatarUrl: user.avatarUrl
            }
        }
    } catch (error) {
        console.error('Login failed:', error)
        return { success: false, error: 'Login failed. Please try again.' }
    }
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                mechanicProfile: true,
                shopProfile: true
            }
        })

        if (!user) {
            return { success: false, error: 'No account found with this email' }
        }

        // For now, accept any password (add proper validation later)
        // TODO: Add passwordHash field and verify

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
                isVerified: user.isVerified,
                avatarUrl: user.avatarUrl
            }
        }
    } catch (error) {
        console.error('Login failed:', error)
        return { success: false, error: 'Login failed. Please try again.' }
    }
}

// --- CHECK IF USER EXISTS ---

export async function checkUserExists(phoneOrEmail: string): Promise<{ exists: boolean; method: 'phone' | 'email' | null }> {
    try {
        // Check if it's an email or phone
        const isEmail = phoneOrEmail.includes('@')

        if (isEmail) {
            const user = await prisma.user.findUnique({ where: { email: phoneOrEmail } })
            return { exists: !!user, method: user ? 'email' : null }
        } else {
            const user = await prisma.user.findUnique({ where: { phone: phoneOrEmail } })
            return { exists: !!user, method: user ? 'phone' : null }
        }
    } catch {
        return { exists: false, method: null }
    }
}

// --- CHECK IF PHONE OR EMAIL EXISTS (for registration pre-check) ---

export async function checkPhoneAndEmailExist(
    phone: string,
    email: string
): Promise<{ phoneExists: boolean; emailExists: boolean }> {
    try {
        const [userByPhone, userByEmail] = await Promise.all([
            prisma.user.findUnique({ where: { phone } }),
            prisma.user.findUnique({ where: { email } })
        ])
        return {
            phoneExists: !!userByPhone,
            emailExists: !!userByEmail
        }
    } catch {
        return { phoneExists: false, emailExists: false }
    }
}



// --- GET USER PROFILE (Synced with Supabase) ---

export async function getUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }, // Assumes userId matches Supabase ID
            include: {
                mechanicProfile: true,
                shopProfile: true
            }
        })

        if (!user) return null

        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            fullName: user.fullName,
            role: user.role,
            isVerified: user.isVerified,
            avatarUrl: user.avatarUrl,
            mechanicProfileId: user.mechanicProfile?.id
        }
    } catch {
        return null
    }
}

// --- SYNC USER FROM SUPABASE METADATA ---
// Creates local user profile if it exists in Supabase but not locally

export async function syncUserFromSupabase(
    userId: string,
    metadata: {
        email?: string;
        full_name?: string;
        phone?: string;
        role?: string;
    }
): Promise<{ success: boolean; user?: ReturnType<typeof getUserProfile> extends Promise<infer T> ? T : never }> {
    try {
        // Check if user already exists by ID
        const existingUser = await prisma.user.findUnique({ where: { id: userId } })
        if (existingUser) {
            return { success: true, user: await getUserProfile(userId) }
        }

        // Check if user exists by email (different ID but same email)
        if (metadata.email) {
            const userByEmail = await prisma.user.findUnique({ where: { email: metadata.email } })
            if (userByEmail) {
                // Update the existing user's ID to match Supabase
                await prisma.user.update({
                    where: { email: metadata.email },
                    data: { id: userId }
                })
                console.log(`Updated existing user ${metadata.email} to Supabase ID ${userId}`)
                return { success: true, user: await getUserProfile(userId) }
            }
        }

        // Check if phone already exists (different user)
        if (metadata.phone) {
            const userByPhone = await prisma.user.findUnique({ where: { phone: metadata.phone } })
            if (userByPhone) {
                // Phone exists with different email - update that user's ID
                await prisma.user.update({
                    where: { phone: metadata.phone },
                    data: {
                        id: userId,
                        email: metadata.email || userByPhone.email,
                        fullName: metadata.full_name || userByPhone.fullName
                    }
                })
                console.log(`Updated existing user with phone ${metadata.phone} to Supabase ID ${userId}`)
                return { success: true, user: await getUserProfile(userId) }
            }
        }

        // Generate unique phone if not provided or if we need a fallback
        const phone = metadata.phone || `+254${Date.now().toString().slice(-9)}`

        // Create user from Supabase metadata
        const newUser = await prisma.user.create({
            data: {
                id: userId,
                email: metadata.email || `${userId}@placeholder.com`,
                fullName: metadata.full_name || 'User',
                phone: phone,
                role: metadata.role || 'client',
                isVerified: false
            }
        })

        // If mechanic/breakdown, create mechanic profile
        if (newUser.role === 'mechanic' || newUser.role === 'breakdown') {
            await prisma.mechanicProfile.create({
                data: {
                    userId: newUser.id,
                    serviceType: newUser.role,
                    specialties: newUser.role === 'breakdown' ? 'Towing,Battery Jump' : 'General',
                    city: 'Nairobi',
                    address: 'TBD',
                    phone: newUser.phone,
                    lat: -1.2921,
                    lng: 36.8219
                }
            })
        }

        console.log(`Synced user ${userId} from Supabase to local DB`)
        return { success: true, user: await getUserProfile(userId) }
    } catch (error) {
        console.error('Failed to sync user from Supabase:', error)
        return { success: false }
    }
}


