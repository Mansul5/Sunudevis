import React from 'react';
import { Plus, Crown, Sparkles } from 'lucide-react';
import { Subscription } from '../types';

interface HeaderProps {
  activeTab: string;
  onNewQuote: () => void;
  quotesCount: number;
  subscription: Subscription;
  quotesCountThisMonth: number;
  onOpenUpgradeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNewQuote,
  subscription,
  quotesCountThisMonth,
  onOpenUpgradeModal,
}) => {
  const isPro = subscription.plan === 'pro';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-emerald-600/20 shrink-0">
            SD
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base italic">
                SunuDevis <span className="text-emerald-600 not-italic font-extrabold">Pro</span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/70 uppercase tracking-wide">
                🇸🇳 FCFA
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block font-medium">
              Facturation & Devis Haute Densité • Sénégal
            </p>
          </div>
        </div>

        {/* Subscription & Action buttons */}
        <div className="flex items-center gap-2">
          {/* Pro / Free Plan Badge & Upgrade Button */}
          {isPro ? (
            <button
              id="btn-header-pro-status"
              onClick={onOpenUpgradeModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-black rounded-lg transition shadow-sm"
              title="Gérer votre abonnement PRO"
            >
              <Crown className="w-3.5 h-3.5 text-amber-200" />
              <span>PRO ILLIMITÉ</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="hidden xs:flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-700">
                <span className="text-slate-400">Quota :</span>
                <span className="font-bold font-mono text-slate-900">
                  {quotesCountThisMonth}/3
                </span>
              </div>
              <button
                id="btn-header-upgrade-pro"
                onClick={onOpenUpgradeModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-800 border border-amber-300 text-[11px] font-bold rounded-lg transition shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Passer Pro (1 000 F)</span>
              </button>
            </div>
          )}

          {activeTab !== 'editor' && (
            <button
              id="btn-header-new-quote"
              onClick={onNewQuote}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm shadow-emerald-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouveau Devis</span>
              <span className="sm:hidden">Créer</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
