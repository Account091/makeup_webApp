import { PageSkeleton } from "../../components/site/Skeletons";

export default function Loading() {
  return <PageSkeleton cards={3} imageCards={false} />;
}
