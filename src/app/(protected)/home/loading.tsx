// app/(protected)/home/loading.tsx

import { HeroSkeleton, TitleRowSkeleton } from "@/components/ui/Skeletons";

export default function HomeLoading() {
  return (
    <div className="min-h-screen space-y-8 p-4 sm:p-6 lg:p-8">
      <HeroSkeleton />
      <TitleRowSkeleton />
      <TitleRowSkeleton />
      <TitleRowSkeleton />
      <TitleRowSkeleton />
      <TitleRowSkeleton />
    </div>
  );
}
