'use client';

import { Card } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    highlight?: boolean;
}

export function StatCard({ title, value, icon, highlight = false }: StatCardProps) {
    return (
        <Card className={`bg-slate-900 border-slate-800 p-4 ${highlight ? 'border-orange-500/50' : ''}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500">{title}</p>
                    <p className="text-2xl font-semibold text-white mt-1">{value}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    {icon}
                </div>
            </div>
        </Card>
    );
}
