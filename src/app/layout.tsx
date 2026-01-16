import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { MechanicDashboardProvider } from "@/lib/mechanic-dashboard-context";
import { ChatsDataProvider } from "@/lib/chats-data-context";
import { BottomNav } from "@/components/BottomNav";
import { TopNav } from "@/components/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Core metadata
  title: {
    default: "eGarage Kenya - Find Trusted Mechanics Near You | 24/7 Roadside Assistance",
    template: "%s | eGarage Kenya"
  },
  description: "Find verified mechanics and breakdown services near you in Kenya. Connect with trusted auto repair professionals for engine repair, towing, battery service, tire changes & more. 24/7 emergency roadside assistance in Nairobi, Mombasa, Kisumu, Nakuru & across Kenya.",

  // Extensive keywords for search
  keywords: [
    // Primary keywords
    "mechanic near me",
    "mechanic near me Kenya",
    "mobile mechanic Kenya",
    "roadside assistance Kenya",
    "breakdown service Kenya",
    "car repair Kenya",
    "auto mechanic Nairobi",

    // Location-based keywords
    "mechanic Nairobi",
    "mechanic Mombasa",
    "mechanic Kisumu",
    "mechanic Nakuru",
    "mechanic Eldoret",
    "car repair Nairobi",
    "auto repair Mombasa",
    "vehicle repair Kenya",

    // Service-specific keywords
    "emergency towing Kenya",
    "battery jump start",
    "tire change service",
    "engine repair Kenya",
    "brake repair Kenya",
    "oil change Kenya",
    "car service Kenya",
    "vehicle maintenance Kenya",

    // Long-tail keywords
    "find mechanic near me now",
    "24 hour mechanic Kenya",
    "trusted mechanics Kenya",
    "verified mechanics Kenya",
    "best mechanics Nairobi",
    "affordable car repair Kenya",
    "mobile car repair service",
    "on-site vehicle repair",

    // Action keywords
    "book mechanic online",
    "hire mechanic Kenya",
    "call mechanic Kenya",
    "emergency car repair",

    // Brand
    "eGarage",
    "eGarage Kenya"
  ],

  // Author and site info
  authors: [{ name: "eGarage Kenya" }],
  creator: "eGarage Kenya",
  publisher: "eGarage Kenya",

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical and base URL
  metadataBase: new URL("https://egarage.ke"),
  alternates: {
    canonical: "/",
  },

  // Open Graph for Facebook/LinkedIn
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://egarage.ke",
    siteName: "eGarage Kenya",
    title: "eGarage Kenya - Find Trusted Mechanics Near You",
    description: "Connect with verified mechanics and breakdown services in Kenya. 24/7 roadside assistance, engine repair, towing, and more. Get help anytime, anywhere.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "eGarage Kenya - Find Trusted Mechanics",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "eGarage Kenya - Find Trusted Mechanics Near You",
    description: "Connect with verified mechanics and breakdown services in Kenya. 24/7 roadside assistance available.",
    images: ["/og-image.png"],
    creator: "@egarage_ke",
  },

  // Icons
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },

  // App-specific
  manifest: "/manifest.json",

  // Verification (add your actual codes)
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-code",
    // bing: "your-bing-code",
  },

  // Category
  category: "Automotive Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <AuthProvider>
          <MechanicDashboardProvider>
            <ChatsDataProvider>
              <TopNav />
              <div className="pb-16 md:pb-0"> {/* Padding for Bottom Nav only on mobile */}
                {children}
              </div>
              <BottomNav />
            </ChatsDataProvider>
          </MechanicDashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

