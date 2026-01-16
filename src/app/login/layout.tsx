import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Login to eGarage",
    description: "Sign in to your eGarage account. Access your mechanic dashboard, chat with clients, manage bookings, and track your business growth.",
    keywords: [
        "eGarage login",
        "mechanic login Kenya",
        "auto repair dashboard",
        "mechanic account Kenya"
    ],
    openGraph: {
        title: "Login | eGarage Kenya",
        description: "Sign in to access your eGarage dashboard and connect with mechanics or clients.",
        url: "https://egarage.ke/login",
    },
    alternates: {
        canonical: "/login"
    },
    robots: {
        index: false, // Don't index login pages
        follow: true
    }
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
