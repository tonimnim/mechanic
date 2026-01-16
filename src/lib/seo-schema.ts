// JSON-LD Structured Data for SEO
// Helps search engines understand the content and enables rich snippets

export interface LocalBusinessData {
    name: string;
    description: string;
    url: string;
    logo: string;
    telephone?: string;
    email?: string;
    address?: {
        streetAddress?: string;
        addressLocality: string;
        addressRegion: string;
        addressCountry: string;
    };
    geo?: {
        latitude: number;
        longitude: number;
    };
    openingHours?: string[];
    priceRange?: string;
    areaServed?: string[];
}

export interface ServiceData {
    name: string;
    description: string;
    provider: string;
    areaServed: string[];
    serviceType: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

// Generate LocalBusiness schema for eGarage
export function generateLocalBusinessSchema(): object {
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://egarage.ke/#organization",
        "name": "eGarage Kenya",
        "alternateName": "eGarage",
        "description": "Kenya's trusted platform for finding verified mechanics and roadside assistance services. Connect with professional auto repair technicians near you.",
        "url": "https://egarage.ke",
        "logo": "https://egarage.ke/logo.jpg",
        "image": "https://egarage.ke/og-image.png",
        "telephone": "+254700000000",
        "email": "support@egarage.ke",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Nairobi",
            "addressRegion": "Nairobi County",
            "addressCountry": "KE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -1.2921,
            "longitude": 36.8219
        },
        "areaServed": [
            { "@type": "City", "name": "Nairobi" },
            { "@type": "City", "name": "Mombasa" },
            { "@type": "City", "name": "Kisumu" },
            { "@type": "City", "name": "Nakuru" },
            { "@type": "City", "name": "Eldoret" },
            { "@type": "City", "name": "Thika" },
            { "@type": "City", "name": "Kiambu" },
            { "@type": "Country", "name": "Kenya" }
        ],
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
            }
        ],
        "priceRange": "$$",
        "sameAs": [
            "https://facebook.com/egarage.ke",
            "https://twitter.com/egarage_ke",
            "https://instagram.com/egarage.ke"
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Automotive Services",
            "itemListElement": [
                {
                    "@type": "OfferCatalog",
                    "name": "Mechanic Services",
                    "itemListElement": [
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Engine Repair" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Brake Repair" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Oil Change" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AC Repair" } }
                    ]
                },
                {
                    "@type": "OfferCatalog",
                    "name": "Breakdown Services",
                    "itemListElement": [
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Emergency Towing" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Battery Jump Start" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Tire Change" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Fuel Delivery" } }
                    ]
                }
            ]
        }
    };
}

// Generate WebSite schema for search features
export function generateWebSiteSchema(): object {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "eGarage Kenya",
        "alternateName": "eGarage",
        "url": "https://egarage.ke",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://egarage.ke/find?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };
}

// Generate FAQ schema
export function generateFAQSchema(faqItems: FAQItem[]): object {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };
}

// Generate Service schema for individual services
export function generateServiceSchema(service: ServiceData): object {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.name,
        "description": service.description,
        "provider": {
            "@type": "LocalBusiness",
            "name": service.provider,
            "url": "https://egarage.ke"
        },
        "areaServed": service.areaServed.map(area => ({
            "@type": "City",
            "name": area
        })),
        "serviceType": service.serviceType
    };
}

// Generate BreadcrumbList schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]): object {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

// Pre-defined FAQ for homepage
export const homepageFAQ: FAQItem[] = [
    {
        question: "How do I find a mechanic near me in Kenya?",
        answer: "Simply visit eGarage.ke and browse our list of verified mechanics. You can filter by location, specialty, and availability. Our platform shows mechanics near your location in Nairobi, Mombasa, Kisumu, and across Kenya."
    },
    {
        question: "Is eGarage available 24/7 for emergencies?",
        answer: "Yes! eGarage connects you with mechanics and breakdown service providers who offer 24/7 emergency assistance. Whether you need a tow truck, battery jump start, or tire change at 2am, our platform helps you find help fast."
    },
    {
        question: "How do I know if a mechanic is trustworthy?",
        answer: "All mechanics on eGarage go through a verification process. Look for the verified badge on mechanic profiles. You can also check ratings and reviews from other customers before choosing a mechanic."
    },
    {
        question: "What services do mechanics on eGarage offer?",
        answer: "Our mechanics offer a wide range of services including engine repair, brake service, oil changes, AC repair, electrical diagnostics, suspension work, and more. Breakdown specialists offer towing, battery jump starts, tire changes, and fuel delivery."
    },
    {
        question: "How do I pay for mechanic services?",
        answer: "You can pay securely via M-Pesa through the eGarage platform. Discuss pricing with your chosen mechanic through our in-app chat before booking, and pay only when the work is complete."
    },
    {
        question: "Can I chat with a mechanic before booking?",
        answer: "Yes! eGarage has built-in chat functionality. You can message mechanics directly to discuss your car issues, get quotes, and agree on terms before booking any service."
    }
];
