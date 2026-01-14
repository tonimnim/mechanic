'use client';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Hide TopNav and BottomNav for admin pages */}
            <style jsx global>{`
                #top-nav, .bottom-nav, nav[class*="fixed bottom"] {
                    display: none !important;
                }
            `}</style>
            {children}
        </>
    );
}
