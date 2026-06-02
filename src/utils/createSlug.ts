import slugify from "slugify";

/**
 * Creates a URL-friendly slug with a random suffix.
 * @param title - The string to be converted into a slug.
 * @returns The generated slug string.
 */
function createSlug(title: string): string {
  const base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  // Generate a random alphanumeric string of 5 characters
  const suffix = Math.random().toString(36).substring(2, 7);

  return `${base}-${suffix}`;
}

export default createSlug;