import { LOGO_MAP } from '@/lib/logos';

export type Tier = 'SPARK' | 'FLARE' | 'NOVA' | 'PULSAR' | 'SINGULARITY';

export interface Coin {
  name: string;
  ticker: string;
  tagline: string;
  marketCap: number;
  tier: Tier;
  logoUrl: string;
  category: string;
}

const RAW_COINS = [
  { name: 'Alpie',          ticker: '$ALPIE', tagline: 'An AI workspace that thinks with you',         marketCap: 1200000, category: 'AI Tools' },
  { name: 'Orynth',         ticker: '$ORYN',  tagline: 'Where products find their first users',         marketCap: 384800,  category: 'Marketplace' },
  { name: 'Moonshift',      ticker: '$SHIFT', tagline: 'Type your idea. Wake up to a deployed app.',    marketCap: 141800,  category: 'Dev Tools' },
  { name: 'MangaNow',       ticker: '$MANGA', tagline: 'Transform text and videos into manga',          marketCap: 75700,   category: 'Creative' },
  { name: 'MagTapp',        ticker: '$MAGT',  tagline: 'Browser, PDF, and productivity tools',          marketCap: 40400,   category: 'Productivity' },
  { name: 'SuzuPay',        ticker: '$SUZU',  tagline: 'QR code payments, redefined',                  marketCap: 22000,   category: 'Fintech' },
  { name: 'Avocado AI',     ticker: '$AVO',   tagline: 'Ship client-ready ads instantly',               marketCap: 19700,   category: 'Marketing' },
  { name: 'AVATAR UI',      ticker: '$AVTR',  tagline: 'Next-gen interface design system',              marketCap: 14600,   category: 'Design' },
  { name: 'Brain',          ticker: '$BRAIN', tagline: 'Infrastructure for AI agents',                  marketCap: 11400,   category: 'AI Infra' },
  { name: 'Relaxsync',      ticker: '$RELX',  tagline: '20-sided roll/rotate meditation tool',          marketCap: 10600,   category: 'Wellness' },
  { name: 'Ordina',         ticker: '$ORDI',  tagline: 'Your 24/7 AI secretary',                        marketCap: 10300,   category: 'AI Tools' },
  { name: 'Degen Terminal', ticker: '$DEGEN', tagline: 'AI-powered trading terminal',                   marketCap: 9200,    category: 'Fintech' },
  { name: 'inspireXgrowth', ticker: '$IXG',   tagline: 'AI growth tools for founders',                  marketCap: 9000,    category: 'Growth' },
  { name: 'Aniverse',       ticker: '$ANI',   tagline: '3D x AI next-gen experience',                   marketCap: 7600,    category: 'Creative' },
  { name: 'RedCircle',      ticker: '$RDCL',  tagline: 'Bringing Reddit posts to crypto',               marketCap: 7000,    category: 'Social' },
  { name: 'FeedRun',        ticker: '$FEED',  tagline: 'Feedback forms that actually convert',          marketCap: 6400,    category: 'Productivity' },
  { name: 'Whitespace',     ticker: '$WHITE', tagline: 'Personalized meditation, anywhere',             marketCap: 6400,    category: 'Wellness' },
  { name: 'XScouter AI',    ticker: '$XSCO',  tagline: "Don't trust. Verify. Score.",                   marketCap: 6300,    category: 'AI Tools' },
  { name: 'Cofounder Hunt', ticker: '$CFH',   tagline: 'Find your co-founder today',                    marketCap: 6200,    category: 'Community' },
  { name: 'lilAgents',      ticker: '$LILA',  tagline: 'Agents you can hire by the task',               marketCap: 6200,    category: 'AI Infra' },
];

export const getTier = (marketCap: number): Tier => {
  if (marketCap > 100000) return 'SINGULARITY';
  if (marketCap >= 20000)  return 'PULSAR';
  if (marketCap >= 10000)  return 'NOVA';
  if (marketCap >= 7000)   return 'FLARE';
  return 'SPARK';
};

export const COINS: Coin[] = RAW_COINS.map(c => ({
  ...c,
  tier: getTier(c.marketCap),
  logoUrl: LOGO_MAP[c.name] ?? '',
}));

export type PackId = 'daily' | 'mystery' | 'starter' | 'blazer' | 'cosmic' | 'galaxy';

