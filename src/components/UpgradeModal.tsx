import React, { useState } from 'react';
import { Subscription, SubscriptionPlan } from '../types';
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Copy,
  CheckCircle2,
  X,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Infinity as InfinityIcon,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatFCFA } from '../utils/formatters';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  onUpdateSubscription: (newSub: Subscription) => void;
  quotesCountThisMonth: number;
  reason?: string; // Optional message explaining why the modal was opened (e.g. quota reached)
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  quotesCountThisMonth,
  reason,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money'>('wave');
  const [paymentPhone, setPaymentPhone] = useState('77 ');
  const [transactionRef, setTransactionRef] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const priceMonthly = 1000;
  const priceYearly = 10000;
  const currentPrice = billingCycle === 'monthly' ? priceMonthly : priceYearly;
  const waveMerchantNumber = '70 475 89 17';
  const omMerchantNumber = '77 999 90 49';

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleActivatePro = (isDirectDemo = false) => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const expiresAt = new Date();
      if (billingCycle === 'monthly') {
        expiresAt.setMonth(now.getMonth() + 1);
      } else {
        expiresAt.setFullYear(now.getFullYear() + 1);
      }

      const updated: Subscription = {
        plan: 'pro',
        activatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        monthlyQuoteLimit: -1,
        maxCatalogItems: -1,
        maxClients: -1,
        customBranding: true,
        eSignature: true,
        billingPeriod: billingCycle,
        paymentMethod: paymentMethod,
        paymentPhone: paymentPhone.trim() || undefined,
        transactionRef: isDirectDemo ? `DEMO-${Date.now().toString().slice(-6)}` : transactionRef.trim() || `SN-${Date.now().toString().slice(-6)}`,
      };

      onUpdateSubscription(updated);
      setIsProcessing(false);
      setSuccessMessage('🎉 Félicitations ! Votre compte est maintenant activé en Formule PRO Illimitée !');
      
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1600);
    }, 600);
  };

  const handleDowngradeToFree = () => {
    const freeSub: Subscription = {
      plan: 'free',
      monthlyQuoteLimit: 3,
      maxCatalogItems: 5,
      maxClients: 5,
      customBranding: false,
      eSignature: false,
    };
    onUpdateSubscription(freeSub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div
        id="upgrade-modal-container"
        className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-6 relative overflow-hidden space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="btn-close-upgrade-modal"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Reason Alert (if opened due to quota) */}
        {reason && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2.5 rounded-xl flex items-start gap-2.5 text-xs">
            <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Quota atteint :</span> {reason}
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black rounded-full uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Offre Spéciale Entrepreneurs Sénégal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Passez à la Formule <span className="text-emerald-600">SunuDevis PRO</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Débloquez les devis illimités, personnalisez votre image de marque et recevez vos acomptes plus rapidement.
          </p>
        </div>

        {/* Current status info */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Statut actuel :</span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                subscription.plan === 'pro'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {subscription.plan === 'pro' ? '👑 PRO ILLIMITÉ' : 'GRATUIT (Découverte)'}
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-600">
            {subscription.plan === 'pro' ? (
              <span className="text-emerald-700 font-bold">Devis illimités</span>
            ) : (
              <span>
                Devis ce mois : <strong>{quotesCountThisMonth} / 3</strong>
              </span>
            )}
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Mensuel : 1 000 FCFA / mois
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Annuel : 10 000 FCFA / an</span>
              <span className="text-[9px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Plan Gratuit */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Gratuit (Découverte)</h3>
                <p className="text-[10px] text-slate-400">Pour tester l'application</p>
              </div>
              <span className="font-black font-mono text-base text-slate-700">0 FCFA</span>
            </div>

            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>3 devis</strong> par mois</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Envoi WhatsApp & calcul FCFA</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Paiements Wave & Orange Money</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">✕</span>
                <span>Max 5 clients & 5 articles</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">✕</span>
                <span>Filigrane SunuDevis sur le PDF</span>
              </li>
            </ul>

            {subscription.plan === 'pro' && (
              <button
                type="button"
                onClick={handleDowngradeToFree}
                className="w-full mt-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg transition"
              >
                Passer en formule Gratuite (Test)
              </button>
            )}
          </div>

          {/* Plan Pro */}
          <div className="p-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/50 space-y-2 text-xs relative shadow-sm">
            <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
              Recommandé
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <div>
                <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Formule PRO</span>
                </h3>
                <p className="text-[10px] text-emerald-700">Artisans & PME ambitieux</p>
              </div>
              <div className="text-right">
                <span className="font-black font-mono text-lg text-emerald-700">
                  {formatFCFA(currentPrice)}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  {billingCycle === 'monthly' ? '/ mois' : '/ an'}
                </span>
              </div>
            </div>

            <ul className="space-y-1.5 text-emerald-900 text-[11px] font-medium">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 font-bold" />
                <span><strong className="text-slate-900">Devis ILLIMITÉS</strong> (sans quota)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 font-bold" />
                <span><strong className="text-slate-900">Clients & Catalogue illimités</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 font-bold" />
                <span><strong>Logo personnalisé & Zéro filigrane</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 font-bold" />
                <span><strong>Cachet & Signature électronique</strong></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 font-bold" />
                <span>Badge Pro officiel sur les devis</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods (Wave / OM) */}
        {subscription.plan !== 'pro' && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Paiement Mobile Money Sénégal ({formatFCFA(currentPrice)}) :
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    paymentMethod === 'wave'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1"><img src="/logoWave.png" alt="Wave" className="w-4 h-4 object-contain" />Wave</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange_money')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    paymentMethod === 'orange_money'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1"><img src="/orangeMonney.png" alt="Orange Money" className="w-4 h-4 object-contain" />Orange Money</span>
                </button>
              </div>
            </div>

            {/* Wave Instructions */}
            {paymentMethod === 'wave' && (
              <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500">Transférez {formatFCFA(currentPrice)} par Wave au numéro :</p>
                    <p className="font-mono font-bold text-sm text-slate-900">{waveMerchantNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(waveMerchantNumber)}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                  >
                    {copiedNumber === waveMerchantNumber ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Votre numéro Wave :
                    </label>
                    <input
                      type="text"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="77 XXX XX XX"
                      className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      N° Transaction / Reçu (Optionnel) :
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ex: TX-984321"
                      className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Orange Money Instructions */}
            {paymentMethod === 'orange_money' && (
              <div className="bg-white p-3 rounded-lg border border-orange-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500">Transférez {formatFCFA(currentPrice)} via OM (ou syntaxe #144#) au :</p>
                    <p className="font-mono font-bold text-sm text-slate-900">{omMerchantNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(omMerchantNumber)}
                    className="px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                  >
                    {copiedNumber === omMerchantNumber ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Votre numéro Orange :
                    </label>
                    <input
                      type="text"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="78 XXX XX XX"
                      className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Code transaction SMS :
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ex: MP240826..."
                      className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {subscription.plan !== 'pro' ? (
            <button
              id="btn-confirm-upgrade-pro"
              type="button"
              disabled={isProcessing}
              onClick={() => handleActivatePro(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>
                {isProcessing
                  ? 'Activation en cours...'
                  : `Valider et Activer la Formule PRO (${formatFCFA(currentPrice)})`}
              </span>
            </button>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800">
              <span className="font-bold">✨ Vous bénéficiez de l'offre PRO ILLIMITÉE !</span>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Valable jusqu'au {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('fr-FR') : 'Renouvellement automatique'}.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sans engagement • Annulation à tout moment</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
