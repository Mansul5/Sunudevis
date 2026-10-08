import React, { useState } from 'react';
import { Quote, CompanyProfile, QuoteStatus, Subscription } from '../types';
import { formatFCFA, formatDateFR, calculateQuoteFinancials, formatDisplayPhone } from '../utils/formatters';
import { generateQuotePDF } from '../utils/pdfGenerator';
import { ShareModal } from './ShareModal';
import {
  FileText,
  Plus,
  Search,
  MessageSquare,
  Download,
  Copy,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Sparkles,
  TrendingUp,
  Receipt,
  Eye,
  CheckCircle2,
  Crown,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuoteListProps {
  quotes: Quote[];
  company: CompanyProfile;
  subscription: Subscription;
  quotesCountThisMonth: number;
  onOpenUpgradeModal: (reason?: string) => void;
  onNewQuote: () => void;
  onEditQuote: (quote: Quote) => void;
  onDuplicateQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onUpdateQuoteStatus: (id: string, newStatus: QuoteStatus) => void;
}

export const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  company,
  subscription,
  quotesCountThisMonth,
  onOpenUpgradeModal,
  onNewQuote,
  onEditQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onUpdateQuoteStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [activeShareQuote, setActiveShareQuote] = useState<Quote | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const isPro = subscription.plan === 'pro';
  const freeLimit = subscription.monthlyQuoteLimit || 3;
  const remainingQuotes = Math.max(0, freeLimit - quotesCountThisMonth);
  const isQuotaReached = !isPro && quotesCountThisMonth >= freeLimit;

  // Intercept new quote or duplicate if quota reached
  const handleAttemptNewQuote = () => {
    if (isQuotaReached) {
      onOpenUpgradeModal(`Vous avez utilisé vos ${freeLimit} devis gratuits pour ce mois. Passez en Pro pour créer des devis illimités !`);
    } else {
      onNewQuote();
    }
  };

  const handleAttemptDuplicate = (quote: Quote) => {
    if (isQuotaReached) {
      onOpenUpgradeModal(`Vous avez utilisé vos ${freeLimit} devis gratuits pour ce mois. Passez en Pro pour dupliquer et créer des devis illimités !`);
    } else {
      onDuplicateQuote(quote);
    }
  };

  // Filtered quotes
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.client.name.toLowerCase().includes(search.toLowerCase()) ||
      (q.client.phone && q.client.phone.includes(search)) ||
      (q.client.city && q.client.city.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Financial statistics
  const totalAmountAll = quotes.reduce((acc, q) => acc + calculateQuoteFinancials(q).totalAmount, 0);
  const acceptedQuotes = quotes.filter((q) => q.status === 'accepted' || q.status === 'invoiced');
  const acceptedRate = quotes.length > 0 ? Math.round((acceptedQuotes.length / quotes.length) * 100) : 0;
  const pendingCount = quotes.filter((q) => q.status === 'sent' || q.status === 'draft').length;

  const handleStatusChange = (quote: Quote, newStatus: QuoteStatus) => {
    onUpdateQuoteStatus(quote.id, newStatus);
    if (newStatus === 'accepted') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleDownloadPDFDirect = async (quote: Quote) => {
    onEditQuote(quote); // switch to editor preview to generate or trigger modal
  };

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Brouillon',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Clock,
        };
      case 'sent':
        return {
          label: 'Envoyé',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Send,
        };
      case 'accepted':
        return {
          label: 'Accepté 🎉',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
          icon: CheckCircle,
        };
      case 'rejected':
        return {
          label: 'Refusé',
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: XCircle,
        };
      case 'invoiced':
        return {
          label: 'Facturé',
          bg: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
          icon: Receipt,
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Subscription Quota Banner / Pro Banner */}
      {!isPro ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200/80 p-3 sm:p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-white">
                Formule Découverte
              </span>
              <span className="text-xs font-bold text-slate-800">
                {quotesCountThisMonth} / {freeLimit} devis créés ce mois
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full sm:w-64 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isQuotaReached ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, (quotesCountThisMonth / freeLimit) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {isQuotaReached ? (
                <strong className="text-amber-700">Quota mensuel atteint. Débloquez les devis illimités !</strong>
              ) : (
                <span>Il vous reste <strong>{remainingQuotes} devis</strong> gratuits ce mois-ci.</span>
              )}
            </p>
          </div>

          <button
            id="btn-banner-upgrade-pro"
            onClick={() => onOpenUpgradeModal()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-lg transition shadow-sm shrink-0"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Passer en PRO (1 000 F)</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-3 sm:p-3.5 rounded-xl shadow-sm flex items-center justify-between gap-2 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs text-amber-300 tracking-wide">COMPTE PRO ACTIF</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                  Illimité
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Devis, clients et catalogue illimités • Logo & zéro filigrane
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenUpgradeModal()}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-semibold rounded-lg transition shrink-0"
          >
            Gérer
          </button>
        </div>
      )}

      {/* Metrics Dashboard - High Density */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Total Devis
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 font-mono">{quotes.length}</p>
          <span className="text-[9px] text-slate-500 font-medium">créés sur l'app</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Volume Devisé
          </span>
          <p className="text-xs sm:text-sm font-black font-mono text-emerald-700 mt-0.5 truncate">
            {formatFCFA(totalAmountAll)}
          </p>
          <span className="text-[9px] text-slate-500 font-medium">total propositions</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Taux d'Accord
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 font-mono">{acceptedRate}%</p>
          <span className="text-[9px] text-emerald-600 font-bold">{acceptedQuotes.length} acceptés</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            En Attente
          </span>
          <p className="text-lg sm:text-xl font-black text-amber-600 mt-0.5 font-mono">{pendingCount}</p>
          <span className="text-[9px] text-slate-500 font-medium">à relancer</span>
        </div>
      </div>

      {/* Action and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par N° devis, client, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        <button
          id="btn-list-new-quote"
          onClick={handleAttemptNewQuote}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Devis</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'draft', label: 'Brouillons' },
          { id: 'sent', label: 'Envoyés' },
          { id: 'accepted', label: 'Acceptés' },
          { id: 'invoiced', label: 'Facturés' },
          { id: 'rejected', label: 'Refusés' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quotes Cards List - High Density Cards */}
      <div className="space-y-2.5">
        {filteredQuotes.map((quote) => {
          const financials = calculateQuoteFinancials(quote);
          const statusBadge = getStatusBadge(quote.status);

          return (
            <div
              key={quote.id}
              className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition shadow-sm space-y-2.5"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                    {quote.quoteNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500 font-medium">{formatDateFR(quote.date)}</span>
                </div>

                {/* Status Switcher Selector */}
                <select
                  value={quote.status}
                  onChange={(e) => handleStatusChange(quote, e.target.value as QuoteStatus)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border focus:outline-none cursor-pointer ${statusBadge.bg}`}
                >
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="invoiced">Facturé</option>
                  <option value="rejected">Refusé</option>
                </select>
              </div>

              {/* Client & Financials Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">
                    {quote.client.name || 'Client sans nom'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {quote.client.phone && <span className="font-mono">{formatDisplayPhone(quote.client.phone)} • </span>}
                    <span>{quote.client.city || 'Dakar'}</span>
                  </p>
                </div>

                <div className="sm:text-right flex flex-col justify-center">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Total Devis</span>
                  <span className="font-mono font-black text-emerald-700 text-sm sm:text-base">
                    {formatFCFA(financials.totalAmount)}
                  </span>
                  {quote.depositPercent > 0 && (
                    <span className="text-[10px] text-slate-500 font-medium font-mono">
                      Acompte ({quote.depositPercent}%) : {formatFCFA(financials.depositAmount)}
                    </span>
                  )}
                </div>
              </div>

              {/* Articles preview snippet */}
              <div className="bg-slate-50 p-2 rounded-lg text-xs text-slate-600 space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Articles ({quote.items.length})
                </span>
                <p className="truncate text-slate-700 text-[11px] font-medium">
                  {quote.items.map((i) => `${i.description} (${i.quantity} ${i.unit})`).join(' • ')}
                </p>
              </div>

              {/* Card Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                  {/* WhatsApp share */}
                  <button
                    onClick={() => setActiveShareQuote(quote)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-xs rounded-lg transition shadow-sm w-full sm:w-auto"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Edit / View */}
                  <button
                    onClick={() => onEditQuote(quote)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition w-full sm:w-auto"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ouvrir / PDF</span>
                  </button>
                </div>

                <div className="flex items-center justify-end gap-0.5">
                  {/* Duplicate */}
                  <button
                    onClick={() => handleAttemptDuplicate(quote)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    title="Dupliquer ce devis"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer définitivement le devis ${quote.quoteNumber} ?`)) {
                        onDeleteQuote(quote.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-800 font-bold text-sm">Aucun devis trouvé</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Créez votre premier devis professionnel avec logo, calculs automatiques et envoi WhatsApp.
          </p>
          <button
            onClick={handleAttemptNewQuote}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer mon premier devis</span>
          </button>
        </div>
      )}

      {/* Share Modal */}
      {activeShareQuote && (
        <ShareModal
          quote={activeShareQuote}
          company={company}
          isOpen={true}
          onClose={() => setActiveShareQuote(null)}
          onDownloadPDF={() => {
            onEditQuote(activeShareQuote);
            setActiveShareQuote(null);
          }}
          isGeneratingPDF={isGeneratingPDF}
        />
      )}
    </div>
  );
};
