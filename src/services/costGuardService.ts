import type { SubscriptionTier } from '../types';

export interface QuotaStatus {
  tier: SubscriptionTier;
  usedAiCredits: number;
  totalAiCredits: number;
  remainingAiCredits: number;
  usedStorageBytes: number;
  totalStorageBytes: number;
  alertLevel: 'GREEN' | 'ORANGE' | 'RED';
}

export interface UnitEconomicsSummary {
  mrr: number;
  grossMarginPercent: number;
  costPerUser: number;
  contributionPerUser: {
    free: number;
    pro: number;
    business: number;
  };
  breakEvenUsersCount: number;
  ltvToCacRatio: number;
  variableCostsBreakdown: {
    storeFees: number;
    infrastructure: number;
    aiAndOcr: number;
    bandwidth: number;
  };
}

const COST_GUARD_STORAGE_KEY = 'banonpdf_costguard_quota_v1';

export const TIER_LIMITS: Record<SubscriptionTier, { aiCredits: number; storageBytes: number }> = {
  free: {
    aiCredits: 20,
    storageBytes: 536870912, // 500 MB
  },
  premium: {
    aiCredits: 100,
    storageBytes: 53687091200, // 50 GB
  },
  business: {
    aiCredits: 1000,
    storageBytes: 536870912000, // 500 GB
  },
};

export const getQuotaStatus = (tier: SubscriptionTier = 'free'): QuotaStatus => {
  try {
    const saved = localStorage.getItem(COST_GUARD_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
      const used = parsed.usedAiCredits || 0;
      const remaining = Math.max(0, limits.aiCredits - used);
      
      let alertLevel: 'GREEN' | 'ORANGE' | 'RED' = 'GREEN';
      if (remaining === 0) alertLevel = 'RED';
      else if (remaining <= Math.round(limits.aiCredits * 0.2)) alertLevel = 'ORANGE';

      return {
        tier,
        usedAiCredits: used,
        totalAiCredits: limits.aiCredits,
        remainingAiCredits: remaining,
        usedStorageBytes: parsed.usedStorageBytes || 5000000,
        totalStorageBytes: limits.storageBytes,
        alertLevel,
      };
    }
  } catch (e) {
    console.warn('Unable to parse Cost Guard quota from local storage', e);
  }

  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  return {
    tier,
    usedAiCredits: 3,
    totalAiCredits: limits.aiCredits,
    remainingAiCredits: limits.aiCredits - 3,
    usedStorageBytes: 5000000,
    totalStorageBytes: limits.storageBytes,
    alertLevel: 'GREEN',
  };
};

export const consumeAiCredits = (tier: SubscriptionTier = 'free', amount: number = 1): QuotaStatus => {
  const current = getQuotaStatus(tier);
  const newUsed = current.usedAiCredits + amount;
  
  const updatedData = {
    usedAiCredits: newUsed,
    usedStorageBytes: current.usedStorageBytes,
  };
  localStorage.setItem(COST_GUARD_STORAGE_KEY, JSON.stringify(updatedData));
  
  return getQuotaStatus(tier);
};

export const calculateUnitEconomics = (): UnitEconomicsSummary => {
  // Model based on 2,500 active PRO users, 300 Business users, and 12,000 Free users
  const proSubscribers = 2450;
  const businessSubscribers = 180;
  const proPrice = 8.99; // €/month
  const businessPrice = 19.99; // €/month

  const mrr = (proSubscribers * proPrice) + (businessSubscribers * businessPrice);
  
  const storeFees = mrr * 0.15; // 15% Google/Apple Store commission
  const infrastructure = 1200; // Cloud servers & CDN
  const aiAndOcr = 850; // Gemini & Cloud Vision API costs
  const bandwidth = 350; // Storage & traffic

  const totalVariableCosts = storeFees + infrastructure + aiAndOcr + bandwidth;
  const netProfit = mrr - totalVariableCosts;
  const grossMarginPercent = Math.round((netProfit / mrr) * 100);

  const totalUsers = proSubscribers + businessSubscribers + 12000;
  const costPerUser = parseFloat((totalVariableCosts / totalUsers).toFixed(3));

  return {
    mrr: Math.round(mrr),
    grossMarginPercent,
    costPerUser,
    contributionPerUser: {
      free: -0.04, // Local-first keeps cost marginal at 0.04€/user
      pro: parseFloat((proPrice * 0.85 - 0.45).toFixed(2)), // Net contribution +7.19€
      business: parseFloat((businessPrice * 0.85 - 1.20).toFixed(2)), // Net contribution +15.79€
    },
    breakEvenUsersCount: Math.ceil(totalVariableCosts / (proPrice * 0.85)),
    ltvToCacRatio: 4.8, // Healthy SaaS target > 3.0
    variableCostsBreakdown: {
      storeFees: Math.round(storeFees),
      infrastructure,
      aiAndOcr,
      bandwidth,
    },
  };
};
