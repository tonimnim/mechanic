'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, MoreVertical, ImageIcon, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
    getConversationMessages,
    sendMessage,
    ChatMessage,
    ConversationDetails
} from '@/app/chat-actions';

// Generate consistent color from name
function getAvatarColor(name: string): string {
    const colors = [
        'bg-blue-600',
        'bg-emerald-600',
        'bg-violet-600',
        'bg-amber-600',
        'bg-rose-600',
        'bg-cyan-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

interface ChatPageProps {
    params: Promise<{ conversationId: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
    const { conversationId } = use(params);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [conversation, setConversation] = useState<ConversationDetails | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load conversation and messages
    useEffect(() => {
        async function loadMessages() {
            if (user?.id && conversationId) {
                const result = await getConversationMessages(user.id, conversationId);
                if (result.success) {
                    setConversation(result.conversation || null);
                    setMessages(result.messages || []);
                } else {
                    setError(result.error || 'Failed to load conversation');
                }
                setIsLoading(false);
            }
        }

        if (!authLoading && user) {
            loadMessages();
        } else if (!authLoading) {
            setError('Please log in to view this conversation');
            setIsLoading(false);
        }
    }, [user, authLoading, conversationId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time subscription for new messages
    useEffect(() => {
        if (!user?.id || !conversationId) return;

        const supabase = createClient();
        if (!supabase) return;

        // Subscribe to new messages in this conversation
        const channel = supabase
            .channel(`chat-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message',
                    filter: `conversationId=eq.${conversationId}`
                },
                (payload: { new: Record<string, unknown> }) => {
                    const newMsg = payload.new;

                    // Don't add if it's our own message (already added optimistically)
                    if (newMsg.senderId === user.id) return;

                    // Transform to ChatMessage format
                    const chatMessage: ChatMessage = {
                        id: newMsg.id as string,
                        senderId: newMsg.senderId as string,
                        content: newMsg.content as string | null,
                        imageUrl: newMsg.imageUrl as string | null,
                        messageType: (newMsg.messageType as string) || 'text',
                        createdAt: newMsg.createdAt as string,
                        isMe: false,
                        isRead: (newMsg.isRead as boolean) || false
                    };

                    // Add to messages if not already present
                    setMessages(prev => {
                        if (prev.some(m => m.id === chatMessage.id)) return prev;
                        return [...prev, chatMessage];
                    });
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, conversationId]);

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if ((!newMessage.trim() && !selectedImage) || isSending || !user?.id) return;

        setIsSending(true);

        // For now, just send text messages (image upload needs Supabase Storage integration)
        if (newMessage.trim()) {
            const result = await sendMessage(user.id, conversationId, newMessage.trim());

            if (result.success && result.message) {
                setMessages(prev => [...prev, result.message!]);
                setNewMessage('');
            }
        }

        // TODO: Handle image upload to Supabase Storage
        if (selectedImage) {
            // For now, create a temp message with preview
            const tempImageMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                senderId: user.id,
                imageUrl: imagePreview!,
                messageType: 'image',
                createdAt: new Date().toISOString(),
                isMe: true,
                isRead: false,
            };
            setMessages(prev => [...prev, tempImageMessage]);
            clearImage();
        }

        setIsSending(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Format message time for display
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="text-gray-500 mt-2">Loading conversation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-screen bg-gray-50 items-center justify-center p-4">
                <p className="text-red-500 text-center">{error}</p>
                <Button onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    if (!conversation) return null;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-slate-900 flex-shrink-0">
                <div className="max-w-lg mx-auto px-2 py-3">
                    <div className="flex items-center gap-2">
                        {/* Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>

                        {/* Avatar */}
                        <div className="relative">
                            {conversation.recipientAvatarUrl ? (
                                <img
                                    src={conversation.recipientAvatarUrl}
                                    alt={conversation.recipientName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className={`w-10 h-10 rounded-full ${getAvatarColor(conversation.recipientName)} flex items-center justify-center`}>
                                    <span className="text-white font-bold text-sm">{conversation.recipientInitials}</span>
                                </div>
                            )}
                            {conversation.isOnline && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
                            )}
                        </div>

                        {/* Name & Status */}
                        <div className="flex-1 min-w-0">
                            <h1 className="font-semibold text-white text-[15px] truncate">{conversation.recipientName}</h1>
                            <p className="text-xs text-gray-400">
                                {conversation.isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>

                        {/* Actions */}
                        {conversation.recipientPhone && (
                            <button
                                onClick={() => window.location.href = `tel:${conversation.recipientPhone}`}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <Phone className="w-5 h-5 text-white" />
                            </button>
                        )}
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <MoreVertical className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-lg mx-auto space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No messages yet. Say hello! 👋
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl overflow-hidden ${message.isMe
                                        ? 'bg-orange-500 text-white rounded-br-md'
                                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                                        } ${message.messageType === 'image' ? 'p-1' : 'px-4 py-2.5'}`}
                                >
                                    {/* Image Message */}
                                    {message.messageType === 'image' && message.imageUrl && (
                                        <div className="relative">
                                            <img
                                                src={message.imageUrl}
                                                alt="Shared image"
                                                className="rounded-xl max-w-full h-auto"
                                                style={{ maxHeight: '300px' }}
                                            />
                                            <p className={`text-[10px] mt-1 px-2 pb-1 ${message.isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Text Message */}
                                    {message.messageType === 'text' && message.content && (
                                        <>
                                            <p className="text-[15px] leading-relaxed">{message.content}</p>
                                            <p className={`text-[10px] mt-1 ${message.isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="bg-white border-t border-gray-200 px-4 py-2">
                    <div className="max-w-lg mx-auto">
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Selected"
                                className="h-20 rounded-lg object-cover"
                            />
                            <button
                                onClick={clearImage}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 flex-shrink-0 pb-safe">
                <div className="max-w-lg mx-auto px-4 py-3">
                    <div className="flex items-center gap-2">
                        {/* Image Button */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>

                        <Input
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 border-gray-200 rounded-full px-4"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={(!newMessage.trim() && !selectedImage) || isSending}
                            className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 p-0"
                        >
                            {isSending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
