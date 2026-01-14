// User Roles
export type UserRole = 'admin' | 'mechanic' | 'shop' | 'client';

// Availability Status for Mechanics
export type AvailabilityStatus = 'online' | 'busy' | 'offline';

// Location object (shared by mechanic and shop profiles)
export interface Location {
  city: string;
  address: string;
  lat: number;
  lng: number;
}

// 1. PROFILES (Base User - matches Prisma User model)
export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt: string; // ISO Date string
}

// 2. MECHANIC DETAILS (matches Prisma MechanicProfile)
export interface MechanicProfile extends Profile {
  role: 'mechanic';
  bio?: string | null;
  specialties: string[]; // Frontend array, stored as comma-separated in DB
  yearsExperience: number;
  location: Location;
  rating: number; // Calculated from reviews (0.0 to 5.0)
  reviewCount: number;
  availability: AvailabilityStatus;
}

// 3. SHOP DETAILS (matches Prisma ShopProfile)
export interface ShopProfile extends Profile {
  role: 'shop';
  shopName: string;
  description?: string | null;
  inventoryCategories: string[]; // Frontend array, stored as comma-separated in DB
  location: Location;
  rating: number;
  reviewCount: number;
}

// 4. CLIENT/CAR OWNER (Extension for clients)
export interface ClientProfile extends Profile {
  role: 'client';
  garage: Vehicle[];
}

// Sub-type: Vehicle (matches Prisma Vehicle model)
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber?: string | null;
}

// 5. CHAT SYSTEM (matches Prisma Conversation/Message models)
export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  subject?: string | null;
  lastMessageAt: string;
  unreadCount: number; // Calculated on frontend
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

// 6. REVIEWS (matches Prisma Review model)
export interface Review {
  id: string;
  authorId: string;
  targetId: string;
  rating: number; // 1-5
  comment?: string | null;
  createdAt: string;
}

// --- HELPER FUNCTIONS ---

/**
 * Convert comma-separated string from DB to array for frontend
 */
export function parseCommaSeparated(value: string): string[] {
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Convert array to comma-separated string for DB storage
 */
export function toCommaSeparated(arr: string[]): string {
  return arr.join(',');
}
