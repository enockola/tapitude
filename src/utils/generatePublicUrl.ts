function generatePublicUrl(slug:string) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/p/${slug}`;
}

export default generatePublicUrl;
