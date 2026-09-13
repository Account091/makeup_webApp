"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArtistProfile, MarketplaceListing } from "../../lib/marketplace/marketplace-types";
import { searchMarketplace } from "../../lib/marketplace/marketplace-catalog-engine";

export default function MarketplaceHomeScreen() {
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const results = searchMarketplace({
      city: cityFilter,
      serviceCategory: categoryFilter,
    });
    setArtists(results.artists);
    setListings(results.listings);
  }, [cityFilter, categoryFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-10 text-center border-b border-slate-800 pb-8">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Multi-Tenant Marketplace Platform • V8.0
        </span>
        <h1 className="text-4xl md:text-5xl font-black mt-3 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400 bg-clip-text text-transparent">
          Beauty Marketplace & Artist Discovery
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl mx-auto">
          Discover top-rated bridal makeup artists, hair stylists, and beauty studios across Rajasthan & India. Real reviews, transparent pricing, & authoritative booking locking.
        </p>

        {/* Navigation links for marketplace portals */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            href="/organization/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:border-amber-500 text-xs font-semibold transition-all"
          >
            🏢 Artist / Studio Portal
          </Link>
          <Link
            href="/platform-admin"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:border-indigo-500 text-xs font-semibold transition-all"
          >
            🛡️ Platform Admin Console
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search & Filter Controls */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists, services, or locations (e.g. Rajputi poshak, Jaipur bridal)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => {
                const results = searchMarketplace({ city: cityFilter, serviceCategory: categoryFilter });
                setArtists(results.artists);
                setListings(results.listings);
              }}
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all"
            >
              Search Marketplace
            </button>
          </div>

          {/* City Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mr-2">City:</span>
            {["all", "jodhpur", "jaipur", "udaipur", "destination"].map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  cityFilter === city
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {city.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mr-2">Service:</span>
            {["all", "BRIDAL", "ENGAGEMENT", "PARTY", "HAIR", "DRAPING"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  categoryFilter === cat
                    ? "bg-rose-500 text-slate-950"
                    : "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Artists Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🌟 Verified Artists & Studios
              </h2>
              <p className="text-xs text-slate-400">Authentic reviews, verified portfolios, & authorized price quotes.</p>
            </div>
            <span className="text-xs text-amber-400 font-semibold">{artists.length} Verified Artists Found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artists.map((artist) => (
              <div
                key={artist.artistId}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-100">{artist.displayName}</h3>
                        {artist.verified && (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{artist.experienceYears} Years Experience • {artist.serviceLocations.join(", ").toUpperCase()}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-lg">
                        <span>★</span>
                        <span>{artist.ratingSummary}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">({artist.reviewCount} verified reviews)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2">{artist.bio}</p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {artist.specialties.map((spec, i) => (
                      <span key={i} className="text-[10px] bg-slate-950 text-amber-300 border border-slate-800 px-2 py-0.5 rounded-md">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starting From</span>
                    <span className="text-lg font-bold text-emerald-400">₹25,000</span>
                  </div>

                  <Link
                    href={`/artist/${artist.slug}`}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    View Profile & Book →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Service Listings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            ✨ Featured Signature Marketplace Listings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map((lst) => (
              <div key={lst.listingId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-amber-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-amber-300 text-lg">{lst.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{lst.locationIds.join(", ").toUpperCase()}</p>
                  </div>
                  <span className="text-lg font-black text-emerald-400">
                    ₹{lst.startingPrice.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3">{lst.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">★ {lst.ratingSummary} ({lst.reviewCount} reviews)</span>
                  <Link
                    href="/book"
                    className="text-amber-400 font-semibold hover:underline"
                  >
                    Reserve Date Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
