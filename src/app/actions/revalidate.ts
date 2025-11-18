'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidates the blog detail page and blog list page
 * This ensures that static pages are regenerated after content updates
 */
export async function revalidateBlogPages(slug?: string) {
  try {
    console.log('[revalidateBlogPages] Starting revalidation...', { slug });

    // Revalidate the specific blog detail page if slug is provided
    if (slug) {
      const blogPath = `/blogs/${slug}`;
      revalidatePath(blogPath);
      console.log('[revalidateBlogPages] Revalidated blog detail:', blogPath);
    }

    // Revalidate the blog list page
    revalidatePath('/blogs');
    console.log('[revalidateBlogPages] Revalidated blog list');

    // Revalidate blog list with layout
    revalidatePath('/blogs', 'layout');
    console.log('[revalidateBlogPages] Revalidated blog layout');

    return { success: true, message: 'Cache revalidated successfully' };
  } catch (error) {
    console.error('[revalidateBlogPages] Revalidation error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to revalidate cache'
    };
  }
}

/**
 * Revalidates all blog-related pages
 * Use this for bulk updates or when unsure which pages need revalidation
 */
export async function revalidateAllBlogs() {
  try {
    console.log('[revalidateAllBlogs] Starting full blog revalidation...');

    // Revalidate all blog routes
    revalidatePath('/blogs', 'layout');
    revalidateTag('blogs');

    console.log('[revalidateAllBlogs] Full revalidation complete');

    return { success: true, message: 'All blog pages revalidated' };
  } catch (error) {
    console.error('[revalidateAllBlogs] Revalidation error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to revalidate cache'
    };
  }
}
