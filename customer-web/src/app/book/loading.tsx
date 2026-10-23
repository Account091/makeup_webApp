import { WizardSkeleton } from "../../components/booking/BookingWizard";

export default function Loading() {
  return (
    <main className="pb-16 pt-8 sm:pt-12" aria-busy="true">
      <div className="container-page">
        <div className="mb-10 max-w-2xl space-y-4">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-12 w-72" />
        </div>
        <WizardSkeleton />
      </div>
    </main>
  );
}
