import { TrackSkeleton } from "../../components/booking/TrackBooking";

export default function Loading() {
  return (
    <main className="section pt-10 sm:pt-16" aria-busy="true">
      <div className="container-page max-w-4xl space-y-4">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-12 w-3/4" />
        <div className="skeleton mt-6 h-28 rounded-2xl" />
        <TrackSkeleton />
      </div>
    </main>
  );
}
