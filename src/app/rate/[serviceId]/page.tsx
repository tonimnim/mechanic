import { RateExperienceView } from '@/components/RateExperienceView';

export const dynamic = 'force-dynamic';

// Mock service data - in production this would come from database
// based on the serviceId parameter
async function getServiceDetails(serviceId: string) {
    // Mock data - will be replaced with actual database query
    return {
        mechanicName: 'Samuel Mwangi',
        mechanicInitials: 'SM',
        specialty: 'Engine Specialist',
        completedAt: '2:45 PM',
        duration: '45 min',
        serviceCost: 2500,
        responseTime: '12 min',
        distance: '0.8 km',
    };
}

interface PageProps {
    params: Promise<{ serviceId: string }>;
}

export default async function RateExperiencePage({ params }: PageProps) {
    const { serviceId } = await params;
    const serviceSummary = await getServiceDetails(serviceId);

    return <RateExperienceView serviceSummary={serviceSummary} />;
}
