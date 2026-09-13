import React from "react";
import ArtistProfilePage from "../../../components/marketplace/ArtistProfilePage";

export const metadata = {
  title: "Artist Marketplace Profile | Makeovers by Prachi",
  description: "View verified artist portfolio, ratings, reviews, and book directly.",
};

export default function ArtistPage({ params }: { params: { slug: string } }) {
  return <ArtistProfilePage slug={params.slug} />;
}
