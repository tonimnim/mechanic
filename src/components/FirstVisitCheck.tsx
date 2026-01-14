'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface FirstVisitCheckProps {
    children: React.ReactNode;
}

export function FirstVisitCheck({ children }: FirstVisitCheckProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [hasVisited, setHasVisited] = useState(false);

    useEffect(() => {
        // Check if user has visited before
        const visited = localStorage.getItem('mf_has_visited');

        if (!visited) {
            // First visit - redirect to welcome
            router.replace('/welcome');
        } else {
            setHasVisited(true);
        }
        setIsChecking(false);
    }, [router]);

    // Show nothing while checking
    if (isChecking) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If hasn't visited, the redirect will happen
    if (!hasVisited) {
        return null;
    }

    return <>{children}</>;
}

// Mark that user has made their choice
export function markAsVisited() {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mf_has_visited', 'true');
    }
}
