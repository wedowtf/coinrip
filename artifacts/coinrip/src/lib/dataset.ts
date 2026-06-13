export type Tier = 'SPARK' | 'FLARE' | 'NOVA' | 'PULSAR' | 'SINGULARITY';

export interface Coin {
  name: string;
  tagline: string;
  marketCap: number;
  tier: Tier;
  logoUrl: string;
  domain: string;
  category: string;
}

const getFavicon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const RAW_COINS = [
  { name: "Alpie", tagline: "An AI workspace that thinks with you", marketCap: 1200000, domain: "alpie.ai", category: "AI Tools" },
  { name: "Orynth", tagline: "Where products find their first users", marketCap: 384800, domain: "orynth.dev", category: "Marketplace" },
  { name: "Moonshift", tagline: "Type your idea. Wake up to a deployed app.", marketCap: 141800, domain: "moonshift.io", category: "Dev Tools" },
  { name: "MangaNow", tagline: "Transform text and videos into manga", marketCap: 75700, domain: "manganow.io", category: "Creative" },
  { name: "MagTapp", tagline: "Browser, PDF, and productivity tools", marketCap: 40400, domain: "magtapp.com", category: "Productivity" },
  { name: "SuzuPay", tagline: "QR code payments, redefined", marketCap: 22000, domain: "suzupay.com", category: "Fintech" },
  { name: "Avocado AI", tagline: "Ship client-ready ads instantly", marketCap: 19700, domain: "avocadoai.co", category: "Marketing" },
  { name: "AVATAR UI", tagline: "Next-gen interface design system", marketCap: 14600, domain: "avatarui.xyz", category: "Design" },
  { name: "Brain", tagline: "Infrastructure for AI agents", marketCap: 11400, domain: "brain.ai", category: "AI Infra" },
  { name: "Relaxsync", tagline: "20-sided roll/rotate meditation tool", marketCap: 10600, domain: "relaxsync.com", category: "Wellness" },
  { name: "Ordina", tagline: "Your 24/7 AI secretary", marketCap: 10300, domain: "ordina.ai", category: "AI Tools" },
  { name: "Degen Terminal", tagline: "AI-powered trading terminal", marketCap: 9200, domain: "degenterminal.xyz", category: "Fintech" },
  { name: "inspireXgrowth", tagline: "AI growth tools for founders", marketCap: 9000, domain: "inspirexgrowth.com", category: "Growth" },
  { name: "Aniverse", tagline: "3D x AI next-gen experience", marketCap: 7600, domain: "aniverse.gg", category: "Creative" },
  { name: "RedCircle", tagline: "Bringing Reddit posts to crypto", marketCap: 7000, domain: "redcircle.com", category: "Social" },
  { name: "FeedRun", tagline: "Feedback forms that actually convert", marketCap: 6400, domain: "feedrun.io", category: "Productivity" },
  { name: "Whitespace", tagline: "Personalized meditation, anywhere", marketCap: 6400, domain: "whitespace.fyi", category: "Wellness" },
  { name: "XScouter AI", tagline: "Don't trust. Verify. Score.", marketCap: 6300, domain: "xscouter.com", category: "AI Tools" },
  { name: "Cofounder Hunt", tagline: "Find your co-founder today", marketCap: 6200, domain: "cofounderhunt.co", category: "Community" },
  { name: "lilAgents", tagline: "Agents you can hire by the task", marketCap: 6200, domain: "lilagents.com", category: "AI Infra" },
];

export const getTier = (marketCap: number): Tier => {
  if (marketCap > 100000) return 'SINGULARITY';
  if (marketCap >= 20000) return 'PULSAR';
  if (marketCap >= 10000) return 'NOVA';
  if (marketCap >= 7000) return 'FLARE';
  return 'SPARK';
};

export const COINS: Coin[] = RAW_COINS.map(c => ({
  ...c,
  tier: getTier(c.marketCap),
  logoUrl: getFavicon(c.domain),
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
    description: '1 random coin • Any tier • Resets every 24h',
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
    description: 'Unknown contents • Standard drop rates',
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
    description: 'For newcomers • Guaranteed FLARE or better',
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
    description: 'Boosted rates • Minimum NOVA tier drop',
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
    description: 'Premium only • PULSAR guaranteed',
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
    description: 'Ultra rare • 80% shot at SINGULARITY',
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
    if (random <= 0) {
      selectedTier = tier;
      break;
    }
  }

  const tierCoins = COINS.filter(c => c.tier === selectedTier);
  if (tierCoins.length === 0) {
    const allTiers: Tier[] = ['SINGULARITY', 'PULSAR', 'NOVA', 'FLARE', 'SPARK'];
    for (const t of allTiers) {
      const fallback = COINS.filter(c => c.tier === t);
      if (fallback.length > 0) return fallback[Math.floor(Math.random() * fallback.length)];
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
