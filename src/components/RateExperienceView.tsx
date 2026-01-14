'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Service summary type
interface ServiceSummary {
    mechanicName: string;
    mechanicInitials: string;
    specialty: string;
    completedAt: string;
    duration: string;
    serviceCost: number;
    responseTime: string;
    distance: string;
}

// Feedback tags
const FEEDBACK_TAGS = [
    'Quick Response',
    'Professional',
    'Fair Pricing',
    'Quality Work',
    'Good Communication',
    'On Time',
];

// Generate consistent color from name
function getAvatarColor(name: string): string {
    const colors = [
        'bg-slate-900',
        'bg-blue-600',
        'bg-emerald-600',
        'bg-violet-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

interface RateExperienceViewProps {
    serviceSummary: ServiceSummary;
}

export function RateExperienceView({ serviceSummary }: RateExperienceViewProps) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        // TODO: Submit review to database
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSubmitting(false);
        router.back();
    };

    const avatarColor = getAvatarColor(serviceSummary.mechanicName);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900">
                <div className="max-w-lg mx-auto px-4 py-5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <h1 className="font-semibold text-lg text-white">Rate Your Experience</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
                {/* Service Summary Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    {/* Mechanic Info */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center`}>
                            <span className="text-white font-bold text-lg">{serviceSummary.mechanicInitials}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{serviceSummary.mechanicName}</h3>
                            <p className="text-gray-500 text-sm">{serviceSummary.specialty}</p>
                            <p className="text-gray-400 text-xs mt-0.5">Service completed at {serviceSummary.completedAt}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-500 text-xs">Duration</p>
                            <p className="font-bold text-gray-900 mt-0.5">{serviceSummary.duration}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-500 text-xs">Service Cost</p>
                            <p className="font-bold text-gray-900 mt-0.5">KES {serviceSummary.serviceCost.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-500 text-xs">Response Time</p>
                            <p className="font-bold text-gray-900 mt-0.5">{serviceSummary.responseTime}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-500 text-xs">Distance</p>
                            <p className="font-bold text-gray-900 mt-0.5">{serviceSummary.distance}</p>
                        </div>
                    </div>
                </div>

                {/* Rating Section */}
                <div>
                    <h2 className="font-bold text-xl text-gray-900">How was your experience?</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Your feedback helps other drivers and improves our service quality
                    </p>

                    {/* Star Rating */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="p-1 transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star
                                    size={40}
                                    className={`transition-colors ${star <= (hoveredRating || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback Tags */}
                <div>
                    <h3 className="font-semibold text-gray-900">What went well? (Select all that apply)</h3>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {FEEDBACK_TAGS.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag)
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </div>
    );
}
