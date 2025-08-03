'use client';
import { use } from 'react';
import HomestayDetailView from '@/components/admin/HomestayDetailView';

interface HomestayDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function HomestayDetailPage({ params }: HomestayDetailPageProps) {
  const resolvedParams = use(params);
  return <HomestayDetailView homestayId={resolvedParams.id} />;
}