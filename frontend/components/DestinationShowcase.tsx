"use client";

import React from "react";
import Image from "next/image";
import { DestinationCard } from "@/types";
import { MapPin, Calendar, DollarSign, ArrowUpRight, Sparkles } from "lucide-react";

interface DestinationShowcaseProps {
  onSelectDestination: (dest: string, days: number, budget: number, style: string) => void;
}

const FEATURED_DESTINATIONS: DestinationCard[] = [
  {
    name: "Tokyo & Mount Fuji",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=987&auto=format&fit=crop",
    description: "Futuristic cityscapes, serene Shinto shrines, culinary ramen alleys, and majestic Mt. Fuji views.",
    suggestedDays: 5,
    estimatedBudget: 2000,
    category: "Standard",
    tag: "Most Popular",
  },
  {
    name: "Bali Paradise",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1038&auto=format&fit=crop",
    description: "Tropical beaches, lush Ubud rice terraces, cliffside sea temples, and rich Balinese art and culture.",
    suggestedDays: 4,
    estimatedBudget: 800,
    category: "Backpacker",
    tag: "Budget Friendly",
  },
  {
    name: "Parisian Romance",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1173&auto=format&fit=crop",
    description: "Iconic Eiffel Tower, world-class Louvre artworks, Seine river cruises, and exquisite French bistros.",
    suggestedDays: 6,
    estimatedBudget: 3200,
    category: "Luxury",
    tag: "Cultural Classic",
  },
  {
    name: "Seoul Vibes",
    country: "South Korea",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1000&auto=format&fit=crop",
    description: "Historic royal palaces, trendy Hongdae street fashion, authentic K-food BBQ, and scenic N Seoul Tower.",
    suggestedDays: 5,
    estimatedBudget: 1800,
    category: "Standard",
    tag: "Trending",
  },
  {
    name: "Kyoto Heritage",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
    description: "Thousands of vermilion Torii gates at Fushimi Inari, traditional teahouses, and bamboo groves.",
    suggestedDays: 4,
    estimatedBudget: 1500,
    category: "Standard",
    tag: "Heritage",
  },
  {
    name: "Swiss Alpine Wonder",
    country: "Switzerland",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1000&auto=format&fit=crop",
    description: "Breathtaking snow-capped peaks, pristine mountain lakes, scenic train rides, and charming chalets.",
    suggestedDays: 7,
    estimatedBudget: 4500,
    category: "Luxury",
    tag: "Scenic Nature",
  },
];

export default function DestinationShowcase({ onSelectDestination }: DestinationShowcaseProps) {
  return (
    <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/70 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Curated Destinations
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Global Getaways
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Choose from trending destinations to instantly pre-fill your AI travel plan.
          </p>
        </div>
      </div>

      {/* Grid of Destination Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {FEATURED_DESTINATIONS.map((dest) => (
          <div
            key={dest.name}
            className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Destination Photo */}
            <div className="relative h-56 w-full overflow-hidden bg-slate-100">
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Tag Badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 backdrop-blur-md shadow-sm">
                  {dest.tag}
                </span>
              </div>

              {/* Title & Country Overlay */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-xl font-bold tracking-tight leading-snug">{dest.name}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{dest.country}</span>
                </p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">{dest.description}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {dest.suggestedDays} Days
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <DollarSign className="w-3.5 h-3.5" />${dest.estimatedBudget}
                  </span>
                </div>

                <button
                  onClick={() =>
                    onSelectDestination(
                      `${dest.name}, ${dest.country}`,
                      dest.suggestedDays,
                      dest.estimatedBudget,
                      dest.category
                    )
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-600 hover:text-white transition-all shadow-sm group-hover:bg-sky-600 group-hover:text-white"
                >
                  <span>Plan Trip</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
