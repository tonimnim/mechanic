import { getMechanics } from '@/app/actions';
import { FindView } from '@/components/FindView';

export const dynamic = 'force-dynamic';

export default async function FindPage() {
    const mechanicsData = await getMechanics();

    return <FindView mechanicsData={mechanicsData} />;
}
