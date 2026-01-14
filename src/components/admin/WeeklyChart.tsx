'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis } from 'recharts';
import { LucideIcon } from 'lucide-react';

interface ChartDataPoint {
    day: string;
    [key: string]: string | number;
}

interface LineConfig {
    dataKey: string;
    color: string;
    label: string;
}

interface WeeklyChartProps {
    title: string;
    icon: LucideIcon;
    iconColor: string;
    total: number;
    data: ChartDataPoint[];
    lines: LineConfig[];
    showLegend?: boolean;
}

export function WeeklyChart({
    title,
    icon: Icon,
    iconColor,
    total,
    data,
    lines,
    showLegend = false
}: WeeklyChartProps) {
    // Build chart config dynamically
    const chartConfig = lines.reduce((acc, line) => {
        acc[line.dataKey] = {
            label: line.label,
            color: line.color,
        };
        return acc;
    }, {} as ChartConfig);

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                        <CardTitle className="text-white text-sm font-medium">{title}</CardTitle>
                    </div>
                    <span className="text-lg font-semibold text-white">{total}</span>
                </div>
                {showLegend && (
                    <div className="flex gap-4 mt-1">
                        {lines.map(line => (
                            <span key={line.dataKey} className="text-xs text-slate-400 flex items-center gap-1">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: line.color }}
                                ></span>
                                {line.label}
                            </span>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent className="pt-2">
                <ChartContainer config={chartConfig} className="h-[160px] w-full">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <XAxis
                            dataKey="day"
                            stroke="#475569"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#475569"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {lines.map(line => (
                            <Line
                                key={line.dataKey}
                                type="monotone"
                                dataKey={line.dataKey}
                                stroke={line.color}
                                strokeWidth={2}
                                dot={{ fill: line.color, strokeWidth: 0, r: 3 }}
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
