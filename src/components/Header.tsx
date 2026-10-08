import React from 'react';
import { Plus, Crown, Sparkles, FileText, CheckCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/25 ring-4 ring-emerald-50 sm:h-10 sm:w-10">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-[9px] text-amber-950 shadow-sm">
              <CheckCheck className="h-2.5 w-2.5" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm font-black tracking-tight text-slate-900 sm:text-base">
                SunuDevis
              </h1>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-700 sm:text-[9px]">
                PRO
              </span>
              <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 sm:inline-flex">
                🇸🇳 FCFA
              </span>
            </div>
            <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
              Facturation & Devis • Sénégal
            </p>
          </div>
        </div>

        {/* Subscription & Action buttons */}
        <div className="flex items-center justify-end gap-2">
          {/* Pro / Free Plan Badge & Upgrade Button */}
          {isPro ? (
            <button
              id="btn-header-pro-status"
              onClick={onOpenUpgradeModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm shadow-amber-500/30 transition hover:brightness-105"
              title="Gérer votre abonnement PRO"
            >
              <Crown className="h-3.5 w-3.5 text-amber-100" />
              <span>PRO ILLIMITÉ</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 sm:flex">
                <span className="text-slate-400">Quota :</span>
                <span className="font-bold font-mono text-slate-900">
                  {quotesCountThisMonth}/3
                </span>
              </div>
              <button
                id="btn-header-upgrade-pro"
                onClick={onOpenUpgradeModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-800 transition hover:bg-amber-100"
              >
                <Sparkles className="h-3 w-3 text-amber-600" />
                <span>Passer Pro (1 000 F)</span>
              </button>
            </div>
          )}

          {activeTab !== 'editor' && (
            <button
              id="btn-header-new-quote"
              onClick={onNewQuote}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition hover:bg-emerald-700 active:bg-emerald-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nouveau Devis</span>
              <span className="sm:hidden">Créer</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
