'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MechanicCard } from '@/components/MechanicCard';
import type { MechanicResult } from '@/app/actions';

interface FindViewProps {
    mechanicsData: MechanicResult[];
}

// Fuse.js configuration
const fuseOptions = {
    keys: [
        { name: 'name', weight: 0.4 },
        { name: 'subtitle', weight: 0.3 },
        { name: 'location', weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
};

export function FindView({ mechanicsData }: FindViewProps) {
    const [query, setQuery] = useState('');
    const [availableOnly, setAvailableOnly] = useState(false);
    const [topRatedOnly, setTopRatedOnly] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Initialize Fuse.js
    const fuse = useMemo(() => new Fuse(mechanicsData, fuseOptions), [mechanicsData]);

    // Perform search and filter
    const results = useMemo(() => {
        let filtered = mechanicsData;

        // Text search
        if (query.trim().length >= 2) {
            const fuseResults = fuse.search(query);
            filtered = fuseResults.map(r => r.item);
        }

        // Available Now filter
        if (availableOnly) {
            filtered = filtered.filter(m => m.availability === 'online');
        }

        // Top Rated filter (4.5+)
        if (topRatedOnly) {
            filtered = filtered.filter(m => m.rating >= 4.5);
        }

        // Sort: Available first, then by rating
        filtered = [...filtered].sort((a, b) => {
            if (a.availability === 'online' && b.availability !== 'online') return -1;
            if (b.availability === 'online' && a.availability !== 'online') return 1;
            return b.rating - a.rating;
        });

        return filtered;
    }, [query, availableOnly, topRatedOnly, fuse, mechanicsData]);

    const hasFilters = availableOnly || topRatedOnly || query;

    const clearFilters = () => {
        setQuery('');
        setAvailableOnly(false);
        setTopRatedOnly(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900">
                <div className="max-w-lg mx-auto px-4 pt-4 pb-5">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Search mechanics, speciality, location..."
                            className="w-full pl-12 pr-12 h-14 bg-white text-gray-900 border-0 rounded-2xl text-base shadow-lg placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-3">
                    <div className="flex items-center gap-2">
                        {/* Available Now */}
                        <button
                            onClick={() => setAvailableOnly(!availableOnly)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${availableOnly
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${availableOnly ? 'bg-white' : 'bg-green-500'}`} />
                            Available
                        </button>

                        {/* Top Rated */}
                        <button
                            onClick={() => setTopRatedOnly(!topRatedOnly)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${topRatedOnly
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <span>⭐</span>
                            Top Rated
                        </button>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Advanced Filters */}
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`p-2.5 rounded-full transition-all ${showAdvanced
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <SlidersHorizontal size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-lg mx-auto px-4 pt-4">
                {/* Context Line */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {results.length} mechanic{results.length !== 1 ? 's' : ''} found
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} />
                            Nairobi • Sorted by availability
                        </p>
                    </div>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-orange-600 font-medium hover:text-orange-700"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Mechanics List */}
                <div className="space-y-3">
                    {results.length > 0 ? (
                        results.map((mechanic) => (
                            <MechanicCard key={mechanic.id} mechanic={mechanic} />
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-gray-900 font-semibold text-lg">No mechanics found</p>
                            <p className="text-gray-500 text-sm mt-1 mb-6">
                                Try adjusting your search or filters
                            </p>
                            <Button
                                onClick={clearFilters}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                Clear filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
