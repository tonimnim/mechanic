import { Wrench, MapPin, Star, BadgeCheck, Circle } from 'lucide-react';
import type { MechanicResult } from '@/app/actions';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ListingCardProps {
  item: MechanicResult;
}

export function ListingCard({ item }: ListingCardProps) {
  // Availability status indicator
  const availabilityColors = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-slate-400'
  };

  const availabilityColor = availabilityColors[item.availability as keyof typeof availabilityColors] || availabilityColors.offline;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/50">
      <CardContent className="p-4 flex gap-4 items-center">
        {/* Icon / Avatar Placeholder */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
            <Wrench size={20} />
          </div>
          {/* Availability Indicator */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${availabilityColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 grid gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
            {item.isVerified && (
              <Badge variant="secondary" className="h-5 px-1.5 gap-1 text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200">
                <BadgeCheck className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500 font-medium">
              <Star size={12} fill="currentColor" />
              <span>{item.rating}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button size="sm" variant="outline" className="hidden sm:flex h-8">
          Contact
        </Button>
      </CardContent>
    </Card>
  );
}
