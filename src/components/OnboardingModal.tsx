import React, { useState } from 'react';
import { Camera, Sparkles, FileText, ArrowRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  onFinish: () => void;
}

export const ONBOARDING_STEPS = [
  {
    icon: Camera,
    iconColor: 'text-blue-400',
    title: 'Détection & Capture Intelligente',
    desc: 'BanonPDF repère automatiquement les bords de vos documents et redresse la perspective en temps réel sans effort.',
  },
  {
    icon: Sparkles,
    iconColor: 'text-amber-400',
    title: 'Filtre Magic Color & Nettoyage',
    desc: 'Blanchit le papier, efface les ombres gênantes et rehausse le texte pour une qualité aussi nette qu\'un scanner à plat.',
  },
  {
    icon: FileText,
    iconColor: 'text-emerald-400',
    title: 'PDF Searchable & OCR Multilingue',
    desc: 'Transformez vos scans papier en PDF recherchables avec calque de texte invisible, export vCard et synchronisation cloud.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const stepData = ONBOARDING_STEPS[currentStep];
  const IconComponent = stepData.icon;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center">
        
        {/* Animated Icon Circle */}
        <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto shadow-2xl">
          <IconComponent className={`w-10 h-10 ${stepData.iconColor}`} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">{stepData.title}</h2>
          <p className="text-slate-400 text-xs leading-relaxed">{stepData.desc}</p>
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-center gap-2">
          {ONBOARDING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                currentStep === idx ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Next / Start Button */}
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Commencer à Scanner' : 'Suivant'}</span>
          {currentStep === ONBOARDING_STEPS.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>

      </div>
    </div>
  );
};
