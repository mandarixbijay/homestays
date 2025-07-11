// src/components/homestay/HomestayDetailWrapper.tsx
import { Suspense } from "react";
import HomestayDetailClient from "@/components/homestay/page";
import { Hero3Card } from "@/app/homestays/[slug]/page";

interface HomestayDetailWrapperProps {
  homestay: Hero3Card | null;
  slug: string;
}

export default function HomestayDetailWrapper({ homestay, slug }: HomestayDetailWrapperProps) {
  if (!homestay) {
    return <div>Homestay not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading homestay details...</div>}>
      <HomestayDetailClient homestay={homestay} imageUrl={undefined} slug={slug} />
    </Suspense>
  );
}