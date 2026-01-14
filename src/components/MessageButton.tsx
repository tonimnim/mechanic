'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MessageButtonProps {
  recipientId: string;
  recipientName: string;
}

export function MessageButton({ recipientId, recipientName }: MessageButtonProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      // 1. Guest: Redirect to login with return URL
      // We encode the current path to return here after login
      const currentPath = window.location.pathname;
      router.push(`/login?next=${encodeURIComponent(currentPath)}`);
    } else {
      // 2. User: Start Chat
      // For now, we'll just alert. Next step is to create the Chat Room.
      alert(`Starting secure chat with ${recipientName}...`);
      // Future: router.push(`/chats/new?to=${recipientId}`);
    }
  };

  return (
    <Button 
      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95" 
      size="lg"
      onClick={handleClick}
    >
       <MessageCircle size={18} />
       Message
    </Button>
  );
}
