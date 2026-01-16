'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface UpdateDriverProfileInput {
  fullName?: string;
  phone?: string;
}

interface UploadAvatarResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

interface UpdateProfileResult {
  success: boolean;
  user?: {
    id: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  error?: string;
}

/**
 * Update driver profile (name, phone)
 */
export async function updateDriverProfile(
  userId: string,
  updates: UpdateDriverProfileInput
): Promise<UpdateProfileResult> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Build update data, only including provided fields
    const updateData: { fullName?: string; phone?: string } = {};

    if (updates.fullName !== undefined && updates.fullName.trim()) {
      updateData.fullName = updates.fullName.trim();
    }

    if (updates.phone !== undefined) {
      updateData.phone = updates.phone.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No valid fields to update' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating driver profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

/**
 * Upload avatar image to Supabase storage and update user profile
 */
export async function uploadAvatar(
  userId: string,
  formData: FormData
): Promise<UploadAvatarResult> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const file = formData.get('avatar') as File;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File too large. Maximum size is 5MB.' };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { success: false, error: 'Failed to upload image' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update user profile with new avatar URL
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return { success: true, avatarUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { success: false, error: 'Failed to upload avatar' };
  }
}

/**
 * Delete user's avatar from storage and clear from profile
 */
export async function deleteAvatar(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (user?.avatarUrl) {
      const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

      // Extract file path from URL
      const urlParts = user.avatarUrl.split('/avatars/');
      if (urlParts.length > 1) {
        const filePath = `avatars/${urlParts[1]}`;
        await supabase.storage.from('avatars').remove([filePath]);
      }
    }

    // Clear avatar URL in database
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return { success: false, error: 'Failed to delete avatar' };
  }
}

/**
 * Get driver profile
 */
export async function getDriverProfile(userId: string) {
  try {
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    return null;
  }
}
