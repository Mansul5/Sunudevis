import React, { useState } from 'react';
import { Quote, CompanyProfile, Client, CatalogItem, QuoteItem, TemplateType, Subscription } from '../types';
import { QuotePreview } from './QuotePreview';
import { ShareModal } from './ShareModal';
import { generateQuotePDF } from '../utils/pdfGenerator';
import { calculateQuoteFinancials, formatFCFA, calculateValidUntil } from '../utils/formatters';
import {
  FileText,
  User,
  Package,
  Plus,
  Trash2,
  Share2,
  Download,
  Eye,
  Edit3,
  Calendar,
  Layers,
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Percent,
  Sliders,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuoteEditorProps {
  quote: Quote;
  company: CompanyProfile;
  subscription: Subscription;
  savedClients: Client[];
  catalog: CatalogItem[];
  onSaveQuote: (quote: Quote) => void;
  onCancel: () => void;
  onAddNewClient: (client: Client) => void;
  onOpenUpgradeModal?: (reason?: string) => void;
}

export const QuoteEditor: React.FC<QuoteEditorProps> = ({
  quote: initialQuote,
  company,
  subscription,
  savedClients,
  catalog,
  onSaveQuote,
  onCancel,
  onAddNewClient,
  onOpenUpgradeModal,
}) => {
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [activeStep, setActiveStep] = useState<'client' | 'items' | 'terms' | 'preview'>('client');
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const isPro = subscription.plan === 'pro';
  const financials = calculateQuoteFinancials(quote);

  // Update client
  const handleClientChange = (field: keyof Client, value: any) => {
    setQuote((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value,
      },
    }));
  };

  // Select existing client from directory
  const handleSelectExistingClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    if (!clientId) return;
    const found = savedClients.find((c) => c.id === clientId);
    if (found) {
      setQuote((prev) => ({
        ...prev,
        client: { ...found },
      }));
    }
  };

  // Date and validity
  const handleValidityChange = (days: number) => {
    const validUntil = calculateValidUntil(quote.date, days);
    setQuote((prev) => ({
      ...prev,
      validityDays: days,
      validUntil,
    }));
  };

  const handleDateChange = (newDate: string) => {
    const validUntil = calculateValidUntil(newDate, quote.validityDays);
    setQuote((prev) => ({
      ...prev,
      date: newDate,
      validUntil,
    }));
  };

  // Items manipulation
  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...quote.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setQuote((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      description: '',
      details: '',
      quantity: 1,
      unit: 'Unité',
      unitPrice: 0,
    };
    setQuote((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (index: number) => {
    if (quote.items.length <= 1) return;
    const newItems = quote.items.filter((_, idx) => idx !== index);
    setQuote((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddCatalogItem = (catalogItem: CatalogItem) => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      description: catalogItem.description,
      details: catalogItem.details,
      quantity: 1,
      unit: catalogItem.unit,
      unitPrice: catalogItem.unitPrice,
    };
    setQuote((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setShowCatalogModal(false);
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const fileName = `Devis_${quote.quoteNumber}_${quote.client.name.replace(/\s+/g, '_') || 'Client'}.pdf`;
    const res = await generateQuotePDF('quote-printable-document', { fileName });
    setIsGeneratingPDF(false);
    if (res.success) {
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    }
  };

  // Save quote and return
  const handleSaveAndExit = () => {
    onSaveQuote({
      ...quote,
      updatedAt: new Date().toISOString(),
    });
    // Auto-save client if has a name and not already saved
    if (quote.client.name && !savedClients.some((c) => c.name.toLowerCase() === quote.client.name.toLowerCase())) {
      onAddNewClient(quote.client);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Top Header with Progress Steps - High Density */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Boutique / Enterprise Mini Banner from High Density Design */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center border-2 border-dashed border-emerald-400 shrink-0 overflow-hidden">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-[9px] text-emerald-800 font-bold">LOGO</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-emerald-900 font-extrabold truncate">
              {company.name || 'Votre Entreprise'}
            </p>
            <p className="text-[11px] text-emerald-700 truncate font-medium">
              {company.slogan || (company.ninea ? `NINEA : ${company.ninea}` : 'Devis professionnel en FCFA')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono font-bold bg-white text-slate-800 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
              {quote.quoteNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 truncate">
            {quote.client.name ? `Devis : ${quote.client.name}` : 'Nouveau Devis'}
          </h2>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="button"
              id="btn-save-quote"
              onClick={handleSaveAndExit}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>

        {/* Stepper Tabs - High Density */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          {[
            { id: 'client', label: 'Client', icon: User },
            { id: 'items', label: 'Articles', icon: Package },
            { id: 'terms', label: 'Modalités', icon: Sliders },
            { id: 'preview', label: 'Aperçu & PDF', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStep === tab.id;
            return (
              <button
                key={tab.id}
                id={`btn-step-${tab.id}`}
                onClick={() => setActiveStep(tab.id as any)}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: CLIENT & INFOS (High Density Layout)
          ───────────────────────────────────────────────────────────── */}
      {activeStep === 'client' && (
        <div className="space-y-3">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Client & Destinataire</span>
              </h3>

              {savedClients.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 hidden sm:inline">Existant :</span>
                  <select
                    onChange={handleSelectExistingClient}
                    className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none text-slate-700"
                    defaultValue=""
                  >
                    <option value="" disabled>Choisir un client...</option>
                    {savedClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || c.city || 'Client'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Type :</span>
              <button
                type="button"
                onClick={() => handleClientChange('type', 'individual')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  quote.client.type === 'individual'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Particulier
              </button>
              <button
                type="button"
                onClick={() => handleClientChange('type', 'company')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  quote.client.type === 'company'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Entreprise / Société
              </button>
            </div>

            {/* High Density Client Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Nom du client ou Société *
                </label>
                <input
                  type="text"
                  required
                  value={quote.client.name}
                  onChange={(e) => handleClientChange('name', e.target.value)}
                  placeholder="Ex : Abdoulaye Diop ou Baobab SARL"
                  className="bg-transparent text-xs font-semibold text-slate-900 w-full outline-none"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Téléphone WhatsApp (Sénégal) *
                </label>
                <input
                  type="text"
                  value={quote.client.phone}
                  onChange={(e) => handleClientChange('phone', e.target.value)}
                  placeholder="Ex : +221 77 123 45 67"
                  className="bg-transparent text-xs font-semibold text-slate-900 w-full outline-none font-mono"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Ville & Quartier
                </label>
                <input
                  type="text"
                  value={quote.client.city || 'Dakar'}
                  onChange={(e) => handleClientChange('city', e.target.value)}
                  placeholder="Ex : Dakar, Sacré-Cœur"
                  className="bg-transparent text-xs font-semibold text-slate-900 w-full outline-none"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  E-mail (Optionnel)
                </label>
                <input
                  type="email"
                  value={quote.client.email || ''}
                  onChange={(e) => handleClientChange('email', e.target.value)}
                  placeholder="client@gmail.com"
                  className="bg-transparent text-xs font-semibold text-slate-900 w-full outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quote Dates & Validity Box - High Density */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Numérotation & Date</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  N° de Devis
                </label>
                <input
                  type="text"
                  value={quote.quoteNumber}
                  onChange={(e) => setQuote({ ...quote, quoteNumber: e.target.value })}
                  className="bg-transparent text-xs font-bold text-slate-900 w-full outline-none font-mono"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Date d'émission
                </label>
                <input
                  type="date"
                  value={quote.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-900 w-full outline-none"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Validité de l'offre
                </label>
                <select
                  value={quote.validityDays}
                  onChange={(e) => handleValidityChange(Number(e.target.value))}
                  className="bg-transparent text-xs font-semibold text-slate-900 w-full outline-none"
                >
                  <option value={7}>7 jours</option>
                  <option value={15}>15 jours (Standard)</option>
                  <option value={30}>30 jours (1 Mois)</option>
                  <option value={60}>60 jours (2 Mois)</option>
                  <option value={90}>90 jours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setActiveStep('items')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              <span>Passer aux Articles & Prix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: ARTICLES & PRIX (High Density Table Pattern)
          ───────────────────────────────────────────────────────────── */}
      {activeStep === 'items' && (
        <div className="space-y-3">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Articles & Lignes du Devis</span>
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {catalog.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCatalogModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg transition border border-emerald-200"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Catalogue</span>
                  </button>
                )}
                <button
                  type="button"
                  id="btn-add-item-top"
                  onClick={handleAddItem}
                  className="text-emerald-600 font-bold text-[10px] border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-50 transition"
                >
                  + Ajouter
                </button>
              </div>
            </div>

            {/* High Density Items Table Container */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-1 border-b border-slate-200 px-3 py-1.5 bg-slate-100/70">
                <div className="col-span-6 text-[9px] font-bold text-slate-500 uppercase">Description / Article</div>
                <div className="col-span-2 text-[9px] font-bold text-slate-500 uppercase text-center">Qté & Unité</div>
                <div className="col-span-2 text-[9px] font-bold text-slate-500 uppercase text-right">Prix Unit.</div>
                <div className="col-span-2 text-[9px] font-bold text-slate-500 uppercase text-right">Total</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-200/80">
                {quote.items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <div
                      key={item.id}
                      className="p-2.5 bg-white hover:bg-slate-50/80 transition space-y-1.5"
                    >
                      <div className="grid grid-cols-12 gap-1.5 items-center">
                        {/* Description */}
                        <div className="col-span-6">
                          <input
                            type="text"
                            required
                            placeholder="Désignation du service ou produit *"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                          />
                        </div>

                        {/* Quantity & Unit */}
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-mono font-bold text-center"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1 py-1 focus:outline-none text-slate-600 shrink-0"
                          >
                            <option value="Unité">U</option>
                            <option value="Forfait">Forf</option>
                            <option value="Heure">H</option>
                            <option value="Jour">J</option>
                            <option value="Mois">Mois</option>
                            <option value="Prestation">Prest</option>
                            <option value="Mètre">m</option>
                            <option value="m²">m²</option>
                            <option value="Kg">kg</option>
                            <option value="Sac">Sac</option>
                            <option value="Carton">Cart</option>
                          </select>
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value) || 0)}
                            className="w-full px-1.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-mono font-bold text-right text-slate-800"
                          />
                        </div>

                        {/* Total & delete */}
                        <div className="col-span-2 flex items-center justify-end gap-1 text-right">
                          <span className="font-mono font-black text-emerald-800 text-[11px] block">
                            {formatFCFA(lineTotal)}
                          </span>
                          {quote.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-slate-300 hover:text-red-600 transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Optional details row */}
                      <div>
                        <input
                          type="text"
                          placeholder="Détails optionnels (spécifications, marque, référence...)"
                          value={item.details || ''}
                          onChange={(e) => handleItemChange(index, 'details', e.target.value)}
                          className="w-full px-2 py-0.5 text-[10px] bg-transparent border-0 border-b border-slate-200 text-slate-500 focus:bg-white focus:outline-none placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              id="btn-add-line"
              onClick={handleAddItem}
              className="w-full py-2 border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-lg text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ajouter une autre ligne</span>
            </button>
          </div>

          {/* Slate-900 High Density Summary Section from Design HTML */}
          <section className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs opacity-70 font-semibold">Total Lignes Brut</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {formatFCFA(financials.subtotalGross)}
              </span>
            </div>
            <div className="h-px bg-white/10 my-2"></div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveStep('preview');
                  setTimeout(() => handleDownloadPDF(), 300);
                }}
                className="flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <span className="text-[8px] uppercase font-bold tracking-wider">PDF Direct</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(true);
                }}
                className="flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="text-[8px] uppercase font-bold tracking-wider text-green-300">WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('terms')}
                className="flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                  <Sliders className="w-4 h-4 text-white" />
                </div>
                <span className="text-[8px] uppercase font-bold tracking-wider text-blue-300">Taxes / Acompte</span>
              </button>
            </div>
          </section>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setActiveStep('client')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('terms')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              <span>Taxes & Modalités</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: TAXES & MODALITÉS (High Density Layout)
          ───────────────────────────────────────────────────────────── */}
      {activeStep === 'terms' && (
        <div className="space-y-3">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Remise, TVA & Acompte</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Remise Globale */}
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Remise Globale (%)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quote.globalDiscountPercent}
                    onChange={(e) => setQuote({ ...quote, globalDiscountPercent: Number(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                {quote.globalDiscountPercent > 0 && (
                  <p className="text-[10px] text-amber-700 font-mono font-bold">
                    -{formatFCFA(financials.globalDiscountAmount)}
                  </p>
                )}
              </div>

              {/* TVA Sénégal 18% */}
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    TVA (18%)
                  </label>
                  <input
                    type="checkbox"
                    checked={quote.applyTax}
                    onChange={(e) => setQuote({ ...quote, applyTax: e.target.checked })}
                    className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {quote.applyTax ? 'Taux officiel 18%' : 'Exonéré / Non assujetti'}
                </p>
                {quote.applyTax && (
                  <p className="text-[10px] text-slate-800 font-mono font-bold">
                    +{formatFCFA(financials.taxAmount)}
                  </p>
                )}
              </div>

              {/* Acompte Requis */}
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Acompte Demandé (%)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quote.depositPercent}
                    onChange={(e) => setQuote({ ...quote, depositPercent: Number(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                {quote.depositPercent > 0 && (
                  <p className="text-[10px] text-emerald-700 font-mono font-bold">
                    Acompte : {formatFCFA(financials.depositAmount)}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery & Conditions */}
            <div className="space-y-2 pt-1">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Modalités de Règlement & Délais
                </label>
                <input
                  type="text"
                  value={quote.paymentTerms || ''}
                  onChange={(e) => setQuote({ ...quote, paymentTerms: e.target.value })}
                  placeholder="Ex : 50% à la commande, solde à la livraison sous 48h."
                  className="bg-transparent text-xs font-semibold text-slate-900 w-full outline-none"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Conditions Particulières / Garantie
                </label>
                <textarea
                  rows={2}
                  value={quote.notes || ''}
                  onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
                  placeholder="Ex : Matériel garanti 1 an. Paiement accepté par Wave et Orange Money."
                  className="bg-transparent text-xs font-semibold text-slate-900 w-full outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setActiveStep('items')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('preview')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Aperçu Final & Export</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 4: APERÇU & ENVOI (PDF + WHATSAPP)
          ───────────────────────────────────────────────────────────── */}
      {activeStep === 'preview' && (
        <div className="space-y-3">
          {/* Action Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
            {/* Template Chooser */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Modèle :</span>
              {[
                { id: 'modern', label: 'Moderne' },
                { id: 'classic', label: 'Classique' },
                { id: 'elegant', label: 'Élégant' },
                { id: 'compact', label: 'Compact' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQuote({ ...quote, template: t.id as TemplateType })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    quote.template === t.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                id="btn-action-whatsapp"
                onClick={() => setShowShareModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                id="btn-action-pdf"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPDF ? 'Création...' : 'Télécharger PDF'}</span>
              </button>
            </div>
          </div>

          {pdfSuccess && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Le devis PDF a été téléchargé avec succès !</span>
            </div>
          )}

          {/* Real-time Rendered Document Container */}
          <div className="bg-slate-200/70 p-3 sm:p-5 rounded-2xl border border-slate-300 overflow-x-auto flex flex-col items-center gap-2">
            {!isPro && onOpenUpgradeModal && (
              <div className="w-full max-w-[800px] bg-amber-50 border border-amber-200/80 p-2 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Version Découverte : Un filigrane discret est ajouté au PDF.</span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenUpgradeModal('Passez en Pro pour retirer tout filigrane et ajouter votre logo sans limitation !')}
                  className="font-bold text-amber-800 underline hover:text-amber-950 text-[11px]"
                >
                  Supprimer avec PRO (1 000 F)
                </button>
              </div>
            )}
            <QuotePreview quote={quote} company={company} isPro={isPro} />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setActiveStep('terms')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndExit}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Enregistrer le Devis</span>
            </button>
          </div>
        </div>
      )}

      {/* Catalog Quick Picker Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 my-8 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Choisir un article du catalogue
              </h3>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Fermer
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 space-y-1">
              {catalog.map((catItem) => (
                <div
                  key={catItem.id}
                  onClick={() => handleAddCatalogItem(catItem)}
                  className="p-2.5 hover:bg-emerald-50 rounded-lg cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {catItem.category || 'Article'}
                    </span>
                    <p className="font-bold text-slate-800 text-xs mt-0.5">{catItem.description}</p>
                    {catItem.details && <p className="text-[10px] text-slate-500">{catItem.details}</p>}
                  </div>
                  <div className="text-right pl-2">
                    <span className="font-mono font-bold text-slate-900 text-xs block">
                      {formatFCFA(catItem.unitPrice)}
                    </span>
                    <span className="text-[9px] text-slate-400">/{catItem.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        quote={quote}
        company={company}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onDownloadPDF={handleDownloadPDF}
        isGeneratingPDF={isGeneratingPDF}
      />
    </div>
  );
};
