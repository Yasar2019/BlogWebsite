export const author = {
  name: 'Alex Morgan',
  role: 'Software Engineer · AI/ML Engineer',
  email: 'hello@example.com',
  linkedin: 'https://www.linkedin.com/',
  github: 'https://github.com/',
}

export const categories = [
  'AI & Machine Learning',
  'Software Engineering',
  'System Design',
  'Cloud & DevOps',
  'Career Growth',
  'Productivity',
  'Data Engineering',
]

export const seedArticles = [
  {
    id: 'rag-systems-production',
    title: 'Designing RAG Systems That Survive Production Traffic',
    subtitle: 'A practical blueprint for retrieval quality, latency budgets, observability, and evaluation loops.',
    excerpt: 'Move beyond prototype demos with a production-minded approach to retrieval-augmented generation systems.',
    category: 'AI & Machine Learning',
    tags: ['RAG', 'LLMs', 'Evaluation', 'Architecture'],
    date: '2026-05-28',
    scheduledAt: '2026-05-28T08:00:00.000Z',
    status: 'published',
    popularity: 98,
    featured: true,
    cover: 'linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #60a5fa 100%)',
    content: `## The production gap

Retrieval augmented generation feels simple in a notebook: chunk documents, embed text, retrieve context, and ask a model to answer. Production systems are different because user traffic exposes every weak assumption: stale documents, ambiguous queries, prompt regressions, latency spikes, and answers that sound confident without being grounded.

The best teams treat RAG as a search product, an ML system, and a backend service at the same time.

## Architecture baseline

A reliable RAG platform usually has four planes:

1. **Ingestion** validates source permissions, normalizes documents, creates chunks, and stores provenance.
2. **Retrieval** combines lexical search, vector search, reranking, and filters.
3. **Generation** applies context packing, citation rules, safety checks, and response formatting.
4. **Evaluation** continuously measures answer quality, grounding, latency, and cost.

\`\`\`python
class RetrievalPlan:
    def __init__(self, query, user_context):
        self.query = query
        self.filters = build_security_filters(user_context)
        self.hybrid_weight = 0.65
        self.max_latency_ms = 650

    def execute(self):
        candidates = hybrid_search(self.query, self.filters)
        reranked = cross_encoder_rerank(self.query, candidates[:80])
        return pack_context(reranked[:8])
\`\`\`

## Evaluation loops

Offline benchmarks help, but production quality improves when you sample real traffic and label failures. Track precision at k, citation coverage, refusal quality, answer usefulness, and unsupported claim rate.

> A RAG system without evaluation is just a prompt with infrastructure.

## Operational checklist

- Cache embeddings and hot retrieval results.
- Version prompts, chunkers, embeddings, and rerankers together.
- Log document IDs used in every answer.
- Separate tenant permissions from prompt instructions.
- Add fallbacks when retrieval confidence is low.

## Final thought

The strongest RAG systems are boring in the best way: observable, measured, secure, and continuously improved.`,
  },
  {
    id: 'system-design-ai-apis',
    title: 'System Design Patterns for AI-Native APIs',
    subtitle: 'How to build APIs that stay reliable when model latency, cost, and non-determinism enter the stack.',
    excerpt: 'Explore queues, caching, idempotency, fallback models, and observability for AI-powered backend services.',
    category: 'System Design',
    tags: ['API Design', 'Reliability', 'LLMOps'],
    date: '2026-05-16',
    scheduledAt: '2026-05-16T08:00:00.000Z',
    status: 'published',
    popularity: 86,
    featured: true,
    cover: 'linear-gradient(135deg, #111827 0%, #334155 50%, #93c5fd 100%)',
    content: `## Why AI APIs are different

Traditional APIs transform deterministic inputs into deterministic outputs. AI-native APIs often depend on external models, probabilistic outputs, and variable latency. That changes reliability engineering.

## Use asynchronous boundaries

If a workflow can take more than a few seconds, give it a job ID and process it asynchronously. This improves retries, cancellation, observability, and customer experience.

\`\`\`js
export async function createAnalysisJob(request) {
  const job = await jobs.insert({
    idempotencyKey: request.headers['idempotency-key'],
    status: 'queued',
    payload: sanitize(request.body),
  })

  await queue.publish('analysis.requested', { jobId: job.id })
  return { jobId: job.id, statusUrl: '/api/jobs/' + job.id }
}
\`\`\`

## Design for graceful degradation

Use fallback models, shorter prompts, cached results, and explicit partial responses. The goal is not perfect uptime from every dependency. The goal is a product experience that remains understandable during degradation.

## Metrics that matter

Track time to first token, total completion latency, token cost per request, retry rate, model error rate, cache hit rate, and human escalation rate.`,
  },
  {
    id: 'developer-productivity-systems',
    title: 'A Senior Engineer’s Productivity System',
    subtitle: 'Simple operating habits for deep work, technical writing, code review, and long-term career growth.',
    excerpt: 'A practical system for managing focus, communication, learning, and execution without productivity theater.',
    category: 'Productivity',
    tags: ['Career', 'Deep Work', 'Writing'],
    date: '2026-05-02',
    scheduledAt: '2026-05-02T08:00:00.000Z',
    status: 'published',
    popularity: 76,
    featured: true,
    cover: 'linear-gradient(135deg, #0f172a 0%, #475569 60%, #e2e8f0 100%)',
    content: `## Productivity is a systems problem

Senior engineering work is less about doing more tasks and more about increasing the quality of decisions. A good productivity system protects attention, makes commitments visible, and creates a durable record of thinking.

## Weekly operating rhythm

- Pick three outcomes that matter.
- Reserve maker blocks before the calendar fills.
- Write decision notes for ambiguous work.
- Batch code reviews twice per day.
- End Friday with a short career journal.

## The writing advantage

Technical writing compounds. It clarifies your ideas, improves team alignment, creates reusable explanations, and builds professional credibility.`,
  },
  {
    id: 'cloud-cost-observability',
    title: 'Cloud Cost Observability for Engineering Teams',
    subtitle: 'Make cloud spend actionable with ownership, service-level metrics, and architectural feedback loops.',
    excerpt: 'Turn cloud cost management into an engineering signal instead of a finance surprise.',
    category: 'Cloud & DevOps',
    tags: ['AWS', 'FinOps', 'Observability'],
    date: '2026-04-20',
    scheduledAt: '2026-04-20T08:00:00.000Z',
    status: 'published',
    popularity: 71,
    featured: false,
    cover: 'linear-gradient(135deg, #082f49 0%, #0369a1 55%, #bae6fd 100%)',
    content: `## Cost is an architecture signal

Cloud cost tells a story about product usage, system design, and operational discipline. Treat it like latency or error rate: visible, owned, and actionable.

## Practical dashboard

Track cost by service, team, environment, customer segment, and request volume. Normalize spend by business units such as cost per active user, cost per workflow, or cost per million events.`,
  },
]
