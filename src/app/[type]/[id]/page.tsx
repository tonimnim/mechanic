import { getListingDetails } from '@/app/actions';
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Star, BadgeCheck, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { MessageButton } from '@/components/MessageButton';

interface PageProps {
  params: Promise<{
    type: string;
    id: string;
  }>
}

export default async function ListingDetailsPage({ params }: PageProps) {
  const { type, id } = await params;

  // Validate type
  if (type !== 'mechanic' && type !== 'shop') {
    notFound();
  }

  const details = await getListingDetails(id, type as 'mechanic' | 'shop');

  if (!details) {
    notFound();
  }

  const isMechanic = type === 'mechanic';

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-4">
        <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </Link>
        <span className="font-semibold text-slate-900 truncate">
          {details.name}
        </span>
      </div>

      {/* Hero / Profile Section */}
      <div className="relative h-48 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        {/* Abstract Background pattern or Placeholder Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-60" />

        <div className="absolute -bottom-12 left-4 z-20 flex items-end">
          <div className="w-24 h-24 rounded-xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
            <div className={`text-4xl font-bold ${isMechanic ? 'text-blue-600' : 'text-orange-600'}`}>
              {details.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Details Content */}
      <div className="mt-14 px-4 space-y-6">

        {/* Title Block */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{details.name}</h1>
            {details.isVerified && (
              <BadgeCheck className="text-blue-500 fill-blue-50 w-6 h-6" />
            )}
          </div>
          <p className="text-slate-500 font-medium">{details.subtitle}</p>

          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md font-medium">
              <Star size={14} fill="currentColor" />
              <span>{details.rating}</span>
              <span className="text-slate-400 font-normal">(12 reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <MapPin size={14} />
              <span>{details.location}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <MessageButton recipientId={details.id} recipientName={details.name} />

          <Button variant="outline" className="w-full gap-2 border-slate-300" size="lg">
            <MapPin size={18} />
            Directions
          </Button>
        </div>

        {/* About Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-lg">About</h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            {details.description || "No description provided."}
          </p>

          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Clock className="text-slate-400" size={20} />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Availability</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{details.availability}</p>
              </div>
            </div>

            {details.isVerified && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <ShieldCheck className="text-blue-500" size={20} />
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase">Verified Partner</p>
                  <p className="text-sm text-blue-800">Identity and skills verified.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location (Placeholder for Map) */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-lg">Location</h3>
          <div className="bg-slate-100 h-40 rounded-xl flex items-center justify-center border border-slate-200">
            <p className="text-slate-400 flex items-center gap-2">
              <MapPin /> Map View Loading...
            </p>
          </div>
          <p className="text-sm text-slate-500">{details.address}, {details.location}</p>
        </div>

      </div>
    </div>
  );
}
