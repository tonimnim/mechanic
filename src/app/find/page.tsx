import { Metadata } from 'next';
import { getMechanics } from '@/app/actions';
import { FindView } from '@/components/FindView';
import { generateServiceSchema } from '@/lib/seo-schema';

// Use ISR: cache page for 60 seconds, then revalidate in background
export const revalidate = 60;

// SEO Metadata for Find Mechanics page
export const metadata: Metadata = {
    title: "Find Mechanics Near You",
    description: "Search and connect with verified mechanics in Kenya. Browse by location, specialty, ratings & availability. Engine repair, towing, battery service, tire changes & more in Nairobi, Mombasa, Kisumu.",
    keywords: [
        "find mechanic near me",
        "mechanic search Kenya",
        "auto repair near me",
        "car mechanic Nairobi",
        "mobile mechanic Mombasa",
        "vehicle repair Kisumu",
        "engine repair near me",
        "brake service Kenya",
        "oil change near me",
        "best mechanics Kenya"
    ],
    openGraph: {
        title: "Find Verified Mechanics Near You | eGarage Kenya",
        description: "Search and connect with trusted mechanics in Kenya. Browse profiles, check ratings, and chat directly.",
        url: "https://egarage.ke/find",
    },
    alternates: {
        canonical: "/find"
    }
};

export default async function FindPage() {
    const mechanicsData = await getMechanics();

    // Service schema for this page
    const serviceSchema = generateServiceSchema({
        name: "Mobile Mechanic Services",
        description: "Find and connect with verified mobile mechanics across Kenya for all your auto repair needs",
        provider: "eGarage Kenya",
        areaServed: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
        serviceType: "Automotive Repair"
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(serviceSchema).replace(/</g, '\\u003c')
                }}
            />
            <FindView mechanicsData={mechanicsData} />
        </>
    );
}
