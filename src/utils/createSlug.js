const slugify = require("slugify");

function createSlug(title) {
  const base = slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });

  const suffix = Math.random().toString(36).slice(2, 7);

  return `${base}-${suffix}`;
}

module.exports = createSlug;
