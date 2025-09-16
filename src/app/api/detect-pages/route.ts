import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { siteUrl } = await request.json()
    
    if (!siteUrl) {
      return NextResponse.json({ error: 'Site URL is required' }, { status: 400 })
    }

    const detectedPages = []
    
    try {
      // First, try to check for sitemap
      const sitemapPages = await checkSitemap(siteUrl)
      if (sitemapPages.length > 0) {
        detectedPages.push(...sitemapPages)
      }
      
      // Then, try to get the main page to extract links
      const mainPageResponse = await fetch(siteUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)',
        },
        timeout: 10000,
      })
      
      if (mainPageResponse.ok) {
        const html = await mainPageResponse.text()
        
        // Extract links from the HTML
        const links = extractLinksFromHTML(html, siteUrl)
        
        // Add the main page if not already added from sitemap
        if (!detectedPages.find(p => p.path === '/')) {
          detectedPages.push({
            path: '/',
            title: extractTitleFromHTML(html) || 'Home',
            url: siteUrl
          })
        }
        
        // Validate and add discovered links
        for (const link of links) {
          try {
            // Skip if we already have this page
            if (detectedPages.find(p => p.url === link.url)) continue
            
            const response = await fetch(link.url, {
              method: 'HEAD',
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)',
              },
              timeout: 5000,
            })
            
            if (response.ok && response.status === 200) {
              detectedPages.push(link)
            }
          } catch (error) {
            // Skip invalid links
            continue
          }
        }
      }
    } catch (error) {
      console.error('Error fetching main page:', error)
    }
    
    // If no pages were detected from crawling, fall back to common pages
    if (detectedPages.length <= 1) {
      const commonPages = [
        { path: '/', title: 'Home', url: siteUrl },
        { path: '/about', title: 'About', url: `${siteUrl}/about` },
        { path: '/contact', title: 'Contact', url: `${siteUrl}/contact` },
        { path: '/services', title: 'Services', url: `${siteUrl}/services` },
        { path: '/products', title: 'Products', url: `${siteUrl}/products` },
        { path: '/blog', title: 'Blog', url: `${siteUrl}/blog` },
        { path: '/news', title: 'News', url: `${siteUrl}/news` },
        { path: '/support', title: 'Support', url: `${siteUrl}/support` },
        { path: '/help', title: 'Help', url: `${siteUrl}/help` },
        { path: '/faq', title: 'FAQ', url: `${siteUrl}/faq` },
        { path: '/privacy', title: 'Privacy Policy', url: `${siteUrl}/privacy` },
        { path: '/terms', title: 'Terms of Service', url: `${siteUrl}/terms` },
      ]

      // Try to detect actual pages by making HTTP requests
      for (const page of commonPages) {
        try {
          const response = await fetch(page.url, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)',
            },
            timeout: 5000,
          })
          
          if (response.ok) {
            // Check if we already have this page
            if (!detectedPages.find(p => p.url === page.url)) {
              detectedPages.push(page)
            }
          }
        } catch (error) {
          // Page doesn't exist or is not accessible
          continue
        }
      }
    }

    // Remove duplicates and sort
    const uniquePages = detectedPages.filter((page, index, self) => 
      index === self.findIndex(p => p.url === page.url)
    ).sort((a, b) => {
      // Put main page first, then sort by path
      if (a.path === '/') return -1
      if (b.path === '/') return 1
      return a.path.localeCompare(b.path)
    })

    return NextResponse.json({ 
      pages: uniquePages,
      total: uniquePages.length 
    })
  } catch (error) {
    console.error('Error detecting pages:', error)
    return NextResponse.json(
      { error: 'Failed to detect pages' },
      { status: 500 }
    )
  }
}

