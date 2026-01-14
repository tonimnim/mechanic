import { getMechanics } from './actions';
import { HomeView } from '@/components/HomeView';

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh data

export default async function Page() {
  // Fetch only mechanics for the mobile PWA view
  // Desktop view (WebMarketplace) uses its own mock data for now
  const mechanicsData = await getMechanics();

  return (
    <HomeView mechanicsData={mechanicsData} />
  );
}