import { getMechanics } from './actions';
import { HomeView } from '@/components/HomeView';

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh data

export default async function Page() {
  // Fetch mechanics for the mobile PWA view
  const mechanicsData = await getMechanics();

  return (
    <HomeView mechanicsData={mechanicsData} />
  );
}