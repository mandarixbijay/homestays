export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type ValidationResult = { valid: boolean; errors: Record<string, string> };

export function validateBlogForm(payload: any): ValidationResult {
  const errors: Record<string, string> = {};
  if (!payload.title || String(payload.title).trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }
  if (!payload.content || String(payload.content).trim().length < 20) {
    errors.content = "Content must be at least 20 characters";
  }
  if (payload.summary && String(payload.summary).length > 300) {
    errors.summary = "Summary must be 300 characters or less";
  }
  if (payload.seoTitle && payload.seoTitle.length > 70) {
    errors.seoTitle = "SEO title should be 70 chars or less";
  }
  if (payload.seoDescription && payload.seoDescription.length > 155) {
    errors.seoDescription = "SEO description should be 155 chars or less";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}