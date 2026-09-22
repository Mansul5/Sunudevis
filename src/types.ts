export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'invoiced';

export type TemplateType = 'modern' | 'classic' | 'elegant' | 'compact';

export type PaymentType = 'wave' | 'orange_money' | 'free_money' | 'bank_transfer' | 'cash';

export interface PaymentDetails {
  type: PaymentType;
  label: string;
  numberOrRib: string;
  holderName?: string;
  active: boolean;
}

export interface CompanyProfile {
  name: string;
  slogan?: string;
  logoUrl?: string;
  ninea?: string; // Numéro d'Identification Nationale des Entreprises et Associations (Sénégal)
  rccm?: string;  // Registre de Commerce et du Crédit Mobilier
  phone: string;
  phoneSecondary?: string;
  email: string;
  address: string;
  city: string;
  country: string;
  themeColor: string; // Hex color
  payments: PaymentDetails[];
  signatureUrl?: string;
  footerNote?: string;
}

export interface Client {
  id: string;
  name: string;
  type: 'individual' | 'company';
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  ninea?: string;
  rccm?: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  unit: string; // e.g., 'Unité', 'Heure', 'Jour', 'Forfait', 'Kg', 'Mètre', 'Sac', 'Prestation'
  unitPrice: number; // en FCFA
  discountPercent?: number;
}

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. DEV-2026-001
  date: string; // ISO string
  validityDays: number; // e.g. 15 or 30 days
  validUntil: string; // calculated date string
  status: QuoteStatus;
  
  // Client info
  client: Client;
  
  // Items
  items: QuoteItem[];
  
  // Financials
  taxRate: number; // e.g., 0% or 18% (TVA Sénégal)
  applyTax: boolean;
  globalDiscountPercent: number; // remise globale %
  depositPercent: number; // acompte demandé % (ex: 30%, 50%)
  
  // Terms & Payment
  notes?: string;
  paymentTerms?: string;
  deliveryTime?: string;
  
  // Visual config
  template: TemplateType;
  themeColor?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  id: string;
  description: string;
  details?: string;
  unit: string;
  unitPrice: number;
  category?: string;
}

export type SubscriptionPlan = 'free' | 'pro';

export interface Subscription {
  plan: SubscriptionPlan;
  activatedAt?: string;
  expiresAt?: string;
  monthlyQuoteLimit: number; // 3 for free, -1 for unlimited
  maxCatalogItems: number;   // 5 for free, -1 for unlimited
  maxClients: number;        // 5 for free, -1 for unlimited
  customBranding: boolean;
  eSignature: boolean;
  billingPeriod?: 'monthly' | 'yearly';
  paymentMethod?: 'wave' | 'orange_money';
  paymentPhone?: string;
  transactionRef?: string;
}
