/**
 * Generate URL-friendly slug from community name and location
 * Format: name-location-id
 * Example: madi-community-homestay-chitwan-6
 */
export function generateCommunitySlug(name: string, location: string, id: number): string {
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const nameSlug = slugify(name);
  const locationSlug = slugify(location);

  return `${nameSlug}-${locationSlug}-${id}`;
}

/**
 * Extract community ID from slug
 * Supports both slug format (name-location-id) and numeric ID
 */
export function extractCommunityId(slugOrId: string): number | null {
  // If it's already a number, return it
  if (/^\d+$/.test(slugOrId)) {
    return parseInt(slugOrId, 10);
  }

  // Extract ID from slug (last segment after final hyphen)
  const parts = slugOrId.split('-');
  const lastPart = parts[parts.length - 1];

  if (/^\d+$/.test(lastPart)) {
    return parseInt(lastPart, 10);
  }

  return null;
}

/**
 * Validate if a slug matches the expected format for a community
 */
export function isValidCommunitySlug(slug: string): boolean {
  // Should end with a number (ID)
  return /^[\w-]+-\d+$/.test(slug);
}
