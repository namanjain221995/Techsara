/**
 * One-time migration script.
 * Reads hardcoded articles from TrendsPageClient data
 * and POSTs them to /api/articles.
 *
 * Run with: npx ts-node scripts/migrate-articles.ts
 * Run ONCE only — check S3 after to confirm.
 */

const BASE_URL = 'http://localhost:3000';

// Hardcoded articles data — copied exactly from TrendsPageClient.tsx trendCategories
const hardcodedArticles = [
  // DATA & AI
  {
    title: 'AI-powered reliability: How utilities are improving reliability with data',
    categoryLabel: 'THOUGHT LEADERSHIP',
    sectionId: 'data-ai',
    excerpt: 'From load forecasting to fault prediction, modern utilities are turning telemetry into uptime. We break down the AI patterns that deliver measurable reliability gains.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'neural',
    visual: 'mesh-a',
  },
  {
    title: 'Applied AI in Banking: How 4 powerful use cases are driving growth',
    categoryLabel: 'THOUGHT LEADERSHIP',
    sectionId: 'data-ai',
    excerpt: 'Applied AI is redefining how banks operate, from intelligent automation to real-time fraud detection and hyper-personalized services across customer service, risk and compliance.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'bars',
    visual: 'wave-a',
  },
  {
    title: 'Improving cold-chain management and reducing food waste with Databricks and AI',
    categoryLabel: 'SUCCESS STORY',
    sectionId: 'data-ai',
    excerpt: "A global distributor combined IoT telemetry with ML on Databricks to cut spoilage 28% across 14 markets - here's the architecture and the operational change behind the number.",
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'stream',
    visual: 'glow-a',
  },
  // CLOUD
  {
    title: 'Migrating on-premises systems to AWS cloud: A reference playbook',
    categoryLabel: 'THOUGHT LEADERSHIP',
    sectionId: 'cloud',
    excerpt: 'Seven sequencing decisions that determine whether your AWS migration ships in 6 months or 18 - and how to avoid the silent cost traps that drain ROI after go-live.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'cloud',
    visual: 'circuit-a',
  },
  {
    title: 'Hybrid edge deployment cuts inference latency by 60% for a manufacturer',
    categoryLabel: 'SUCCESS STORY',
    sectionId: 'cloud',
    excerpt: 'A regional manufacturer moved AI inference to the edge while keeping training centralized - the architecture, the cost math, and the operating model behind the decision.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'mesh',
    visual: 'mesh-b',
  },
  {
    title: 'Cost optimization patterns for cloud-native AI workloads',
    categoryLabel: 'THOUGHT LEADERSHIP',
    sectionId: 'cloud',
    excerpt: 'GPU spend is the new database spend. Five patterns we use to keep training and inference budgets predictable without throttling the science team or compromising latency.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'bars',
    visual: 'wave-b',
  },
  // GENERATIVE AI
  {
    title: 'Preparing your organization for generative AI',
    categoryLabel: 'THOUGHT LEADERSHIP',
    sectionId: 'genai',
    excerpt: 'The readiness checklist that separates pilots from production: data, policy, evaluation and change-management decisions you must make before the first prompt ships.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'spark',
    visual: 'glow-b',
  },
  {
    title: 'RAG, fine-tuning, or both? Choosing your GenAI strategy',
    categoryLabel: 'THOUGHT LEADERSHIP',
    sectionId: 'genai',
    excerpt: "Decision framework with cost, latency and accuracy trade-offs - including when 'just use a bigger model' actually beats both options for your workload.",
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'neural',
    visual: 'mesh-c',
  },
  {
    title: 'Custom LLM cuts knowledge-search time from hours to seconds at an insurance carrier',
    categoryLabel: 'SUCCESS STORY',
    sectionId: 'genai',
    excerpt: "Domain-grounded LLM deployed inside the customer's private network, with citation guarantees and an evaluation harness that keeps regressions out of production.",
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'lens',
    visual: 'circuit-b',
  },
  // INDUSTRY SOLUTIONS
  {
    title: 'Computer vision quality control in pharmaceutical manufacturing',
    categoryLabel: 'SUCCESS STORY',
    sectionId: 'industry',
    excerpt: 'Inline defect detection deployed across three lines at 99.4% precision, with a closed-loop feedback path back into the regulatory audit trail.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'lens',
    visual: 'wave-c',
  },
  {
    title: 'AI-driven fraud detection in real-time payment systems',
    categoryLabel: 'THOUGHT LEADERSHIP',
    sectionId: 'industry',
    excerpt: 'Why batch scoring still loses to streaming, and how to design feature pipelines that survive both the spike day and the auditor - without forklift-upgrading the core.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'stream',
    visual: 'glow-c',
  },
  {
    title: 'Predictive maintenance: How AI is transforming energy operations',
    categoryLabel: 'THOUGHT LEADERSHIP',
    sectionId: 'industry',
    excerpt: 'Asset health from vibration, temperature and acoustic telemetry - the modeling pipeline and the org changes that make alerts actually actionable in the field.',
    type: 'article',
    status: 'published',
    coverImage: '',
    art: 'gauge',
    visual: 'circuit-c',
  },
];

async function migrate() {
  console.log(`Migrating ${hardcodedArticles.length} articles...`);

  for (const article of hardcodedArticles) {
    try {
      const res = await fetch(`${BASE_URL}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Note: this requires admin session cookie
        // Run this while logged into /auth in the same browser
        // OR temporarily remove auth check from POST for migration
        body: JSON.stringify({
          ...article,
          content: `<p>${article.excerpt}</p>`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        console.log(`✅ Migrated: ${article.title}`);
      } else {
        console.log(`❌ Failed: ${article.title} — ${data.message}`);
      }
    } catch (err) {
      console.log(`❌ Error: ${article.title}`, err);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('Migration complete. Check S3 articles/index.json');
}

migrate();
