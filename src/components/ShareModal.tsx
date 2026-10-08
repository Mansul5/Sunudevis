import React, { useState } from 'react';
import { Quote, CompanyProfile } from '../types';
import {
  generateWhatsAppMessage,
  getEmailShareUrl,
  shareNativeQuote,
} from '../utils/shareUtils';
import { cleanPhoneForWhatsApp } from '../utils/formatters';
import {
  Send,
  Mail,
  Copy,
  Check,
  Download,
  Share2,
  X,
  MessageSquare,
  Sparkles,
  Phone,
} from 'lucide-react';

interface ShareModalProps {
  quote: Quote;
  company: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: () => void;
  isGeneratingPDF?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  quote,
  company,
  isOpen,
  onClose,
  onDownloadPDF,
  isGeneratingPDF = false,
}) => {
  if (!isOpen) return null;

  const [customPhone, setCustomPhone] = useState(quote.client.phone || '');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(() => generateWhatsAppMessage(quote, company));

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleaned = cleanPhoneForWhatsApp(customPhone);
    const text = encodeURIComponent(message);
    const url = cleaned ? `https://wa.me/${cleaned}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleOpenEmail = () => {
    const url = getEmailShareUrl(quote, company);
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    await shareNativeQuote(quote, company);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-5 shadow-2xl border border-slate-100 my-6 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Partager Devis {quote.quoteNumber}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                WhatsApp, E-mail ou Téléchargement PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Grid Buttons - High Density */}
        <div className="grid grid-cols-2 gap-2">
          {/* WhatsApp Direct */}
          <button
            id="btn-modal-whatsapp"
            onClick={handleOpenWhatsApp}
            className="flex min-h-[42px] items-center justify-center gap-2 p-2.5 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-[11px] transition shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {/* PDF Download */}
          <button
            id="btn-modal-pdf"
            onClick={onDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex min-h-[42px] items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-[11px] transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPDF ? 'Création...' : 'Télécharger PDF'}</span>
          </button>

          {/* Email Direct */}
          <button
            id="btn-modal-email"
            onClick={handleOpenEmail}
            className="flex min-h-[42px] items-center justify-center gap-2 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition"
          >
            <Mail className="w-3.5 h-3.5 text-slate-600" />
            <span>E-mail</span>
          </button>

          {/* Native Phone Share */}
          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <button
              id="btn-modal-native-share"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Autre App</span>
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="flex min-h-[42px] items-center justify-center gap-2 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition"
            >
              <Copy className="w-3.5 h-3.5 text-slate-600" />
              <span>Copier Texte</span>
            </button>
          )}
        </div>

        {/* WhatsApp Phone target field */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Numéro WhatsApp du Client (Sénégal) :
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="Ex : 77 123 45 67 ou +221 78..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold text-slate-900"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Le code pays +221 est automatiquement formaté pour WhatsApp.
          </p>
        </div>

        {/* Message preview area with copy button */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Message formaté prêt à l'envoi
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full p-2.5 bg-slate-50 text-slate-800 text-[11px] font-mono rounded-lg border border-slate-200 focus:bg-white focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">Client : <strong className="text-slate-800">{quote.client.name}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
