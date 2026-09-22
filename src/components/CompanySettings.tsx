import React, { useState, useRef } from 'react';
import { CompanyProfile, Subscription } from '../types';
import { SignaturePad } from './SignaturePad';
import {
  Building2,
  Upload,
  Trash2,
  Palette,
  CreditCard,
  PenTool,
  Check,
  Download,
  FileJson,
  Shield,
  FileCheck,
  Crown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatFCFA } from '../utils/formatters';

interface CompanySettingsProps {
  company: CompanyProfile;
  subscription: Subscription;
  onSaveCompany: (company: CompanyProfile) => void;
  onExportAllData: () => void;
  onImportAllData: (file: File) => void;
  onOpenUpgradeModal?: (reason?: string) => void;
}

const COLOR_PRESETS = [
  { label: 'Émeraude', value: '#059669' },
  { label: 'Bleu', value: '#2563EB' },
  { label: 'Or Sahel', value: '#D97706' },
  { label: 'Rubis', value: '#E11D48' },
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Charbon', value: '#1E293B' },
  { label: 'Vert Forêt', value: '#15803D' },
  { label: 'Violet', value: '#7C3AED' },
];

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  company,
  subscription,
  onSaveCompany,
  onExportAllData,
  onImportAllData,
  onOpenUpgradeModal,
}) => {
  const [profile, setProfile] = useState<CompanyProfile>(company);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const isPro = subscription.plan === 'pro';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Le logo ne doit pas dépasser 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setProfile((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handlePaymentToggle = (index: number) => {
    const updated = [...profile.payments];
    updated[index].active = !updated[index].active;
    setProfile({ ...profile, payments: updated });
  };

  const handlePaymentChange = (index: number, field: string, value: string) => {
    const updated = [...profile.payments];
    (updated[index] as any)[field] = value;
    setProfile({ ...profile, payments: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportAllData(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 pb-20">
      {/* Top Banner - High Density */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Paramètres Entreprise & Devis</h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configurez votre logo, NINEA/RCCM et comptes Wave / Orange Money
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm self-start sm:self-auto shrink-0"
        >
          {saveSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Enregistré !</span>
            </>
          ) : (
            <>
              <FileCheck className="w-3.5 h-3.5" />
              <span>Sauvegarder</span>
            </>
          )}
        </button>
      </div>

      {/* Subscription Plan Overview Card */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold shrink-0 mt-0.5">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                {isPro ? 'Formule SunuDevis PRO (Illimité)' : 'Formule Découverte (Gratuite)'}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${isPro ? 'bg-amber-400 text-slate-900 font-black' : 'bg-slate-700 text-slate-300'}`}>
                {isPro ? 'ACTIF 🌟' : '3 devis / mois'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {isPro
                ? 'Devis, répertoire et catalogue illimités, logo officiel et documents sans filigrane.'
                : 'Passez à la version Pro (1 000 FCFA/mois) pour débloquer les devis illimités et retirer le filigrane.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenUpgradeModal && onOpenUpgradeModal()}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>{isPro ? 'Gérer mon forfait' : 'Passer en PRO (1 000 F)'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Section 1: Logo & Visual Identity */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Palette className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Identité Visuelle & Logo</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* Logo Upload Box */}
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Logo de l'entreprise :
              </label>
              <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl bg-slate-50 transition relative group min-h-[90px]">
                {profile.logoUrl ? (
                  <div className="relative">
                    <img
                      src={profile.logoUrl}
                      alt="Logo"
                      className="max-h-16 max-w-full object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm"
                      title="Supprimer le logo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-1">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-700">Importer un logo</p>
                    <p className="text-[9px] text-slate-400">PNG, JPG (Max 2Mo)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Theme Color Selector */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Couleur principale des devis :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {COLOR_PRESETS.map((color) => {
                  const isSelected = profile.themeColor === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, themeColor: color.value })}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] font-bold transition ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shadow-inner shrink-0"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="truncate">{color.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500">Ou personnalisé :</span>
                <input
                  type="color"
                  value={profile.themeColor || '#059669'}
                  onChange={(e) => setProfile({ ...profile, themeColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-200 p-0.5"
                />
                <span className="font-mono text-xs font-bold text-slate-700">
                  {profile.themeColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Business Info & Senegal Legal Identifiers */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Coordonnées & Informations Légales (Sénégal)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Nom de l'Entreprise ou Marque * :
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Ex: Teranga Services & Commerce"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Slogan / Activité principale :
              </label>
              <input
                type="text"
                value={profile.slogan || ''}
                onChange={(e) => setProfile({ ...profile, slogan: e.target.value })}
                placeholder="Ex: Votre partenaire de confiance à Dakar"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                N° NINEA (Sénégal) :
              </label>
              <input
                type="text"
                value={profile.ninea || ''}
                onChange={(e) => setProfile({ ...profile, ninea: e.target.value })}
                placeholder="Ex: 007894562 2V3"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                N° RCCM (Registre de Commerce) :
              </label>
              <input
                type="text"
                value={profile.rccm || ''}
                onChange={(e) => setProfile({ ...profile, rccm: e.target.value })}
                placeholder="Ex: SN.DKR.2023.B.14820"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Téléphone Principal (+221) * :
              </label>
              <input
                type="text"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Ex: 77 654 32 10"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Téléphone Secondaire :
              </label>
              <input
                type="text"
                value={profile.phoneSecondary || ''}
                onChange={(e) => setProfile({ ...profile, phoneSecondary: e.target.value })}
                placeholder="Ex: 78 123 45 67 ou 33 800 00 00"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                E-mail :
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="contact@entreprise.sn"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Ville / Région :
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Dakar, Thiès..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Adresse / Quartier :
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Ex: Rue 10, Médina"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Mobile Money & Bank Accounts (Wave, OM, Free, Bank) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Moyens de Paiement (Wave, OM, Free, Virement)</h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Ces numéros apparaîtront en bas de vos devis et dans le message WhatsApp.
          </p>

          <div className="space-y-2">
            {profile.payments.map((p, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-lg border transition ${
                  p.active ? 'bg-white border-emerald-300 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <span className="text-sm">
                      {p.type === 'wave' && '🌊'}
                      {p.type === 'orange_money' && '🍊'}
                      {p.type === 'free_money' && '🟢'}
                      {p.type === 'bank_transfer' && '🏦'}
                      {p.type === 'cash' && '💵'}
                    </span>
                    <span>{p.label}</span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={() => handlePaymentToggle(index)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                      Numéro ou RIB :
                    </label>
                    <input
                      type="text"
                      value={p.numberOrRib}
                      onChange={(e) => handlePaymentChange(index, 'numberOrRib', e.target.value)}
                      placeholder={p.type === 'bank_transfer' ? 'SN012 01001...' : '77 XXX XX XX'}
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                      Titulaire du compte :
                    </label>
                    <input
                      type="text"
                      value={p.holderName || ''}
                      onChange={(e) => handlePaymentChange(index, 'holderName', e.target.value)}
                      placeholder="Nom de l'entreprise ou du titulaire"
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Signature & Stamp */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <PenTool className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Cachet & Signature Électronique</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-40 h-20 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center p-2 relative">
              {profile.signatureUrl ? (
                <img
                  src={profile.signatureUrl}
                  alt="Signature"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[11px] text-slate-400 text-center">Aucune signature</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowSignatureModal(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Dessiner la signature</span>
              </button>

              {profile.signatureUrl && (
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, signatureUrl: '' })}
                  className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Backup / Export Data */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <FileJson className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Sauvegarde & Restauration</h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Exportez une copie de secours complète de vos devis, clients et catalogue.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onExportAllData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exporter les données (JSON)</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Importer une sauvegarde</span>
              <input
                ref={importFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Bottom save bar */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer toutes les modifications</span>
          </button>
        </div>
      </form>

      {/* Signature Canvas modal */}
      {showSignatureModal && (
        <SignaturePad
          initialSignature={profile.signatureUrl}
          onSave={(dataUrl) => setProfile({ ...profile, signatureUrl: dataUrl })}
          onClose={() => setShowSignatureModal(false)}
        />
      )}
    </div>
  );
};
