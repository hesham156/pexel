import { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "https://yourstore.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/categories", "/contact", "/faq", "/blog"],
        disallow: [
          "/admin/",
          "/api/",
          "/checkout",
          "/cart",
          "/orders",
          "/profile",
          "/(auth)/",
        ],
      },
      {
        // Block AI bots from scraping product data
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web"],
        disallow: ["/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
