import { author, categories, seedArticles } from './data/articles.js'

const app = document.querySelector('#root')
const storageKey = 'engineering-blog-articles'
const themeKey = 'engineering-blog-theme'
const bookmarkKey = 'engineering-blog-bookmarks'
const siteUrl = 'https://example.com'

const icons = {
  'AI & Machine Learning': '🧠',
  'Software Engineering': '⌘',
  'System Design': '⚙️',
  'Cloud & DevOps': '☁️',
  'Career Growth': '🧭',
  Productivity: '⚡',
  'Data Engineering': '▦',
}

const state = {
  articles: read(storageKey, seedArticles),
  bookmarks: read(bookmarkKey, []),
  theme: localStorage.getItem(themeKey) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
}

document.documentElement.dataset.theme = state.theme
window.addEventListener('popstate', render)
window.addEventListener('hashchange', render)
window.addEventListener('scroll', updateProgress, { passive: true })

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href]')
  if (!anchor || anchor.target || anchor.hasAttribute('download')) return
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('/rss') || href.startsWith('/sitemap') || href.startsWith('/robots')) return
  if (href.startsWith('#/')) {
    event.preventDefault()
    navigate(href.slice(1))
  } else if (href.startsWith('/')) {
    event.preventDefault()
    navigate(href)
  }
})

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state.articles))
  localStorage.setItem(bookmarkKey, JSON.stringify(state.bookmarks))
}

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[match])
}

