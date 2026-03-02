const express = require('express');
const { body, validationResult } = require('express-validator');
const config = require('../config');

const router = express.Router();

const SMAJ_CONTEXT = [
  'You are the official SMAJ PI HUB AI Assistant.',
  'Answer only about SMAJ PI HUB platform, pages, services, wallet flow, dashboard, and support.',
  'If user asks unrelated topics, politely redirect to SMAJ PI HUB help.',
  'Keep answers concise, practical, and accurate to available platform pages.',
  'Useful pages:',
  '- Home: index.html',
  '- Services: pages/service.html',
  '- Pricing: pages/pricing.html',
  '- How it works: pages/how-it-works.html',
  '- FAQ: pages/faq.html',
  '- Contact: pages/contact.html',
  '- Dashboard: pages/dashboard/client.html',
  '- Legal: pages/legal/privacy.html, pages/legal/terms.html, pages/legal/cookie.html, pages/legal/report.html'
].join('\n');

const localKnowledgeBase = [
  {
    keywords: ['service', 'services', 'jobs', 'store', 'health', 'education', 'transport', 'charity', 'housing', 'ecosystem'],
    answer: 'SMAJ PI HUB services are listed on the Services page. You can access jobs, store, healthcare, education, transport, housing, charity, and more at `pages/service.html`.'
  },
  {
    keywords: ['pricing', 'price', 'plan', 'plans', 'cost', 'payment'],
    answer: 'You can check package details and platform pricing at `pages/pricing.html`.'
  },
  {
    keywords: ['wallet', 'connect', 'pi wallet', 'pi coin', 'balance'],
    answer: 'Use the Connect Wallet button in the top navigation. After wallet connection, protected dashboard features become available.'
  },
  {
    keywords: ['dashboard', 'profile', 'finance', 'orders', 'analytics', 'notification', 'security'],
    answer: 'Dashboard includes Overview, Profile, Wallet & Finance, Ecosystem, Orders, Jobs, Notifications, Analytics, and Security at `pages/dashboard/client.html`.'
  },
  {
    keywords: ['contact', 'support', 'help', 'team', 'email'],
    answer: 'Use the Contact page to submit support requests: `pages/contact.html`.'
  },
  {
    keywords: ['faq', 'question', 'questions', 'common issue'],
    answer: 'For common user questions, check `pages/faq.html`.'
  },
  {
    keywords: ['legal', 'privacy', 'terms', 'cookie', 'report abuse'],
    answer: 'Legal documents are available under pages/legal: Privacy, Terms, Cookie Policy, and Report Abuse.'
  }
];

function normalizeText(value) {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function getLocalReply(message) {
  const q = normalizeText(message);

  let best = null;
  let bestScore = 0;

  for (const item of localKnowledgeBase) {
    const score = item.keywords.reduce((acc, keyword) => acc + (q.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (best && bestScore > 0) return best.answer;

  if (q.includes('hi') || q.includes('hello')) {
    return 'Hello. Ask me about SMAJ PI HUB services, dashboard, wallet, pricing, support, or legal pages.';
  }

  return 'I can help with SMAJ PI HUB pages, services, wallet flow, dashboard access, pricing, and support. Please ask a specific SMAJ PI HUB question.';
}

function formatHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => item && typeof item.content === 'string' && item.content.trim())
    .slice(-8)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: [{ type: 'input_text', text: item.content.trim().slice(0, 1200) }]
    }));
}

async function getOpenAIReply({ message, history }) {
  if (!config.openai.apiKey) return null;

  const input = [
    { role: 'system', content: [{ type: 'input_text', text: SMAJ_CONTEXT }] },
    ...formatHistory(history),
    { role: 'user', content: [{ type: 'input_text', text: message }] }
  ];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openai.apiKey}`
    },
    body: JSON.stringify({
      model: config.openai.model,
      input
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || 'OpenAI API request failed';
    throw new Error(message);
  }

  const reply = (payload.output_text || '').trim();
  return reply || null;
}

router.post(
  '/assistant',
  [
    body('message').isString().trim().isLength({ min: 1, max: 1200 }),
    body('history').optional().isArray({ max: 10 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request payload.',
        errors: errors.array()
      });
    }

    const message = req.body.message.trim();
    const history = Array.isArray(req.body.history) ? req.body.history : [];

    try {
      const openAIReply = await getOpenAIReply({ message, history });
      if (openAIReply) {
        return res.status(200).json({
          success: true,
          source: 'openai',
          reply: openAIReply
        });
      }
    } catch (error) {
      if (config.nodeEnv === 'development') {
        console.warn('[assistant] OpenAI failed, using fallback:', error.message);
      }
    }

    return res.status(200).json({
      success: true,
      source: 'fallback',
      reply: getLocalReply(message)
    });
  }
);

module.exports = router;
