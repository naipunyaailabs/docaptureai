import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://docaptureai.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/pricing", "/contact"],
        disallow: ["/dashboard/", "/auth/", "/api/", "/admin/", "/_next/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/about", "/pricing", "/contact"],
        disallow: ["/dashboard/", "/auth/", "/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
