export type Tier = 'SPARK' | 'FLARE' | 'NOVA' | 'PULSAR' | 'SINGULARITY';

export interface Coin {
  name: string;
  tagline: string;
  marketCap: number;
  tier: Tier;
}

const RAW_COINS = [
  { name: "Alpie", tagline: "An AI workspace", marketCap: 1200000 },
  { name: "Orynth", tagline: "Where products find their first users", marketCap: 384800 },
  { name: "Moonshift", tagline: "Type your idea. Wake up to a deployed app.", marketCap: 141800 },
  { name: "MangaNow", tagline: "Transform text, videos into manga", marketCap: 75700 },
  { name: "MagTapp", tagline: "Browser, PDF, and productivity tools", marketCap: 40400 },
  { name: "SuzuPay", tagline: "QR code payments", marketCap: 22000 },
  { name: "Avocado AI", tagline: "Ship client-ready ads instantly", marketCap: 19700 },
  { name: "AVATAR UI", tagline: "Next-gen interface", marketCap: 14600 },
  { name: "Brain", tagline: "Infrastructure for AI agents", marketCap: 11400 },
  { name: "Relaxsync", tagline: "20-sided roll/rotate meditation tool", marketCap: 10600 },
  { name: "Ordina", tagline: "Your 24/7 AI secretary", marketCap: 10300 },
  { name: "Degen Terminal", tagline: "AI trading terminal", marketCap: 9200 },
  { name: "inspireXgrowth", tagline: "AI growth tools", marketCap: 9000 },
  { name: "Aniverse", tagline: "3D x AI next-gen experience", marketCap: 7600 },
  { name: "RedCircle", tagline: "Bringing Reddit posts to crypto", marketCap: 7000 },
  { name: "FeedRun", tagline: "Feedback forms", marketCap: 6400 },
  { name: "Whitespace", tagline: "Personalized meditation", marketCap: 6400 },
  { name: "XScouter AI", tagline: "Don't trust, verify, score", marketCap: 6300 },
  { name: "Cofounder Hunt", tagline: "Find your co-founder", marketCap: 6200 },
  { name: "lilAgents", tagline: "Agents you can hire", marketCap: 6200 }
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
  tier: getTier(c.marketCap)
}));

const TIER_WEIGHTS: Record<Tier, number> = {
  'SPARK': 45,
  'FLARE': 30,
  'NOVA': 15,
  'PULSAR': 8,
  'SINGULARITY': 2
};

export const getRandomCoin = (): Coin => {
  const totalWeight = Object.values(TIER_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  let selectedTier: Tier = 'SPARK';
  for (const [tier, weight] of Object.entries(TIER_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      selectedTier = tier as Tier;
      break;
    }
  }

  const tierCoins = COINS.filter(c => c.tier === selectedTier);
  if (tierCoins.length === 0) return COINS[0]; // fallback
  return tierCoins[Math.floor(Math.random() * tierCoins.length)];
};