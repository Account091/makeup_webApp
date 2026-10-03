'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface QuoteTier {
  id: string;
  name: string;
  tagline: string;
  leadArtist: string;
  basePrice: number;
  inclusions: string[];
  recommended?: boolean;
}

const QUOTE_TIERS: QuoteTier[] = [
  {
    id: 'signature',
    name: 'Royal Airbrush Signature',
    tagline: 'Lead by Prachi with 2 Senior Styling Associates',
    leadArtist: 'Prachi (Founder & Celebrity Artist)',
    basePrice: 55000,
    inclusions: [
      'Temptu HD Silicone Airbrush Makeup (18-Hr Sweatproof)',
      'Pre-wedding bespoke skin analysis & 3D face trial',
      'Intricate floral / royal heritage hair couture',
      'Dual dupatta draping & heirloom jewellery setting',
      'Luxury Touch-Up Kit with bridal lipstick miniature & blotters',
      'Complimentary Mum or Sister Styling for Wedding Day',
    ],
    recommended: true,
  },
  {
    id: 'classic_hd',
    name: 'Classic HD Bridal Elegance',
    tagline: 'Lead by Senior Studio Pro Artist with 1 Associate',
    leadArtist: 'Senior Pro Bridal Specialist',
    basePrice: 38000,
    inclusions: [
      'High-Definition Micro-pigment Ultra-HD Makeup',
      'Bridal hair sculpt & accessory pinning',
      'Classic Rajputi / Lehanga dupatta draping',
      'Hydrating pre-makeup ampoule preparation',
      'Bridal touch-up kit (sponges + blotting sheets)',
    ],
  },
  {
    id: 'intimate',
    name: 'Intimate Celebrations Duo',
    tagline: 'Specially crafted for Haldi, Mehendi & Sangeet',
    leadArtist: 'Senior Stylist Team',
    basePrice: 26000,
    inclusions: [
      'Dewy Glass-Skin Makeup for Daylight & Flash Photography',
      'Textured floral braid / modern Hollywood waves',
      'Comfortable saree / lightweight lehenga draping',
      'Long-wear waterproof lip & eye formulation',
    ],
  },
];

interface Contribution {
  contributor: string;
  amount: number;
  message: string;
  timestamp: string;
}

