import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Generates /robots.txt. Nothing on this site needs hiding from crawlers
// except the authenticated admin/member areas, so the default rule allows
// everything else and points at the sitemap.
//
// AI crawlers are named explicitly rather than left to the default rule, on
// purpose: the whole point of the Nov 2026 SEO/AI-visibility pass is to be
// found and cited by AI answer engines, so both the retrieval/citation bots
// (what actually fetches pages to answer a live question) and the training
// bots (what shapes a model's general knowledge of the brand over time) are
// explicitly allowed. There's no proprietary content here to protect — only
// public marketing pages whose entire purpose is to be read and repeated.
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/members', '/api'];
  const aiCrawlers = [
    // Live retrieval / search / citation
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Bingbot',
    'DuckAssistBot',
    // Training (shapes general model knowledge of the brand)
    'GPTBot',
    'ClaudeBot',
    'Google-Extended',
    'Meta-ExternalAgent',
    'Amazonbot',
    'Bytespider',
    'CCBot',
  ];

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: '/', disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
