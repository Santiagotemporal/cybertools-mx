import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// Solo páginas públicas reales. Si se agrega una herramienta nueva, se
// agrega aquí también.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/generador`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/fortaleza`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/entropia`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
