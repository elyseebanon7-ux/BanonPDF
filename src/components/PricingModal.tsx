import React from 'react';
import { Crown, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SubscriptionTier, UserProfile } from '../types';

interface PricingModalProps {
  user: UserProfile;
  onUpgradeTier: (newTier: SubscriptionTier) => void;
  onClose: () => void;
}

export const PRICING_TIERS = [
  {
    id: 'free' as SubscriptionTier,
    name: 'Gratuit',
    price: '0 €',
    period: 'pour toujours',
    description: 'Numérisation de base illimitée avec filigrane discret.',
    features: [
      'Scans de documents illimités',
      'Filtres de base (N&B, Gris, Original)',
      'Filigrane "BanonPDF Free" sur PDF',
      '5 pages d\'OCR multilingue / mois',
      'Stockage Cloud 500 Mo',
    ],
    disabledFeatures: ['Signature électronique', 'OCR illimité', 'Chiffrement E2EE', 'Mode Équipe & SSO'],
    badgeColor: 'bg-slate-800 text-slate-300',
  },
  {
    id: 'premium' as SubscriptionTier,
    name: 'Premium Pro',
    price: '7.99 €',
    period: '/ mois ou 54.99 € / an',
    description: 'Pour les professionnels exigeants et indépendants.',
    features: [
      'Tout le plan Gratuit sans aucun filigrane',
      'OCR Multilingue illimité (30+ langues)',
      'Searchable PDF/A avec texte invisible',
      'Signature électronique & Tampons officiels',
      'Extraction Carte de visite (.vcf) & Tableau (.csv)',
      'Stockage Cloud 50 Go chiffré',
      'Protections PDF par mot de passe',
    ],
    disabledFeatures: ['SSO SAML & Audit Trail Équipe'],
    popular: true,
    badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold',
  },
  {
    id: 'business' as SubscriptionTier,
    name: 'Business & Équipe',
    price: '19.99 €',
    period: '/ utilisateur / mois',
    description: 'Sécurité Meta-grade, gouvernance et collaboration.',
    features: [
      'Toutes les fonctionnalités Premium',
      'Dossiers partagés en équipe & Permissions',
      'Chiffrement Zero-Trust E2EE AES-256',
      'Journal d\'audit immuable & Conformité RGPD',
      'Authentification SSO SAML & MFA obligatoire',
      'Stockage Cloud Illimité',
      'Support prioritaire 24/7 dédié',
    ],
    disabledFeatures: [],
    badgeColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold',
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({ user, onUpgradeTier, onClose }) => {

  const handleSelectTier = (tier: SubscriptionTier) => {
    onUpgradeTier(tier);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Offres & Abonnements BanonPDF Pro</h2>
              <p className="text-slate-400 text-xs">Choisissez la formule adaptée à vos besoins professionnels</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => {
            const isCurrent = user.tier === tier.id;

            return (
              <div
                key={tier.id}
                className={`relative bg-slate-950 rounded-2xl border p-6 flex flex-col justify-between space-y-6 transition-all ${
                  tier.popular
                    ? 'border-amber-500/80 shadow-2xl shadow-amber-500/10 scale-105'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md">
                    ★ Le Plus Populaire
                  </span>
                )}

                <div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${tier.badgeColor}`}>
                    {tier.name}
                  </span>

                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-slate-400 ml-1">{tier.period}</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">{tier.description}</p>

                  <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                    {tier.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-200">{feat}</span>
                      </div>
                    ))}

                    {tier.disabledFeatures.map((feat) => (
                      <div key={feat} className="flex items-start gap-2 opacity-40">
                        <X className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <span className="text-slate-400 line-through">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTier(tier.id)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-transform active:scale-95 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                      : tier.popular
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-90'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isCurrent ? 'Plan Actuel' : `Passer à ${tier.name}`}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
