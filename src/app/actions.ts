'use server'

import { PrismaClient } from '@prisma/client'
import { unstable_cache } from 'next/cache'

// Prisma singleton pattern to prevent connection pool exhaustion in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// --- TYPES ---

export type MechanicResult = {
  id: string
  visibleId: string // MechanicProfile ID for contact logging
  type: 'mechanic'
  name: string
  subtitle: string // Specialties
  location: string
  lat: number | null
  lng: number | null
  phone: string
  isVerified: boolean
  rating: number
  avatarUrl: string | null
  availability: string
}

export type ShopResult = {
  id: string
  type: 'shop'
  name: string
  subtitle: string // Categories
  location: string
  isVerified: boolean
  rating: number
  avatarUrl: string | null
}

export type SearchResult = MechanicResult | ShopResult

export type ContactHistoryItem = {
  id: string
  mechanicId: string
  mechanicName: string
  mechanicInitials: string
  specialties: string
  method: 'call' | 'whatsapp' | 'chat'
  createdAt: string
  phone: string
}

// --- FETCH MECHANICS (CACHED) ---

const getMechanicsInternal = async (): Promise<MechanicResult[]> => {
  try {
    const mechanics = await prisma.mechanicProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })

    return mechanics.map(m => ({
      id: m.userId,
      visibleId: m.id,
      type: 'mechanic' as const,
      name: m.user.fullName,
      subtitle: m.specialties.split(',').map(s => s.trim()).join(', '),
      location: `${m.city} • ${m.address}`,
      lat: m.lat,
      lng: m.lng,
      phone: m.phone,
      isVerified: m.user.isVerified,
      rating: m.avgRating || 4.5,
      avatarUrl: m.user.avatarUrl,
      availability: m.availability
    }))
  } catch (error) {
    console.error('Failed to fetch mechanics:', error)
    return []
  }
}

// Cache mechanics list for 60 seconds
export const getMechanics = unstable_cache(
  getMechanicsInternal,
  ['mechanics-list'],
  { revalidate: 60, tags: ['mechanics'] }
)

// --- CONTACT LOGGING ---

export async function logContact(
  mechanicProfileId: string,
  method: 'call' | 'whatsapp' | 'chat',
  clientId?: string
) {
  try {
    // For MVP, use a default client ID if not logged in
    const effectiveClientId = clientId || 'client-1'

    await prisma.contactEvent.create({
      data: {
        mechanicId: mechanicProfileId,
        clientId: effectiveClientId,
        method,
      }
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to log contact:', error)
    return { success: false, error: 'Failed to log contact' }
  }
}

export async function getContactHistory(clientId?: string): Promise<ContactHistoryItem[]> {
  try {
    const effectiveClientId = clientId || 'client-1'

    const contacts = await prisma.contactEvent.findMany({
      where: { clientId: effectiveClientId },
      include: {
        mechanic: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 contacts
    })

    return contacts.map(c => ({
      id: c.id,
      mechanicId: c.mechanicId,
      mechanicName: c.mechanic.user.fullName,
      mechanicInitials: c.mechanic.user.fullName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      specialties: c.mechanic.specialties.split(',').map(s => s.trim()).join(', '),
      method: c.method as 'call' | 'whatsapp',
      createdAt: c.createdAt.toISOString(),
      phone: c.mechanic.phone,
    }))
  } catch (error) {
    console.error('Failed to get contact history:', error)
    return []
  }
}

export async function getListingDetails(id: string, type: 'mechanic' | 'shop') {
  if (type === 'mechanic') {
    const mech = await prisma.mechanicProfile.findFirst({
      where: { userId: id },
      include: { user: true }
    })
    if (!mech) return null
    return {
      id: mech.userId,
      type: 'mechanic' as const,
      name: mech.user.fullName,
      subtitle: mech.specialties.split(',').join(', '),
      description: mech.bio,
      location: mech.city,
      address: mech.address,
      isVerified: mech.user.isVerified,
      rating: 4.8,
      avatarUrl: mech.user.avatarUrl,
      availability: mech.availability
    }
  } else {
    const shop = await prisma.shopProfile.findFirst({
      where: { userId: id },
      include: { user: true }
    })
    if (!shop) return null
    return {
      id: shop.userId,
      type: 'shop' as const,
      name: shop.shopName,
      subtitle: shop.inventoryCategories.split(',').join(', '),
      description: shop.description,
      location: shop.city,
      address: shop.address,
      isVerified: shop.user.isVerified,
      rating: 4.5,
      avatarUrl: shop.user.avatarUrl,
      availability: 'online'
    }
  }
}

// --- PUSH NOTIFICATIONS ---

import webpush from 'web-push'

// Initialize VAPID only at runtime, not during build
let vapidInitialized = false
function initVapid() {
  if (vapidInitialized) return
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:anthony@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )
    vapidInitialized = true
  }
}

let subscription: webpush.PushSubscription | null = null

export async function subscribeUser(sub: webpush.PushSubscription) {
  subscription = sub
  // In a real app, save 'sub' to the Database User model
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // In a real app, remove 'sub' from the Database
  return { success: true }
}

export async function sendNotification(message: string) {
  initVapid()
  if (!subscription) {
    console.warn('No subscription found in memory.')
    return { success: false, error: 'No subscription' }
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'eGarage Update',
        body: message,
        icon: '/icon-192x192.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}
