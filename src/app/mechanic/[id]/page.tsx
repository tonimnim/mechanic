import { getMechanics } from '@/app/actions';
import { MechanicProfileView } from '@/components/MechanicProfileView';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function MechanicProfilePage({ params }: PageProps) {
    const { id } = await params;

    // Fetch all mechanics and find the one with matching ID
    const mechanics = await getMechanics();
    const mechanic = mechanics.find(m => m.id === id);

    if (!mechanic) {
        notFound();
    }

    return <MechanicProfileView mechanic={mechanic} />;
}
