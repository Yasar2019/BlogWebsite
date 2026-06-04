import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { categories, seedArticles } from '../src/data/articles.js'

const siteUrl = process.env.SITE_URL || 'https://example.com'
const today = new Date().toISOString().slice(0, 10)
const published = seedArticles
  .filter((article) => article.status === 'published' && new Date(article.scheduledAt || article.date) <= new Date())
  .sort((a, b) => new Date(b.date) - new Date(a.date))

const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly', lastmod: today },
  { path: '/blog', priority: '0.9', changefreq: 'weekly', lastmod: today },
  { path: '/about', priority: '0.7', changefreq: 'monthly', lastmod: today },
  { path: '/contact', priority: '0.6', changefreq: 'monthly', lastmod: today },
  ...categories.map((category) => ({ path: `/blog?category=${encodeURIComponent(category)}`, priority: '0.6', changefreq: 'weekly', lastmod: today })),
  ...published.map((article) => ({ path: `/article/${article.id}`, priority: article.featured ? '0.9' : '0.8', changefreq: 'monthly', lastmod: article.date })),
]

function xml(value) {
  return String(value).replace(/[&<>"]/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[match])
}

function absolute(path) {
  return `${siteUrl}${path}`
}

function writeRouteCopy(path) {
  if (path.includes('?')) return
  const target = path === '/' ? join('dist', 'index.html') : join('dist', path, 'index.html')
  mkdirSync(dirname(target), { recursive: true })
  cpSync('index.html', target)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url>\n    <loc>${xml(absolute(route.path))}</loc>\n    <lastmod>${route.lastmod}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`

const rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>Engineering Notes</title>\n    <link>${xml(siteUrl)}/</link>\n    <atom:link href="${xml(siteUrl)}/rss.xml" rel="self" type="application/rss+xml" />\n    <description>AI/ML and software engineering articles for production-minded builders.</description>\n    <language>en-us</language>\n${published.map((article) => `    <item>\n      <title>${xml(article.title)}</title>\n      <link>${xml(absolute(`/article/${article.id}`))}</link>\n      <guid>${xml(absolute(`/article/${article.id}`))}</guid>\n      <description>${xml(article.excerpt)}</description>\n      <category>${xml(article.category)}</category>\n      <pubDate>${new Date(article.scheduledAt || article.date).toUTCString()}</pubDate>\n    </item>`).join('\n')}\n  </channel>\n</rss>\n`

const robots = `User-agent: *\nAllow: /\nDisallow: /cms\n\nSitemap: ${siteUrl}/sitemap.xml\n`

rmSync('dist', { recursive: true, force: true })
mkdirSync('dist', { recursive: true })
cpSync('src', join('dist', 'src'), { recursive: true })
cpSync('public', 'dist', { recursive: true })
routes.forEach((route) => writeRouteCopy(route.path))
writeFileSync(join('dist', 'sitemap.xml'), sitemap)
writeFileSync(join('dist', 'rss.xml'), rss)
writeFileSync(join('dist', 'robots.txt'), robots)
console.log(`Static site copied to dist/ with ${routes.length} sitemap URLs.`)