export default function QuotePage({ params }: { params: { id: string } }) {
  const quoteId = params.id || 'QT-2026-RAJ';
  const [selectedTierId, setSelectedTierId] = useState<string>('signature');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showContributeModal, setShowContributeModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Group Contribution State
  const [contributions, setContributions] = useState<Contribution[]>([
    {
      contributor: 'Chachi & Masi (Maternal Family)',
      amount: 15000,
      message: 'Blessings to our dearest bride! Looking forward to the wedding in Jodhpur! ✨',
      timestamp: 'Yesterday at 04:12 PM',
    },
    {
      contributor: 'Bhai & Bhabhi (Groom’s Side)',
      amount: 10000,
      message: 'For the most stunning Sangeet look! Cheers! 💃',
      timestamp: 'Today at 09:45 AM',
    },
  ]);

  const [contributorName, setContributorName] = useState('');
  const [customContribution, setCustomContribution] = useState('5000');
  const [contributorNote, setContributorNote] = useState('');

  const selectedTier = QUOTE_TIERS.find((t) => t.id === selectedTierId) || QUOTE_TIERS[0];
  const gstAmount = Math.round(selectedTier.basePrice * 0.18);
  const totalAmount = selectedTier.basePrice + gstAmount;

  const totalContributed = contributions.reduce((acc, c) => acc + c.amount, 0);
  const remainingDue = Math.max(0, totalAmount - totalContributed);
  const percentSecured = Math.min(100, Math.round((totalContributed / totalAmount) * 100));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(customContribution) || 0;
    if (amt <= 0 || !contributorName.trim()) return;

    setContributions([
      ...contributions,
      {
        contributor: contributorName.trim(),
        amount: amt,
        message: contributorNote.trim() || 'Best wishes for your dream wedding! 💖',
        timestamp: 'Just now',
      },
    ]);
    setShowContributeModal(false);
    setContributorName('');
    setContributorNote('');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans pb-24">
      {/* Luxury Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#2A0845]/95 backdrop-blur-md border-b border-[#D4AF37]/30 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-xl tracking-wider text-[#D4AF37] font-semibold hover:opacity-90">
              Makeovers by Prachi
            </Link>
            <span className="hidden sm:inline-block text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
              Verified Quote #{quoteId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/50 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share with Family
            </button>

            <Link
              href="/my-wedding"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors"
            >
              <span>👑</span> My Wedding Hub
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#2A0845] via-[#3B0E5E] to-[#2A0845] text-white pt-10 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-2">
            Personalized Bridal Dossier & Proposal
          </p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">
            Royal Rajasthan Wedding Makeover Quote
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
            Review your tailored bridal styling options, compare artist tiers, and invite family members to contribute directly to your booking.
          </p>

          {/* Quick Client Summary Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="bg-white/10 px-4 py-2 rounded-full border border-white/15">
              👰 <strong>Bride:</strong> Radhika Jodhpur
            </span>
            <span className="bg-white/10 px-4 py-2 rounded-full border border-white/15">
              📍 <strong>Venue:</strong> Gorbandh Palace, Jodhpur
            </span>
            <span className="bg-white/10 px-4 py-2 rounded-full border border-white/15">
              📅 <strong>Dates:</strong> 24 - 26 November 2026
            </span>
            <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-4 py-2 rounded-full border border-[#D4AF37]/40 font-medium">
              🔒 Slot Held for 48 Hours
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 -mt-8">
        {/* Group Payment Progress Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#D4AF37]/20 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-[#8C6D23] uppercase tracking-wider">
                Family & Group Contribution Tracker
              </span>
              <h2 className="text-xl font-serif font-bold text-[#2A0845]">
                ₹{totalContributed.toLocaleString('en-IN')} Secured of ₹{totalAmount.toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowContributeModal(true)}
                className="bg-[#2A0845] hover:bg-[#3B0E5E] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
              >
                <span>🎁</span> Contribute to Bride’s Package
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
            <div
              className="bg-gradient-to-r from-[#D4AF37] to-[#8C6D23] h-full transition-all duration-500 rounded-full"
              style={{ width: `${percentSecured}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <span>{percentSecured}% Total Package Covered</span>
            <span>₹{remainingDue.toLocaleString('en-IN')} Remaining Balance</span>
          </div>

          {/* Recent Contributors Feed */}
          {contributions.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
              {contributions.map((c, idx) => (
                <div key={idx} className="bg-[#FDFBF7] p-3 rounded-xl border border-gray-200 text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#2A0845]">
                    <span>{c.contributor}</span>
                    <span className="text-[#8C6D23] font-bold">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-gray-600 italic mt-1">&ldquo;{c.message}&rdquo;</p>
                  <span className="text-[10px] text-gray-400 block mt-1">{c.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tier Comparison Switcher */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#2A0845]">
              Choose Your Bridal Styling Tier
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select any package below to inspect line-item inclusions and dynamic pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {QUOTE_TIERS.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`cursor-pointer rounded-2xl p-6 transition-all duration-200 border-2 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#2A0845] shadow-xl ring-2 ring-[#D4AF37]/30'
                      : 'bg-white/80 border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2A0845] text-[#D4AF37] px-3.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm">
                      ★ Most Preferred by Brides
                    </div>
                  )}

                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#2A0845]">{tier.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 mb-4">{tier.tagline}</p>

                    <div className="mb-4">
                      <span className="text-2xl font-serif font-bold text-[#8C6D23]">
                        ₹{tier.basePrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-500 block">+ 18% GST (CGST 9% + SGST 9%)</span>
                    </div>

                    <div className="text-xs text-gray-600 font-medium mb-3">
                      👑 <strong>Lead Stylist:</strong> {tier.leadArtist}
                    </div>

                    <ul className="space-y-2 text-xs text-gray-700">
                      {tier.inclusions.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#8C6D23] font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`mt-6 w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#2A0845] text-white shadow'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    {isSelected ? 'Selected Package' : 'Select Tier'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Tier Commercial Breakdown & Acceptance Box */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-[#D4AF37]/20 mt-8">
          <div className="border-b border-gray-100 pb-5 mb-6">
            <span className="text-xs font-semibold text-[#8C6D23] uppercase tracking-wider">
              Legal & Financial Invoice Breakdown
            </span>
            <h3 className="text-xl font-serif font-bold text-[#2A0845] mt-1">
              {selectedTier.name} — Comprehensive Summary
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Base Bridal Makeover Package</span>
              <span className="font-semibold text-gray-900">₹{selectedTier.basePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Central GST (CGST @ 9%)</span>
              <span className="font-medium text-gray-700">₹{(gstAmount / 2).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">State GST (SGST @ 9%)</span>
              <span className="font-medium text-gray-700">₹{(gstAmount / 2).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 font-bold text-[#2A0845]">
              <span>Gross Package Total</span>
              <span className="text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-700 font-medium">
              <span>Total Family Contributions Deducted</span>
              <span>- ₹{totalContributed.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-3 text-base font-serif font-bold text-[#8C6D23] bg-[#FDFBF7] px-4 rounded-xl">
              <span>Net Payable Balance</span>
              <span className="text-xl">₹{remainingDue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Section 269ST & DPDP Legal Notice */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            <strong>Statutory Compliance & Escrow Guardrails:</strong> In compliance with Section 269ST of the Income Tax Act, cash payments exceeding ₹2,00,000 per event are strictly prohibited. All advance transfers are processed via verified Razorpay Route / UPI Escrow. Your consultation images and bridal face chart are safeguarded under DPDP Act 2023 with strict zero-third-party disclosure.
          </div>

          {/* Approval & Acceptance Checkbox */}
          <div className="mt-6 flex items-start gap-3">
            <input
              type="checkbox"
              id="accept-terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#2A0845] focus:ring-[#2A0845]"
            />
            <label htmlFor="accept-terms" className="text-xs text-gray-700 cursor-pointer">
              I have reviewed the schedule, venue logistics, and line items. I authorize <strong>Makeovers by Prachi</strong> to secure my wedding date upon receipt of the 30% booking advance (or covered by group contributions).
            </label>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              disabled={!acceptedTerms || isLocked}
              onClick={() => setIsLocked(true)}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                isLocked
                  ? 'bg-green-700 text-white cursor-default'
                  : acceptedTerms
                  ? 'bg-[#2A0845] hover:bg-[#3B0E5E] text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLocked ? (
                <>✓ Proposal Formally Accepted & Locked</>
              ) : (
                <>Lock Booking & Proceed to Payment (₹{Math.round(totalAmount * 0.3).toLocaleString('en-IN')} Advance)</>
              )}
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="py-3.5 px-6 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Share PDF / WhatsApp
            </button>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D4AF37]/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2A0845]">Share Quote with Family</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Send this verified proposal link to parents, siblings, or in-laws. They can review inclusions and make a gift contribution directly.
            </p>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-700 mb-4">
              <span className="truncate pr-2 font-mono text-[11px]">{typeof window !== 'undefined' ? window.location.href : 'https://makeoversbyprachi.com/quote/' + quoteId}</span>
              <button
                onClick={handleCopyLink}
                className="bg-[#2A0845] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3B0E5E] shrink-0"
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="space-y-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Namaste! Here is the verified Bridal Makeover proposal for Radhika's wedding in Jodhpur by Makeovers by Prachi. You can view inclusions, compare packages, or contribute here: https://makeoversbyprachi.com/quote/${quoteId}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow"
              >
                <span>💬</span> Share on WhatsApp
              </a>
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                🖨️ Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Contribution Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D4AF37]/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-bold text-lg text-[#2A0845]">Contribute to Bridal Makeover</h3>
              <button
                onClick={() => setShowContributeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name & Relation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masi & Uncle, Younger Sister, etc."
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#2A0845] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contribution Amount (₹)</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['2500', '5000', '10000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCustomContribution(amt)}
                      className={`py-1.5 text-xs rounded-lg font-medium border ${
                        customContribution === amt
                          ? 'bg-[#2A0845] text-white border-[#2A0845]'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      ₹{parseInt(amt).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={customContribution}
                  onChange={(e) => setCustomContribution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#2A0845] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Blessings / Personal Note</label>
                <textarea
                  rows={2}
                  placeholder="Warm wishes for the bride on her special day..."
                  value={contributorNote}
                  onChange={(e) => setContributorNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#2A0845] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2A0845] hover:bg-[#3B0E5E] text-white font-semibold text-xs shadow-md transition-all"
              >
                Proceed to Secure UPI / Card Payment (₹{parseInt(customContribution || '0').toLocaleString('en-IN')})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
