
import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  // Replace with your actual public domain
  const sitemapUrl = 'https://neuroradx.de/sitemap.xml'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/settings/', 
        '/dashboard/', 
        '/progress/', 
        '/bookmarks/', 
        '/my-notes/', 
        '/study/'
      ],
    },
    sitemap: sitemapUrl,
  }
}
