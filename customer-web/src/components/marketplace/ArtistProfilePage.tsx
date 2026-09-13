"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArtistProfile, MarketplaceReview, TrustScoreRecord } from "../../lib/marketplace/marketplace-types";
import { getArtistBySlug } from "../../lib/marketplace/marketplace-catalog-engine";
import { getMarketplaceReviews, calculateTrustScore } from "../../lib/marketplace/trust-review-engine";

export default function ArtistProfilePage({ slug }: { slug: string }) {
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [trustScore, setTrustScore] = useState<TrustScoreRecord | null>(null);

  useEffect(() => {
    const found = getArtistBySlug(slug);
    if (found) {
      setArtist(found);
      const revs = getMarketplaceReviews(found.artistId);
      setReviews(revs);

      const trust = calculateTrustScore({
        organizationId: found.organizationId,
        artistId: found.artistId,
        completedBookingsCount: found.reviewCount + 10,
        cancellationRatePercent: 1.2,
        responseRatePercent: 98,
        ratingAverage: found.ratingSummary,
        disputeCount: 0,
        isVerified: found.verified,
      });
      setTrustScore(trust);
    }
  }, [slug]);

  if (!artist) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="text-xl font-bold text-slate-300">Artist Profile Loading or Not Found</div>
        <Link href="/marketplace" className="mt-4 text-amber-400 font-semibold hover:underline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto mb-6">
        <Link href="/marketplace" className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1">
          ← Back to Marketplace Search
        </Link>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Profile Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-3xl font-black text-slate-950 shadow-xl">
              {artist.displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white">{artist.displayName}</h1>
                {artist.verified && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                    ✓ Verified Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {artist.experienceYears} Years Experience • Hubs: {artist.serviceLocations.join(", ").toUpperCase()}
              </p>
              <div className="flex items-center gap-2 mt-3">
                {trustScore && (
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold">
                    Trust Score: {trustScore.overallTrustScore} / 100 ({trustScore.badge})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
            <div className="text-2xl font-black text-amber-400 flex items-center justify-end gap-1">
              <span>★</span>
              <span>{artist.ratingSummary}</span>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">({artist.reviewCount} Verified Reviews)</span>
            <Link
              href="/book"
              className="mt-3 inline-block bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg"
            >
              Book Artist Date
            </Link>
          </div>
        </div>

        {/* Bio & Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-white">About the Artist</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{artist.bio}</p>

            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider pt-2">Signature Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {artist.specialties.map((spec, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-950 border border-slate-800 text-amber-300 rounded-lg text-xs font-semibold">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & Service Guidance */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-white">Pricing Guidance</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                <span>Bridal Signature Package:</span>
                <span className="font-bold text-emerald-400">From ₹25,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                <span>Engagement Glam:</span>
                <span className="font-bold text-slate-200">From ₹15,000</span>
              </div>
              <div className="flex justify-between py-2 text-slate-300">
                <span>Outstation Travel Fee:</span>
                <span className="font-bold text-amber-400">Server-Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Reviews Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            💬 Verified Customer Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No verified reviews submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.reviewId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">{"★".repeat(rev.rating)}</span>
                      {rev.verifiedBooking && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                          Verified Booking
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{rev.reviewText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
