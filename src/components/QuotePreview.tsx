import React from 'react';
import { Quote, CompanyProfile } from '../types';
import { formatFCFA, formatDateFR, formatShortDateFR, calculateQuoteFinancials, formatDisplayPhone } from '../utils/formatters';
import { Building2, Phone, Mail, MapPin, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

interface QuotePreviewProps {
  quote: Quote;
  company: CompanyProfile;
  isPro?: boolean;
  scale?: number;
  printMode?: boolean;
}

export const QuotePreview: React.FC<QuotePreviewProps> = ({
  quote,
  company,
  isPro = false,
  scale = 1,
  printMode = false,
}) => {
  const financials = calculateQuoteFinancials(quote);
  const themeColor = quote.themeColor || company.themeColor || '#059669';
  const activePayments = (company.payments || []).filter(p => p.active && p.numberOrRib);

  return (
    <div
      id="quote-printable-document"
      className="bg-white text-slate-800 font-sans mx-auto shadow-sm print:shadow-none transition-all"
      style={{
        width: '100%',
        maxWidth: '800px',
        minHeight: '1050px',
        padding: '36px 40px',
        boxSizing: 'border-box',
        fontSize: '14px',
        lineHeight: '1.5',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          TEMPLATE 1: MODERNE (Default)
          ───────────────────────────────────────────────────────────── */}
      {quote.template === 'modern' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b-2" style={{ borderColor: `${themeColor}30` }}>
            <div className="flex items-start gap-4">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-20 h-20 object-contain rounded-xl border border-slate-100 p-1"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  {company.name ? company.name.charAt(0).toUpperCase() : 'E'}
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {company.name || 'Nom de votre Entreprise'}
                </h2>
                {company.slogan && (
                  <p className="text-xs text-slate-500 italic mt-0.5">{company.slogan}</p>
                )}
                
                <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                  {company.address && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{company.address}, {company.city} ({company.country})</span>
                    </p>
                  )}
                  {company.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDisplayPhone(company.phone)}</span>
                      {company.phoneSecondary && <span>/ {formatDisplayPhone(company.phoneSecondary)}</span>}
                    </p>
                  )}
                  {company.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{company.email}</span>
                    </p>
                  )}
                  {(company.ninea || company.rccm) && (
                    <div className="flex gap-3 text-[11px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-100">
                      {company.ninea && <span>NINEA : <strong className="text-slate-700">{company.ninea}</strong></span>}
                      {company.rccm && <span>RCCM : <strong className="text-slate-700">{company.rccm}</strong></span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document badge */}
            <div className="text-right">
              <div
                className="inline-block px-4 py-1.5 rounded-lg text-white font-bold text-base tracking-wider uppercase shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                DEVIS PRO
              </div>
              <div className="mt-2 text-xs space-y-1 text-slate-600">
                <p>
                  N° Devis : <strong className="text-slate-900 font-mono text-sm">{quote.quoteNumber}</strong>
                </p>
                <p>
                  Date : <strong>{formatDateFR(quote.date)}</strong>
                </p>
                <p>
                  Validité : <strong className="text-emerald-700">{formatDateFR(quote.validUntil)}</strong> ({quote.validityDays} jours)
                </p>
              </div>
            </div>
          </div>

          {/* Client Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Émetteur
              </span>
              <p className="font-semibold text-slate-800 text-sm">{company.name}</p>
              <p className="text-xs text-slate-600 mt-0.5">{company.city}, {company.country}</p>
              <p className="text-xs text-slate-600">{company.phone}</p>
            </div>

            <div
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: `${themeColor}08`,
                borderColor: `${themeColor}30`,
              }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                style={{ color: themeColor }}
              >
                Destinataire (Client)
              </span>
              <p className="font-bold text-slate-900 text-base">
                {quote.client.name || 'Nom du Client'}
              </p>
              {quote.client.type === 'company' && (
                <span className="inline-block text-[10px] font-medium bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mt-0.5">
                  Société / Organisation
                </span>
              )}
              <div className="text-xs text-slate-600 mt-1.5 space-y-0.5">
                {quote.client.address && <p>{quote.client.address}, {quote.client.city || 'Dakar'}</p>}
                {quote.client.phone && <p>Tél : {formatDisplayPhone(quote.client.phone)}</p>}
                {quote.client.email && <p>Email : {quote.client.email}</p>}
                {quote.client.ninea && <p className="font-mono text-[11px]">NINEA : {quote.client.ninea}</p>}
              </div>
            </div>
          </div>

          {/* Table of Items */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: themeColor }}>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Description & Détails</th>
                  <th className="py-3 px-4 text-center w-24">Quantité</th>
                  <th className="py-3 px-4 text-right w-32">Prix Unitaire</th>
                  <th className="py-3 px-4 text-right w-32">Total (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {quote.items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{index + 1}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800 text-sm">{item.description || 'Prestation / Article'}</p>
                        {item.details && <p className="text-slate-500 text-xs mt-0.5">{item.details}</p>}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">
                        {item.quantity} <span className="text-slate-400 text-[11px]">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 font-mono">
                        {formatFCFA(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        {formatFCFA(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial summary & Payment section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Payment instructions & notes */}
            <div className="space-y-4">
              {activePayments.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Paiements Acceptés
                  </h4>
                  <div className="space-y-2 text-xs">
                    {activePayments.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">
                          {p.type === 'wave' && '🌊 Wave :'}
                          {p.type === 'orange_money' && '🍊 Orange Money :'}
                          {p.type === 'free_money' && '🟢 Free Money :'}
                          {p.type === 'bank_transfer' && '🏦 Virement :'}
                          {p.type === 'cash' && '💵 Espèces :'}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{p.numberOrRib}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {quote.notes && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-700 block mb-1">Conditions & Modalités :</strong>
                  <p className="whitespace-pre-line">{quote.notes}</p>
                </div>
              )}
            </div>

            {/* Totals Calculation Box */}
            <div className="space-y-2">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total Brut</span>
                  <span className="font-mono font-medium">{formatFCFA(financials.subtotalGross)}</span>
                </div>

                {quote.globalDiscountPercent > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Remise ({quote.globalDiscountPercent}%)</span>
                    <span className="font-mono font-medium">- {formatFCFA(financials.globalDiscountAmount)}</span>
                  </div>
                )}

                {quote.applyTax && (
                  <div className="flex justify-between text-slate-600">
                    <span>TVA ({quote.taxRate}%)</span>
                    <span className="font-mono font-medium">{formatFCFA(financials.taxAmount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center text-slate-900">
                  <span className="font-bold text-sm">TOTAL NET À PAYER</span>
                  <span className="font-mono font-black text-lg" style={{ color: themeColor }}>
                    {formatFCFA(financials.totalAmount)}
                  </span>
                </div>

                {quote.depositPercent > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 bg-white p-2.5 rounded-lg">
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Acompte requis ({quote.depositPercent}%)</span>
                      <span className="font-mono">{formatFCFA(financials.depositAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Solde restant à la livraison</span>
                      <span className="font-mono">{formatFCFA(financials.remainingBalance)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Signatures area */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="text-center p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                  <p className="text-[11px] font-medium text-slate-500">Pour le Client</p>
                  <p className="text-[10px] text-slate-400 italic">"Bon pour accord"</p>
                  <div className="h-14 mt-1 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
                    <span className="text-[10px] text-slate-300">Date et signature</span>
                  </div>
                </div>

                <div className="text-center p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                  <p className="text-[11px] font-medium text-slate-500">Pour l'Entreprise</p>
                  <div className="h-14 mt-1 flex items-center justify-center">
                    {company.signatureUrl ? (
                      <img
                        src={company.signatureUrl}
                        alt="Signature / Cachet"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <div className="border border-slate-300 rounded px-2 py-1 text-[10px] text-slate-400">
                        Cachet & Signature
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          {company.footerNote && (
            <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              {company.footerNote}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TEMPLATE 2: CLASSIQUE AFFAIRES
          ───────────────────────────────────────────────────────────── */}
      {quote.template === 'classic' && (
        <div className="space-y-6 text-slate-900 border-2 border-slate-800 p-6 rounded-lg">
          {/* Top banner */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-black tracking-tight text-slate-900 uppercase">
                {company.name || 'ENTREPRISE COMMERCIALE'}
              </h2>
              {company.slogan && <p className="text-xs text-slate-600 uppercase tracking-widest">{company.slogan}</p>}
              <p className="text-xs text-slate-600 mt-1">{company.address} - {company.city}, {company.country}</p>
              <p className="text-xs text-slate-600">Tél : {formatDisplayPhone(company.phone)} | Email : {company.email}</p>
              <div className="text-[11px] font-mono text-slate-700 mt-1">
                {company.ninea && <span>NINEA : {company.ninea} </span>}
                {company.rccm && <span>| RCCM : {company.rccm}</span>}
              </div>
            </div>

            <div className="text-right">
              {company.logoUrl && (
                <img src={company.logoUrl} alt={company.name} className="w-16 h-16 object-contain ml-auto mb-2" />
              )}
              <div className="border-2 border-slate-900 px-3 py-1 font-mono font-bold text-sm bg-slate-100 inline-block">
                DEVIS N° {quote.quoteNumber}
              </div>
              <p className="text-xs font-mono mt-1">Date : {formatDateFR(quote.date)}</p>
              <p className="text-xs font-mono">Validité : {quote.validityDays} jours</p>
            </div>
          </div>

          {/* Client target */}
          <div className="bg-slate-100 p-4 rounded border border-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">CLIENT FACTURÉ :</span>
            <p className="font-bold text-base text-slate-900">{quote.client.name}</p>
            <div className="text-xs text-slate-700 grid grid-cols-2 gap-2 mt-1">
              <p>Adresse : {quote.client.address || 'Non spécifiée'}, {quote.client.city}</p>
              <p>Téléphone : {formatDisplayPhone(quote.client.phone)}</p>
              {quote.client.email && <p>Email : {quote.client.email}</p>}
              {quote.client.ninea && <p className="font-mono">NINEA : {quote.client.ninea}</p>}
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-800 text-white uppercase text-center font-bold">
                <th className="border border-slate-400 p-2 w-10">Réf</th>
                <th className="border border-slate-400 p-2 text-left">Désignation</th>
                <th className="border border-slate-400 p-2 w-20">Qté</th>
                <th className="border border-slate-400 p-2 w-28">P.U (FCFA)</th>
                <th className="border border-slate-400 p-2 w-32">Total (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-slate-400 p-2">
                    <span className="font-bold block">{item.description}</span>
                    {item.details && <span className="text-slate-600 italic block text-[11px]">{item.details}</span>}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">{item.quantity} {item.unit}</td>
                  <td className="border border-slate-400 p-2 text-right font-mono">{formatFCFA(item.unitPrice)}</td>
                  <td className="border border-slate-400 p-2 text-right font-mono font-bold">{formatFCFA(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 border border-slate-400 text-xs divide-y divide-slate-300 bg-slate-50">
              <div className="flex justify-between p-2">
                <span>Sous-total HT</span>
                <span className="font-mono font-bold">{formatFCFA(financials.subtotalGross)}</span>
              </div>
              {quote.globalDiscountPercent > 0 && (
                <div className="flex justify-between p-2 text-red-700">
                  <span>Remise ({quote.globalDiscountPercent}%)</span>
                  <span className="font-mono">- {formatFCFA(financials.globalDiscountAmount)}</span>
                </div>
              )}
              {quote.applyTax && (
                <div className="flex justify-between p-2">
                  <span>TVA (18%)</span>
                  <span className="font-mono">{formatFCFA(financials.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between p-2.5 bg-slate-800 text-white font-bold text-sm">
                <span>NET À PAYER</span>
                <span className="font-mono">{formatFCFA(financials.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Signature */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300 text-xs">
            <div>
              <strong className="block mb-1">RÈGLEMENT & ACOMPTE :</strong>
              <p className="text-slate-700">{quote.paymentTerms || 'Paiement à réception de facture.'}</p>
              {activePayments.length > 0 && (
                <p className="mt-1 text-slate-600">
                  Comptes : {activePayments.map(p => `${p.label} (${p.numberOrRib})`).join(' | ')}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-800 mb-1">Signature & Cachet commercial</p>
              <div className="h-16 flex items-center justify-end">
                {company.signatureUrl && (
                  <img src={company.signatureUrl} alt="Signature" className="max-h-14 object-contain" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TEMPLATE 3: ÉLÉGANT BOUTIQUE
          ───────────────────────────────────────────────────────────── */}
      {quote.template === 'elegant' && (
        <div className="space-y-8">
          <div className="text-center pb-6 border-b border-slate-200">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-16 h-16 object-contain mx-auto mb-2" />
            ) : null}
            <h2 className="text-2xl font-light tracking-widest text-slate-900 uppercase">
              {company.name || 'ENTREPRISE'}
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{company.slogan || 'Excellence & Qualité'}</p>
            <p className="text-xs text-slate-500 mt-2">
              {company.address} • {company.city} • Tél : {company.phone} • {company.email}
            </p>
          </div>

          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Devis Pour</span>
              <h3 className="font-bold text-lg">{quote.client.name}</h3>
              <p className="text-xs text-slate-300">{quote.client.city} • {quote.client.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">N° Devis</span>
              <p className="font-mono font-bold text-amber-400">{quote.quoteNumber}</p>
              <p className="text-xs text-slate-300">{formatDateFR(quote.date)}</p>
            </div>
          </div>

          {/* Elegant table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-slate-400 uppercase font-medium tracking-wider">
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-center w-20">Qté</th>
                <th className="py-2 text-right w-32">P.U</th>
                <th className="py-2 text-right w-32">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <p className="font-medium text-slate-800 text-sm">{item.description}</p>
                    {item.details && <p className="text-slate-400 text-xs">{item.details}</p>}
                  </td>
                  <td className="py-3 text-center text-slate-600">{item.quantity} {item.unit}</td>
                  <td className="py-3 text-right font-mono text-slate-600">{formatFCFA(item.unitPrice)}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">{formatFCFA(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Elegant Total */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total</span>
                <span className="font-mono">{formatFCFA(financials.subtotalGross)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>Total FCFA</span>
                <span className="font-mono text-emerald-600">{formatFCFA(financials.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>Valable jusqu'au {formatDateFR(quote.validUntil)}</span>
            <span>{company.footerNote}</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TEMPLATE 4: COMPACT EXPRESS (Commerçants & Marchés)
          ───────────────────────────────────────────────────────────── */}
      {quote.template === 'compact' && (
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              {company.logoUrl && <img src={company.logoUrl} alt={company.name} className="w-12 h-12 object-contain" />}
              <div>
                <h3 className="font-bold text-base text-slate-900">{company.name}</h3>
                <p className="text-[11px] text-slate-600">{company.phone} | {company.city}</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="bg-slate-900 text-white font-bold px-2 py-0.5 rounded text-[11px]">DEVIS EXPRESS</span>
              <p className="font-bold mt-1">{quote.quoteNumber}</p>
              <p className="text-[10px] text-slate-500">{formatShortDateFR(quote.date)}</p>
            </div>
          </div>

          <div className="bg-slate-100 p-2.5 rounded flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Client :</span>
              <p className="font-bold text-slate-800">{quote.client.name}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-700">{formatDisplayPhone(quote.client.phone)}</p>
              <p className="text-[10px] text-slate-500">{quote.client.city}</p>
            </div>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="p-1.5">Article</th>
                <th className="p-1.5 text-center w-16">Qté</th>
                <th className="p-1.5 text-right w-24">Prix U.</th>
                <th className="p-1.5 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-1.5 font-medium">{item.description}</td>
                  <td className="p-1.5 text-center">{item.quantity}</td>
                  <td className="p-1.5 text-right font-mono">{formatFCFA(item.unitPrice)}</td>
                  <td className="p-1.5 text-right font-mono font-bold">{formatFCFA(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center font-bold text-emerald-900 text-sm">
            <span>TOTAL À PAYER :</span>
            <span className="text-base font-black font-mono">{formatFCFA(financials.totalAmount)}</span>
          </div>

          {activePayments.length > 0 && (
            <p className="text-[11px] text-slate-600 text-center">
              Paiements : {activePayments.map(p => `${p.label} : ${p.numberOrRib}`).join(' • ')}
            </p>
          )}
        </div>
      )}

      {/* Free Plan Discreet Watermark Footer */}
      {!isPro && (
        <div className="mt-8 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>🇸🇳 Document généré avec <strong>SunuDevis</strong> (Version Découverte)</span>
          <span className="font-mono text-slate-400">Passez à SunuDevis Pro pour retirer cette mention</span>
        </div>
      )}
    </div>
  );
};