function slugify(value) {
  return value.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function readingTime(content = '') {
  return Math.max(1, Math.ceil(content.replace(/[#`>*_\-[\]()]/g, ' ').trim().split(/\s+/).filter(Boolean).length / 220))
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function isPublished(article) {
  return article.status === 'published' && new Date(article.scheduledAt || article.date) <= new Date()
}

function publishedArticles() {
  return state.articles.filter(isPublished).sort((a, b) => new Date(b.date) - new Date(a.date))
}

function route() {
  if (location.hash.startsWith('#/')) {
    const [path, query = ''] = location.hash.slice(1).split('?')
    return { path: path || '/', params: new URLSearchParams(query) }
  }
  return { path: location.pathname === '/index.html' ? '/' : location.pathname, params: new URLSearchParams(location.search) }
}

function navigate(to) {
  history.pushState({}, '', to)
  render()
}

function href(to) {
  return to
}

function setMeta(title, description, type = 'website', image = '/og-image.svg') {
  document.title = title
  const meta = [
    ['name', 'description', description],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:type', type],
    ['property', 'og:image', image],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', image],
  ]
  meta.forEach(([attr, key, content]) => {
    let element = document.querySelector(`meta[${attr}="${key}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attr, key)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  })
  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) canonical.setAttribute('href', `${siteUrl}${route().path === '/' ? '/' : route().path}`)
}

function updateProgress() {
  const bar = document.querySelector('.progress')
  if (!bar) return
  const max = document.documentElement.scrollHeight - innerHeight
  bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`
}

function markdown(source = '') {
  let html = esc(source)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code data-lang="${esc(lang || 'text')}">${esc(code.trim())}</code><button class="copy-code" data-code="${encodeURIComponent(code.trim())}">Copy</button></pre>`)
    .replace(/^## (.+)$/gm, (_, text) => `<h2 id="${slugify(text)}">${text}</h2>`)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\d+\. \*\*(.+?)\*\* (.+)$/gm, '<li><strong>$1</strong> $2</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.split(/\n{2,}/).map((block) => {
    if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<blockquote')) return block
    if (block.includes('<li>')) return `<ul>${block}</ul>`
    return `<p>${block.replace(/\n/g, '<br>')}</p>`
  }).join('')
  return html
}

function layout(content) {
  app.innerHTML = `<div class="progress"></div>${header()}<main>${content}</main>${footer()}`
  bindGlobal()
  updateProgress()
}

function header() {
  const links = [['/', 'Home'], ['/blog', 'Writing'], ['/about', 'About'], ['/contact', 'Contact'], ['/cms', 'CMS']]
  return `<header class="site-header">
    <a href="${href('/')}" class="brand" aria-label="Engineering Notes home"><span class="brand-mark">AI</span><span><strong>Engineering Notes</strong><small>AI/ML · Systems · Career</small></span></a>
    <nav aria-label="Primary navigation">${links.map(([url, label]) => `<a href="${href(url)}">${label}</a>`).join('')}</nav>
    <div class="header-actions"><a class="subscribe-link" href="#newsletter">Subscribe</a><button class="icon-button" id="theme-toggle" aria-label="Toggle color theme">${state.theme === 'dark' ? '☀️' : '🌙'}</button><button class="icon-button menu-button" id="menu-toggle" aria-label="Open menu">☰</button></div>
  </header>`
}

function footer() {
  const schema = { '@context': 'https://schema.org', '@type': 'Blog', name: 'Engineering Notes', url: siteUrl, author: { '@type': 'Person', name: author.name, jobTitle: author.role }, about: categories }
  return `<footer>
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <div><strong>Engineering Notes</strong><p>Field notes for AI/ML, software engineering, cloud systems, and builders who care about production quality.</p></div>
    <div><a href="/rss.xml">RSS</a><a href="/sitemap.xml">Sitemap</a><a href="/robots.txt">Robots</a><a href="${author.linkedin}">LinkedIn</a><a href="${author.github}">GitHub</a></div>
  </footer>`
}

function bindGlobal() {
  document.querySelector('#theme-toggle').onclick = () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = state.theme
    localStorage.setItem(themeKey, state.theme)
  }
  document.querySelector('#menu-toggle').onclick = () => document.querySelector('.site-header nav').classList.toggle('open')
  document.querySelectorAll('#newsletter-form').forEach((form) => {
    form.onsubmit = (event) => {
      event.preventDefault()
      if (!form.querySelector('.success')) form.insertAdjacentHTML('beforeend', '<p class="success">Thanks — you are on the list.</p>')
    }
  })
  document.querySelectorAll('.copy-code').forEach((button) => {
    button.onclick = () => navigator.clipboard.writeText(decodeURIComponent(button.dataset.code)).then(() => { button.textContent = 'Copied' })
  })
}

function sectionHeading(label, title, text) {
  return `<div class="section-heading"><p class="eyebrow">${esc(label)}</p><h2>${esc(title)}</h2><p>${esc(text)}</p></div>`
}

function profileCard() {
  return `<aside class="profile-card" aria-label="Professional profile">
    <div class="avatar"><span>AM</span></div><h2>${author.name}</h2><p>${author.role}</p>
    <div class="metric-row"><span><strong>10+</strong> years engineering</span><span><strong>50k+</strong> readers</span></div>
    <div class="signal-list"><span>✓ Production AI systems</span><span>✓ Cloud-native platforms</span><span>✓ Engineer-to-engineer writing</span></div>
  </aside>`
}

function articleCard(article, horizontal = false) {
  return `<article class="article-card ${horizontal ? 'horizontal' : ''}">
    <a class="cover" href="${href(`/article/${article.id}`)}" style="background:${article.cover}" aria-label="Read ${esc(article.title)}"><span>${esc(article.category)}</span><i></i></a>
    <div class="card-body"><div class="meta"><span>${formatDate(article.date)}</span><span>${readingTime(article.content)} min read</span></div><h3><a href="${href(`/article/${article.id}`)}">${esc(article.title)}</a></h3><p>${esc(article.excerpt)}</p><div class="tag-row">${article.tags.slice(0, 3).map((tag) => `<a href="${href(`/blog?tag=${encodeURIComponent(tag)}`)}">${esc(tag)}</a>`).join('')}</div><p class="author-line">By ${author.name}</p></div>
  </article>`
}

function issueLink(article, index) {
  return `<a class="issue-link" href="${href(`/article/${article.id}`)}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(article.title)}</strong><small>${formatDate(article.date)} · ${readingTime(article.content)} min</small></a>`
}

function featuredStory(article) {
  return `<article class="lead-story"><a class="lead-art" href="${href(`/article/${article.id}`)}" style="background:${article.cover}"><span>${esc(article.category)}</span><i></i></a><div><p class="eyebrow">Lead story</p><h2><a href="${href(`/article/${article.id}`)}">${esc(article.title)}</a></h2><p>${esc(article.excerpt)}</p><div class="meta"><span>${formatDate(article.date)}</span><span>${readingTime(article.content)} min read</span><span>By ${author.name}</span></div><a class="button primary" href="${href(`/article/${article.id}`)}">Read the analysis →</a></div></article>`
}

function home() {
  const articles = publishedArticles()
  const [lead, ...rest] = articles
  setMeta('Engineering Notes | AI/ML & Software Engineering Blog', 'Practical insights on AI, machine learning, software engineering, cloud architecture, and technology innovation.')
  layout(`<section class="publication-hero">
    <div class="masthead"><p class="eyebrow">Independent engineering writing</p><h1>Engineering Notes</h1><p>Deep dives on AI systems, software architecture, cloud operations, and the craft of building reliable products.</p><div class="button-row"><a class="button primary" href="${href('/blog')}">Browse the archive →</a><a class="button secondary" href="#newsletter">Get the newsletter</a></div></div>
    <div class="issue-panel"><div><span>This week</span><strong>${articles.length} field notes</strong></div><div><span>Focus</span><strong>Production AI</strong></div><div><span>Readers</span><strong>50k+</strong></div></div>
  </section>
  <section class="front-page section">${lead ? featuredStory(lead) : ''}<aside class="latest-stack"><p class="eyebrow">Latest dispatches</p>${rest.slice(0, 5).map(issueLink).join('')}<a class="archive-card" href="${href('/blog')}">View every article <span>→</span></a></aside></section>
  <section class="section editorial-section">${sectionHeading('Featured Articles', 'Practical writing for builders', 'A magazine-style selection of essays, tutorials, and decision guides for modern engineering teams.')}<div class="article-grid">${articles.slice(1, 7).map((a) => articleCard(a)).join('')}</div></section>${topics()}${aboutPreview()}${newsletter()}`)
}

function topics() {
  return `<section class="section">${sectionHeading('Topics', 'Focused areas of expertise', 'Browse practical content across the disciplines modern engineers use every day.')}<div class="topic-grid">${categories.map((topic) => `<a class="topic-card" href="${href(`/blog?category=${encodeURIComponent(topic)}`)}"><span>${icons[topic] || '✦'}</span><strong>${topic}</strong><small>Explore →</small></a>`).join('')}</div></section>`
}

function aboutPreview() {
  return `<section class="about-preview section-grid"><div><p class="eyebrow">About</p><h2>Practical engineering lessons from real production work.</h2><p>I am a software engineer and AI/ML practitioner focused on building dependable intelligent systems. My work spans backend platforms, data pipelines, cloud architecture, model integration, and developer productivity.</p><p>My mission is to turn complex technical topics into clear, useful guidance that engineers can apply immediately.</p><a class="button secondary" href="${href('/about')}">Learn More →</a></div><div class="quote-card">“Serious engineering writing should reduce ambiguity, improve judgment, and help teams ship better systems.”</div></section>`
}

function newsletter() {
  return `<section class="newsletter" id="newsletter"><div><p class="eyebrow">Newsletter</p><h2>Stay sharp without the noise.</h2><p>A concise engineering briefing with new essays, production checklists, and research-to-practice notes.</p></div><form id="newsletter-form"><label class="sr-only" for="email">Email address</label><input id="email" type="email" placeholder="you@company.com" required><button class="button primary" type="submit">Subscribe</button></form></section>`
}

function blog() {
  setMeta('Blog | Engineering Notes', 'Search technical articles by title, content, category, tags, date, and popularity.')
  const { params } = route()
  const q = params.get('q') || ''
  const category = params.get('category') || 'All'
  const tag = params.get('tag') || 'All'
  const sort = params.get('sort') || 'Newest First'
  let articles = publishedArticles().filter((article) => [article.title, article.excerpt, article.content, article.category, article.tags.join(' ')].join(' ').toLowerCase().includes(q.toLowerCase()))
  if (category !== 'All') articles = articles.filter((article) => article.category === category)
  if (tag !== 'All') articles = articles.filter((article) => article.tags.includes(tag))
  if (sort === 'Most Popular') articles.sort((a, b) => b.popularity - a.popularity)
  if (sort === 'Shortest Reads') articles.sort((a, b) => readingTime(a.content) - readingTime(b.content))
  const allTags = [...new Set(publishedArticles().flatMap((article) => article.tags))]
  layout(`<section class="section page-section"><div class="blog-hero"><div>${sectionHeading('Knowledge Base', 'Articles for AI/ML and software builders', 'Filter by topic, tag, popularity, or reading time. Every article is written for practical production decisions.')}</div><div class="blog-hero-card"><span>Archive</span><strong>${publishedArticles().length}</strong><small>published pieces</small></div></div><form class="filters" id="filters"><input name="q" value="${esc(q)}" placeholder="Search articles, tags, or concepts"><select name="category"><option>All</option>${categories.map((item) => `<option ${item === category ? 'selected' : ''}>${item}</option>`).join('')}</select><select name="tag"><option>All</option>${allTags.map((item) => `<option ${item === tag ? 'selected' : ''}>${item}</option>`).join('')}</select><select name="sort">${['Newest First', 'Most Popular', 'Shortest Reads'].map((item) => `<option ${item === sort ? 'selected' : ''}>${item}</option>`).join('')}</select><button class="button primary">Search</button></form><div class="article-list">${articles.length ? articles.map((a) => articleCard(a, true)).join('') : '<p class="empty">No articles match your filters yet.</p>'}</div></section>`)
  document.querySelector('#filters').onsubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.target)
    navigate(`/blog?${new URLSearchParams(data).toString()}`)
  }
}

function articlePage(id) {
  const article = state.articles.find((item) => item.id === id && isPublished(item))
  if (!article) {
    setMeta('Article not found | Engineering Notes', 'The requested article could not be found.')
    layout(`<section class="section page-section"><p class="empty">Article not found. <a href="${href('/blog')}">Browse all articles</a>.</p></section>`)
    return
  }
  setMeta(`${article.title} | Engineering Notes`, article.excerpt, 'article')
  const headings = [...article.content.matchAll(/^## (.+)$/gm)].map((match) => match[1])
  const bookmarked = state.bookmarks.includes(article.id)
  layout(`<article><section class="article-hero" style="--article-cover:${article.cover}"><p class="eyebrow">${esc(article.category)}</p><h1>${esc(article.title)}</h1><p>${esc(article.subtitle)}</p><div class="article-meta meta"><span>${formatDate(article.date)}</span><span>${readingTime(article.content)} min read</span><span>By ${author.name}</span></div><div class="tag-row centered">${article.tags.map((tag) => `<a href="${href(`/blog?tag=${encodeURIComponent(tag)}`)}">${esc(tag)}</a>`).join('')}</div><button class="button secondary" id="bookmark">${bookmarked ? '★ Saved' : '☆ Save article'}</button></section><section class="article-shell"><aside class="toc"><strong>On this page</strong>${headings.map((heading) => `<a href="#${slugify(heading)}">${esc(heading)}</a>`).join('')}</aside><div class="prose">${markdown(article.content)}</div><aside class="share"><span>Share</span><a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(location.href)}">LinkedIn</a><a href="mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(location.href)}">Email</a></aside></section><section class="comments section"><h2>Discussion</h2><form><textarea placeholder="Add a thoughtful comment"></textarea><button class="button secondary">Post Comment</button></form></section></article>`)
  document.querySelector('#bookmark').onclick = () => {
    state.bookmarks = bookmarked ? state.bookmarks.filter((item) => item !== article.id) : [...state.bookmarks, article.id]
    save()
    articlePage(id)
  }
}

function about() {
  setMeta('About | Engineering Notes', 'Professional profile, technical expertise, projects, and background for Alex Morgan.')
  const skills = ['LLM application architecture', 'RAG and evaluation systems', 'Backend platform design', 'Cloud-native delivery', 'Data pipelines', 'Observability', 'Technical leadership', 'Developer productivity', 'Technical writing']
  layout(`<section class="section page-section about">${sectionHeading('About', `${author.name}: AI/ML and software engineering`, 'A practical profile for engineering teams, founders, and technical readers.')}${profileCard()}<div class="timeline">${[['2026', 'Writing practical AI/ML and software engineering field notes for production builders.'], ['2024', 'Led cloud-native backend initiatives across data-intensive services.'], ['2020', 'Built production ML workflows, data pipelines, and developer tooling.'], ['2016', 'Started professional software engineering journey in backend systems.']].map(([year, text]) => `<div><strong>${year}</strong><p>${text}</p></div>`).join('')}</div>${sectionHeading('Expertise', 'Core technical strengths', 'A cross-functional foundation for AI-native products and platforms.')}<div class="skill-grid">${skills.map((skill) => `<span>${skill}</span>`).join('')}</div>${sectionHeading('Projects', 'Featured project themes', 'Representative work across AI, cloud, data, and engineering enablement.')}<div class="project-grid">${['LLM Evaluation Platform', 'Cloud Cost Intelligence Dashboard', 'Real-time Data Pipeline', 'Developer Productivity Toolkit'].map((project) => `<div class="project-card"><h3>🚀 ${project}</h3><p>Designed for reliability, maintainability, and measurable product impact.</p></div>`).join('')}</div><section class="cta-panel"><h2>Interested in collaborating?</h2><p>Reach out for engineering leadership, AI platform, or technical writing conversations.</p><a class="button primary" href="${href('/contact')}">Contact Me</a></section></section>`)
}

function contact() {
  setMeta('Contact | Engineering Notes', 'Contact form and professional links for LinkedIn, GitHub, email, and resume.')
  layout(`<section class="section page-section contact">${sectionHeading('Contact', 'Let’s talk engineering', 'Use the form or connect through professional channels.')}<div class="contact-grid"><form class="contact-form" id="contact-form"><input placeholder="Name" required><input type="email" placeholder="Email" required><input placeholder="Subject" required><textarea placeholder="How can I help?" required></textarea><button class="button primary">Send Message</button></form><div class="contact-card"><a href="${author.linkedin}">in LinkedIn</a><a href="${author.github}">⌘ GitHub</a><a href="mailto:${author.email}">✉ Email</a><a href="/resume.pdf">⇣ Resume download</a></div></div></section>`)
  document.querySelector('#contact-form').onsubmit = (event) => {
    event.preventDefault()
    alert('Thanks for reaching out!')
  }
}

function cms() {
  setMeta('CMS | Engineering Notes', 'Create, edit, delete, draft, schedule, categorize, tag, and feature Markdown articles.')
  const { params } = route()
  const editing = state.articles.find((article) => article.id === params.get('edit'))
  const form = editing || { title: '', subtitle: '', excerpt: '', category: categories[0], tags: [], date: new Date().toISOString().slice(0, 10), scheduledAt: new Date().toISOString().slice(0, 16), status: 'draft', featured: false, cover: 'linear-gradient(135deg, #0f172a, #2563eb)', content: '## Introduction\n\nWrite your article in Markdown.' }
  layout(`<section class="section page-section cms">${sectionHeading('CMS', 'Markdown publishing workspace', 'Create article, edit article, delete article, manage drafts, scheduled publishing, categories, tags, and featured posts.')}<form class="cms-form" id="cms-form"><input name="title" value="${esc(form.title)}" placeholder="Title" required><input name="subtitle" value="${esc(form.subtitle)}" placeholder="Subtitle"><textarea name="excerpt" placeholder="Short summary" required>${esc(form.excerpt)}</textarea><div class="form-row"><select name="category">${categories.map((category) => `<option ${category === form.category ? 'selected' : ''}>${category}</option>`).join('')}</select><input name="tags" value="${esc(Array.isArray(form.tags) ? form.tags.join(', ') : form.tags)}" placeholder="Tags comma-separated"><input name="date" type="date" value="${form.date}"></div><div class="form-row"><select name="status"><option ${form.status === 'draft' ? 'selected' : ''}>draft</option><option ${form.status === 'published' ? 'selected' : ''}>published</option></select><input name="scheduledAt" type="datetime-local" value="${(form.scheduledAt || '').slice(0, 16)}"><label class="check"><input name="featured" type="checkbox" ${form.featured ? 'checked' : ''}> Featured</label></div><textarea name="content" class="markdown-editor">${esc(form.content)}</textarea><button class="button primary">✎ Save Article</button></form><div class="cms-list">${state.articles.map((article) => `<div><div><strong>${esc(article.title)}</strong><p>${article.status} · ${article.category} · ${formatDate(article.date)}</p></div><a class="button secondary" href="${href(`/cms?edit=${article.id}`)}">Edit</a><button class="button danger" data-delete="${article.id}">Delete</button></div>`).join('')}</div></section>`)
  document.querySelector('#cms-form').onsubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.target)
    const item = { ...form, title: data.get('title'), subtitle: data.get('subtitle'), excerpt: data.get('excerpt'), category: data.get('category'), tags: data.get('tags').split(',').map((tag) => tag.trim()).filter(Boolean), date: data.get('date'), scheduledAt: new Date(data.get('scheduledAt')).toISOString(), status: data.get('status'), featured: Boolean(data.get('featured')), content: data.get('content'), id: form.id || slugify(data.get('title')), popularity: form.popularity || 0, cover: form.cover }
    state.articles = state.articles.some((article) => article.id === item.id) ? state.articles.map((article) => article.id === item.id ? item : article) : [item, ...state.articles]
    save()
    navigate('/blog')
  }
  document.querySelectorAll('[data-delete]').forEach((button) => {
    button.onclick = () => {
      state.articles = state.articles.filter((article) => article.id !== button.dataset.delete)
      save()
      cms()
    }
  })
}

function render() {
  const { path } = route()
  scrollTo({ top: 0, behavior: 'instant' })
  if (path === '/blog') return blog()
  if (path.startsWith('/article/')) return articlePage(path.split('/').pop())
  if (path === '/about') return about()
  if (path === '/contact') return contact()
  if (path === '/cms') return cms()
  return home()
}

render()
