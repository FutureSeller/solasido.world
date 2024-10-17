export default async function sitemap() {
  return [
    {
      url: "https://dopamine.solasido.world",
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
