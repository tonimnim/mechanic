'use client';

import { 
  Filter, 
  ChevronDown, 
  ShieldCheck, 
  MapPin, 
  ShoppingCart,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

// --- MOCK PRODUCT DATA FOR ALIBABA LAYOUT ---
const MOCK_PRODUCTS = [
  {
    id: 1,
    title: "Genuine Toyota Land Cruiser V8 Brake Pads (Front & Rear) Set",
    price: "KSh 4,500 - 5,500",
    moq: "1 Set",
    image: "https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?auto=format&fit=crop&w=400&q=80",
    supplier: "Kirinyaga Road Spares",
    isVerified: true,
    rating: 4.8,
    years: 5,
    location: "Nairobi"
  },
  {
    id: 2,
    title: "Subaru Forester SG5 Headlights (Ex-Japan) - Pair",
    price: "KSh 12,000",
    moq: "1 Pair",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80",
    supplier: "Grogon Wheels",
    isVerified: false,
    rating: 4.2,
    years: 2,
    location: "Nairobi"
  },
  {
    id: 3,
    title: "Heavy Duty Shock Absorbers for Mitsubishi Fuso Fighter",
    price: "KSh 8,500 - 9,200",
    moq: "2 Pieces",
    image: "https://plus.unsplash.com/premium_photo-1661306437817-8ab34be91e0c?auto=format&fit=crop&w=400&q=80",
    supplier: "Mombasa Heavy Spares",
    isVerified: true,
    rating: 4.9,
    years: 10,
    location: "Mombasa"
  },
  {
    id: 4,
    title: "15-Inch Alloy Rims (5 Holes) - Silver Finish",
    price: "KSh 18,000",
    moq: "1 Set (4 pcs)",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=400&q=80",
    supplier: "Grogon Wheels",
    isVerified: false,
    rating: 4.0,
    years: 2,
    location: "Nairobi"
  },
  {
    id: 5,
    title: "Car Battery N70 Maintenance Free - 1 Year Warranty",
    price: "KSh 7,500",
    moq: "1 Piece",
    image: "https://images.unsplash.com/photo-1623122359487-17eb10ee7626?auto=format&fit=crop&w=400&q=80",
    supplier: "Battery King",
    isVerified: true,
    rating: 4.7,
    years: 4,
    location: "Nairobi"
  },
  {
    id: 6,
    title: "Full Engine Service Kit for Mazda Demio (Oil, Plugs, Filters)",
    price: "KSh 3,200",
    moq: "1 Kit",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=400&q=80",
    supplier: "Kirinyaga Road Spares",
    isVerified: true,
    rating: 4.8,
    years: 5,
    location: "Nairobi"
  },
  {
    id: 7,
    title: "Side Mirrors for Honda Fit (GP5) with Indicator",
    price: "KSh 3,500",
    moq: "1 Piece",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80",
    supplier: "Juja Spares",
    isVerified: false,
    rating: 3.8,
    years: 1,
    location: "Thika"
  },
  {
    id: 8,
    title: "Synthetic Engine Oil 5W-30 (4 Litres)",
    price: "KSh 4,200",
    moq: "1 Can",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80",
    supplier: "Total Station Road C",
    isVerified: true,
    rating: 5.0,
    years: 15,
    location: "Nairobi"
  }
];

export function WebMarketplace() {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Sub-Header (Breadcrumbs & Count) */}
      <div className="border-b py-3 px-4 md:px-8 bg-slate-50">
        <div className="container mx-auto flex items-center justify-between text-xs text-slate-500">
          <div>
            Home &gt; Auto Parts &gt; <span className="text-slate-900 font-semibold">Spare Parts & Accessories</span>
          </div>
          <div>
            <span className="font-bold text-slate-900">150</span> products available
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 flex gap-6">
        
        {/* SIDEBAR FILTERS (Alibaba Style) */}
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          
          {/* Supplier Types */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Supplier Types</h3>
            <div className="space-y-2">
               <div className="flex items-center space-x-2">
                 <Checkbox id="verified" />
                 <label htmlFor="verified" className="text-sm text-slate-600 cursor-pointer flex items-center gap-1">
                   <ShieldCheck size={14} className="text-blue-500" /> Verified Supplier
                 </label>
               </div>
               <div className="flex items-center space-x-2">
                 <Checkbox id="trade" />
                 <label htmlFor="trade" className="text-sm text-slate-600 cursor-pointer text-orange-600 font-medium">
                   Trade Assurance
                 </label>
               </div>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Categories</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="font-medium text-slate-900 cursor-pointer">Engine Parts</li>
              <li className="cursor-pointer hover:text-blue-600">Body & Exterior</li>
              <li className="cursor-pointer hover:text-blue-600">Wheels & Tyres</li>
              <li className="cursor-pointer hover:text-blue-600">Electronics & Lights</li>
              <li className="cursor-pointer hover:text-blue-600">Suspension</li>
              <li className="cursor-pointer hover:text-blue-600">Tools & Equipment</li>
            </ul>
          </div>

          <Separator />

          {/* Min Order */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Min. Order</h3>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" className="w-16 border rounded px-2 py-1 text-sm" />
              <Button size="sm" variant="secondary" className="h-7 text-xs">OK</Button>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Supplier Location</h3>
            <div className="space-y-2">
               <div className="flex items-center space-x-2">
                 <Checkbox id="nairobi" />
                 <label htmlFor="nairobi" className="text-sm text-slate-600">Nairobi</label>
               </div>
               <div className="flex items-center space-x-2">
                 <Checkbox id="mombasa" />
                 <label htmlFor="mombasa" className="text-sm text-slate-600">Mombasa</label>
               </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="flex-1">
          {/* Top Filter Bar */}
          <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
             <Button variant="outline" size="sm" className="h-8 rounded-full bg-slate-100 border-slate-200 text-slate-700">
                Best Match <ChevronDown size={14} className="ml-1" />
             </Button>
             <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-600">Orders</Button>
             <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-600">Price</Button>
             <div className="flex-1" />
             <div className="flex items-center gap-2 text-sm text-slate-500">
                <Checkbox id="ready" />
                <label htmlFor="ready">Ready to Ship</label>
             </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {MOCK_PRODUCTS.map((product) => (
               <Card key={product.id} className="group cursor-pointer border-slate-200 shadow-none hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                 <div className="relative aspect-square bg-slate-100 overflow-hidden">
                   <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   
                   {/* Hover Overlay Actions */}
                   <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1.5 bg-white rounded-full shadow-sm text-slate-500 hover:text-red-500">
                         <Heart size={16} />
                      </div>
                   </div>
                 </div>

                 <CardContent className="p-4">
                   <h3 className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:underline">
                     {product.title}
                   </h3>
                   
                   <div className="mb-2">
                     <p className="text-lg font-bold text-slate-900">{product.price}</p>
                     <p className="text-xs text-slate-500">Min. Order: {product.moq}</p>
                   </div>

                   <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-xs text-slate-500 truncate underline">{product.supplier}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                         {product.isVerified && (
                           <ShieldCheck size={14} className="text-blue-500" />
                         )}
                         <span className="text-[10px] text-slate-400">{product.years}YRS</span>
                      </div>
                   </div>
                   
                   <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                     <MapPin size={10} /> {product.location}
                   </div>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