function extractLinksFromHTML(html: string, baseUrl: string): Array<{path: string, title: string, url: string}> {
  const links: Array<{path: string, title: string, url: string}> = []
  
  try {
    // Extract links using regex (simple approach)
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi
    let match
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1]
      const linkText = match[2].trim()
      
      // Skip external links, mailto, tel, etc.
      if (href.startsWith('http') && !href.startsWith(baseUrl)) continue
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue
      if (href.startsWith('javascript:') || href.startsWith('data:')) continue
      
      let fullUrl: string
      let path: string
      
      if (href.startsWith('http')) {
        fullUrl = href
        path = new URL(href).pathname
      } else if (href.startsWith('/')) {
        fullUrl = new URL(href, baseUrl).href
        path = href
      } else {
        fullUrl = new URL(href, baseUrl).href
        path = '/' + href
      }
      
      // Only include pages from the same domain
      if (new URL(fullUrl).origin === new URL(baseUrl).origin) {
        links.push({
          path: path,
          title: linkText || path.split('/').pop() || path,
          url: fullUrl
        })
      }
    }
  } catch (error) {
    console.error('Error extracting links:', error)
  }
  
  return links
}

function extractTitleFromHTML(html: string): string | null {
  try {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    return titleMatch ? titleMatch[1].trim() : null
  } catch (error) {
    return null
  }
}

async function checkSitemap(siteUrl: string): Promise<Array<{path: string, title: string, url: string}>> {
  const pages: Array<{path: string, title: string, url: string}> = []
  
  try {
    const baseUrl = new URL(siteUrl)
    const sitemapUrls = [
      `${baseUrl.origin}/sitemap.xml`,
      `${baseUrl.origin}/sitemap_index.xml`,
      `${baseUrl.origin}/sitemaps.xml`,
      `${baseUrl.origin}/robots.txt` // Sometimes contains sitemap reference
    ]
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)',
          },
          timeout: 5000,
        })
        
        if (response.ok) {
          const content = await response.text()
          
          if (sitemapUrl.endsWith('.xml')) {
            // Parse XML sitemap
            const xmlPages = parseSitemapXML(content, baseUrl.origin)
            pages.push(...xmlPages)
          } else if (sitemapUrl.endsWith('robots.txt')) {
            // Check robots.txt for sitemap reference
            const sitemapRef = content.match(/Sitemap:\s*(.+)/i)
            if (sitemapRef) {
              const referencedSitemap = sitemapRef[1].trim()
              try {
                const sitemapResponse = await fetch(referencedSitemap, {
                  method: 'GET',
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)',
                  },
                  timeout: 5000,
                })
                
                if (sitemapResponse.ok) {
                  const sitemapContent = await sitemapResponse.text()
                  const xmlPages = parseSitemapXML(sitemapContent, baseUrl.origin)
                  pages.push(...xmlPages)
                }
              } catch (error) {
                // Skip if sitemap can't be fetched
              }
            }
          }
          
          // If we found a sitemap, we can break
          if (pages.length > 0) break
        }
      } catch (error) {
        // Continue to next sitemap URL
        continue
      }
    }
  } catch (error) {
    console.error('Error checking sitemap:', error)
  }
  
  return pages
}

function parseSitemapXML(xmlContent: string, baseOrigin: string): Array<{path: string, title: string, url: string}> {
  const pages: Array<{path: string, title: string, url: string}> = []
  
  try {
    // Simple XML parsing for sitemap
    const urlRegex = /<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]*)<\/lastmod>)?(?:\s*<changefreq>([^<]*)<\/changefreq>)?(?:\s*<priority>([^<]*)<\/priority>)?\s*<\/url>/gi
    let match
    
    while ((match = urlRegex.exec(xmlContent)) !== null) {
      const url = match[1].trim()
      
      // Only include URLs from the same domain
      if (url.startsWith(baseOrigin)) {
        const urlObj = new URL(url)
        const path = urlObj.pathname
        
        pages.push({
          path: path,
          title: path.split('/').pop() || path,
          url: url
        })
      }
    }
  } catch (error) {
    console.error('Error parsing sitemap XML:', error)
  }
  
  return pages
}
