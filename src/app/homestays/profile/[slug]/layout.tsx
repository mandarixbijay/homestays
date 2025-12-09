// src/app/homestays/profile/[slug]/layout.tsx
import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;

    // Extract homestay ID from slug (format: name-address-id-123)
    const idMatch = slug.match(/-id-(\d+)$/);
    const homestayId = idMatch ? idMatch[1] : null;

    // Extract name from slug (everything before the last address part)
    const nameMatch = slug.match(/^(.+?)-[^-]+-[^-]+-id-\d+$/);
    const homestayName = nameMatch
      ? nameMatch[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Homestay';

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalhomestays.com';
    const canonicalUrl = `${baseUrl}/homestays/profile/${slug}`;

    return {
      title: `${homestayName} - Book Your Stay | Nepal Homestays`,
      description: `Book ${homestayName} and experience authentic Nepalese hospitality. View rooms, amenities, pricing, and availability for your perfect homestay adventure in Nepal.`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${homestayName} | Nepal Homestays`,
        description: `Book ${homestayName} and experience authentic Nepalese hospitality.`,
        url: canonicalUrl,
        type: 'website',
        siteName: 'Nepal Homestays',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${homestayName} | Nepal Homestays`,
        description: `Book ${homestayName} and experience authentic Nepalese hospitality.`,
      },
    };
  } catch (error) {
    console.error('Error generating homestay metadata:', error);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalhomestays.com';
    const { slug } = await params;

    return {
      title: 'Homestay Profile | Nepal Homestays',
      description: 'Experience authentic Nepalese hospitality at this homestay.',
      alternates: {
        canonical: `${baseUrl}/homestays/profile/${slug}`,
      },
    };
  }
}

export default function HomestayProfileLayout({ children }: Props) {
  return <>{children}</>;
}
