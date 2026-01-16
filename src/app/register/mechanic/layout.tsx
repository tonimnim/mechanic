import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Register as Mechanic - Join eGarage Kenya",
    description: "Join Kenya's fastest-growing automotive platform. Create your mechanic profile, get verified, and connect with clients directly. Free listing, verified badge, M-Pesa payments.",
    keywords: [
        "register as mechanic Kenya",
        "join mechanic platform",
        "mechanic registration Kenya",
        "list your garage Kenya",
        "mechanic business Kenya",
        "auto repair business registration",
        "become mechanic eGarage",
        "mechanic partnership Kenya"
    ],
    openGraph: {
        title: "Become a Verified Mechanic | eGarage Kenya",
        description: "Join eGarage and grow your auto repair business. Get direct client access, verified badge, and secure payments.",
        url: "https://egarage.ke/register/mechanic",
    },
    alternates: {
        canonical: "/register/mechanic"
    }
};

export default function MechanicRegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