export interface PackDef {
  id: PackId;
  name: string;
  subtitle: string;
  description: string;
  cost: number;
  color: string;
  shadowColor: string;
  tierWeights: Record<Tier, number>;
  badgeLabel?: string;
  isFreeDaily?: boolean;
}

export const PACKS: PackDef[] = [
  {
    id: 'daily',
    name: 'Free Daily',
    subtitle: 'Pack',
    description: '6 coins • Any tier • Resets every 24h',
    cost: 0,
    color: '#E2FF00',
    shadowColor: 'rgba(226,255,0,0.35)',
    isFreeDaily: true,
    tierWeights: { SPARK: 45, FLARE: 30, NOVA: 15, PULSAR: 8, SINGULARITY: 2 },
  },
  {
    id: 'mystery',
    name: 'Mystery',
    subtitle: 'Pack',
    description: '6 coins • Unknown contents • Standard drop rates',
    cost: 10,
    color: '#D946EF',
    shadowColor: 'rgba(217,70,239,0.35)',
    badgeLabel: 'CLASSIC',
    tierWeights: { SPARK: 45, FLARE: 30, NOVA: 15, PULSAR: 8, SINGULARITY: 2 },
  },
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'Bundle',
    description: '6 coins • Guaranteed FLARE or better',
    cost: 25,
    color: '#F97316',
    shadowColor: 'rgba(249,115,22,0.35)',
    badgeLabel: 'BEGINNER',
    tierWeights: { SPARK: 0, FLARE: 55, NOVA: 30, PULSAR: 12, SINGULARITY: 3 },
  },
  {
    id: 'blazer',
    name: 'Blazer',
    subtitle: 'Pack',
    description: '6 coins • Minimum NOVA tier drop',
    cost: 50,
    color: '#06B6D4',
    shadowColor: 'rgba(6,182,212,0.35)',
    badgeLabel: 'BOOSTED',
    tierWeights: { SPARK: 0, FLARE: 0, NOVA: 60, PULSAR: 30, SINGULARITY: 10 },
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    subtitle: 'Vault',
    description: '6 coins • PULSAR guaranteed every pull',
    cost: 100,
    color: '#A855F7',
    shadowColor: 'rgba(168,85,247,0.45)',
    badgeLabel: 'PREMIUM',
    tierWeights: { SPARK: 0, FLARE: 0, NOVA: 0, PULSAR: 65, SINGULARITY: 35 },
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    subtitle: 'Pull',
    description: '6 coins • 80% shot at SINGULARITY each',
    cost: 200,
    color: '#FBBF24',
    shadowColor: 'rgba(251,191,36,0.5)',
    badgeLabel: '★ ULTRA',
    tierWeights: { SPARK: 0, FLARE: 0, NOVA: 0, PULSAR: 20, SINGULARITY: 80 },
  },
];

const getWeightedCoin = (weights: Record<Tier, number>): Coin => {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  let selectedTier: Tier = 'SPARK';
  for (const [tier, weight] of Object.entries(weights) as [Tier, number][]) {
    random -= weight;
    if (random <= 0) { selectedTier = tier; break; }
  }
  const tierCoins = COINS.filter(c => c.tier === selectedTier);
  if (tierCoins.length === 0) {
    for (const t of ['SINGULARITY', 'PULSAR', 'NOVA', 'FLARE', 'SPARK'] as Tier[]) {
      const fb = COINS.filter(c => c.tier === t);
      if (fb.length) return fb[Math.floor(Math.random() * fb.length)];
    }
    return COINS[0];
  }
  return tierCoins[Math.floor(Math.random() * tierCoins.length)];
};

const DEFAULT_WEIGHTS: Record<Tier, number> = {
  SPARK: 45, FLARE: 30, NOVA: 15, PULSAR: 8, SINGULARITY: 2,
};

export const getRandomCoin = (): Coin => getWeightedCoin(DEFAULT_WEIGHTS);

export const getRandomCoinForPack = (packId: PackId): Coin => {
  const pack = PACKS.find(p => p.id === packId);
  return getWeightedCoin(pack ? pack.tierWeights : DEFAULT_WEIGHTS);
};

export const CATEGORIES = [...new Set(COINS.map(c => c.category))].sort();
