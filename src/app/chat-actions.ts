'use server'

import { PrismaClient } from '@prisma/client'

// Prisma singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// --- TYPES ---

export type ConversationPreview = {
    id: string
    recipientId: string
    recipientName: string
    recipientInitials: string
    recipientAvatarUrl?: string | null
    lastMessage?: string
    lastMessageTime?: string
    unreadCount: number
    isOnline?: boolean
}

export type ChatMessage = {
    id: string
    senderId: string
    content?: string | null
    imageUrl?: string | null
    messageType: string
    createdAt: string
    isMe: boolean
    isRead: boolean
}

export type ConversationDetails = {
    id: string
    recipientId: string
    recipientName: string
    recipientInitials: string
    recipientAvatarUrl?: string | null
    recipientPhone?: string
    isOnline?: boolean
}

// --- SECURITY: Verify user is a participant ---

async function isParticipant(userId: string, conversationId: string): Promise<boolean> {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: {
                some: { id: userId }
            }
        }
    })
    return !!conversation
}

// --- GET USER'S CONVERSATIONS ---

export async function getUserConversations(userId: string): Promise<{ success: boolean; conversations?: ConversationPreview[]; error?: string }> {
    if (!userId) {
        return { success: false, error: 'User ID required' }
    }

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: userId }
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        mechanicProfile: {
                            select: { availability: true }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        content: true,
                        imageUrl: true,
                        messageType: true,
                        createdAt: true,
                        isRead: true,
                        senderId: true
                    }
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        })

        // Count unread messages for each conversation
        const unreadCounts = await Promise.all(
            conversations.map(conv =>
                prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: userId },
                        isRead: false
                    }
                })
            )
        )

        const result: ConversationPreview[] = conversations.map((conv, index) => {
            // Get the other participant (recipient)
            const recipient = conv.participants.find(p => p.id !== userId) || conv.participants[0]
            const lastMsg = conv.messages[0]
            const initials = recipient.fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

            return {
                id: conv.id,
                recipientId: recipient.id,
                recipientName: recipient.fullName,
                recipientInitials: initials,
                recipientAvatarUrl: recipient.avatarUrl,
                lastMessage: lastMsg?.messageType === 'image' ? '📷 Photo' : lastMsg?.content || '',
                lastMessageTime: lastMsg ? formatMessageTime(lastMsg.createdAt) : undefined,
                unreadCount: unreadCounts[index],
                isOnline: recipient.mechanicProfile?.availability === 'online'
            }
        })

        return { success: true, conversations: result }
    } catch (error) {
        console.error('Failed to get conversations:', error)
        return { success: false, error: 'Failed to load conversations' }
    }
}

// --- GET CONVERSATION MESSAGES (with authorization) ---

export async function getConversationMessages(
    userId: string,
    conversationId: string
): Promise<{ success: boolean; conversation?: ConversationDetails; messages?: ChatMessage[]; error?: string }> {
    if (!userId || !conversationId) {
        return { success: false, error: 'User ID and Conversation ID required' }
    }

    // SECURITY CHECK: Verify user is a participant
    const authorized = await isParticipant(userId, conversationId)
    if (!authorized) {
        console.warn(`Unauthorized access attempt: User ${userId} tried to access conversation ${conversationId}`)
        return { success: false, error: 'Access denied' }
    }

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        phone: true,
                        mechanicProfile: {
                            select: { availability: true, phone: true }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        senderId: true,
                        content: true,
                        imageUrl: true,
                        messageType: true,
                        createdAt: true,
                        isRead: true
                    }
                }
            }
        })

        if (!conversation) {
            return { success: false, error: 'Conversation not found' }
        }

        // Get recipient (other participant)
        const recipient = conversation.participants.find(p => p.id !== userId) || conversation.participants[0]
        const initials = recipient.fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

        const conversationDetails: ConversationDetails = {
            id: conversation.id,
            recipientId: recipient.id,
            recipientName: recipient.fullName,
            recipientInitials: initials,
            recipientAvatarUrl: recipient.avatarUrl,
            recipientPhone: recipient.mechanicProfile?.phone || recipient.phone,
            isOnline: recipient.mechanicProfile?.availability === 'online'
        }

        const messages: ChatMessage[] = conversation.messages.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            content: msg.content,
            imageUrl: msg.imageUrl,
            messageType: msg.messageType,
            createdAt: msg.createdAt.toISOString(),
            isMe: msg.senderId === userId,
            isRead: msg.isRead
        }))

        // Mark unread messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false
            },
            data: { isRead: true }
        })

        return { success: true, conversation: conversationDetails, messages }
    } catch (error) {
        console.error('Failed to get messages:', error)
        return { success: false, error: 'Failed to load messages' }
    }
}

// --- SEND MESSAGE (with authorization) ---

export async function sendMessage(
    userId: string,
    conversationId: string,
    content?: string,
    imageUrl?: string
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    if (!userId || !conversationId) {
        return { success: false, error: 'User ID and Conversation ID required' }
    }

    if (!content?.trim() && !imageUrl) {
        return { success: false, error: 'Message content or image required' }
    }

    // SECURITY CHECK: Verify user is a participant
    const authorized = await isParticipant(userId, conversationId)
    if (!authorized) {
        console.warn(`Unauthorized send attempt: User ${userId} tried to send to conversation ${conversationId}`)
        return { success: false, error: 'Access denied' }
    }

    try {
        const messageType = imageUrl ? 'image' : 'text'

        const message = await prisma.message.create({
            data: {
                senderId: userId,
                conversationId,
                content: content?.trim() || null,
                imageUrl: imageUrl || null,
                messageType,
                isRead: false
            }
        })

        // Update conversation's lastMessageAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        })

        return {
            success: true,
            message: {
                id: message.id,
                senderId: message.senderId,
                content: message.content,
                imageUrl: message.imageUrl,
                messageType: message.messageType,
                createdAt: message.createdAt.toISOString(),
                isMe: true,
                isRead: false
            }
        }
    } catch (error) {
        console.error('Failed to send message:', error)
        return { success: false, error: 'Failed to send message' }
    }
}

// --- START NEW CONVERSATION ---

export async function startConversation(
    userId: string,
    recipientId: string,
    initialMessage?: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
    if (!userId || !recipientId) {
        return { success: false, error: 'Both user IDs required' }
    }

    if (userId === recipientId) {
        return { success: false, error: 'Cannot start conversation with yourself' }
    }

    try {
        // Check if conversation already exists between these two users
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: recipientId } } }
                ]
            }
        })

        if (existingConversation) {
            // If there's an initial message, send it
            if (initialMessage?.trim()) {
                await sendMessage(userId, existingConversation.id, initialMessage)
            }
            return { success: true, conversationId: existingConversation.id }
        }

        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [{ id: userId }, { id: recipientId }]
                }
            }
        })

        // Send initial message if provided
        if (initialMessage?.trim()) {
            await prisma.message.create({
                data: {
                    senderId: userId,
                    conversationId: conversation.id,
                    content: initialMessage.trim(),
                    messageType: 'text',
                    isRead: false
                }
            })
        }

        return { success: true, conversationId: conversation.id }
    } catch (error) {
        console.error('Failed to start conversation:', error)
        return { success: false, error: 'Failed to start conversation' }
    }
}

// --- HELPER: Format message time ---

function formatMessageTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
