import { getMechanics } from './actions';
import { HomeView } from '@/components/HomeView';
import {
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  homepageFAQ
} from '@/lib/seo-schema';

// Use ISR: cache page for 60 seconds, then revalidate in background
export const revalidate = 60;

export default async function Page() {
  // Fetch mechanics for the mobile PWA view
  const mechanicsData = await getMechanics();

  // Generate structured data for SEO
  const localBusinessSchema = generateLocalBusinessSchema();
  const webSiteSchema = generateWebSiteSchema();
  const faqSchema = generateFAQSchema(homepageFAQ);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c')
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema).replace(/</g, '\\u003c')
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c')
        }}
      />

      <HomeView mechanicsData={mechanicsData} />
    </>
  );
}