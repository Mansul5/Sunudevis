import { CompanyProfile, Quote, Client, CatalogItem, Subscription } from '../types';
import { generateQuoteNumber, calculateValidUntil } from './formatters';

const STORAGE_KEYS = {
  COMPANY: 'devis_sn_company_profile',
  QUOTES: 'devis_sn_quotes_list',
  CLIENTS: 'devis_sn_saved_clients',
  CATALOG: 'devis_sn_item_catalog',
  SUBSCRIPTION: 'devis_sn_user_subscription',
};

export const DEFAULT_SUBSCRIPTION: Subscription = {
  plan: 'free',
  monthlyQuoteLimit: 3,
  maxCatalogItems: 5,
  maxClients: 5,
  customBranding: false,
  eSignature: false,
};

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'Teranga Services & Commerce',
  slogan: 'Votre partenaire de confiance au Sénégal',
  logoUrl: '',
  ninea: '007894562 2V3',
  rccm: 'SN.DKR.2023.B.14820',
  phone: '77 654 32 10',
  phoneSecondary: '78 123 45 67',
  email: 'contact@terangaservices.sn',
  address: 'Avenue Cheikh Anta Diop, Fann Hock',
  city: 'Dakar',
  country: 'Sénégal',
  themeColor: '#059669', // Emeraude Teranga
  footerNote: 'Merci pour votre confiance. Devis gratuit sans engagement.',
  payments: [
    {
      type: 'wave',
      label: 'Wave Sénégal',
      numberOrRib: '77 654 32 10',
      holderName: 'Teranga Services',
      active: true,
    },
    {
      type: 'orange_money',
      label: 'Orange Money',
      numberOrRib: '78 123 45 67',
      holderName: 'Teranga Services',
      active: true,
    },
    {
      type: 'bank_transfer',
      label: 'Virement CBAO / BOA',
      numberOrRib: 'SN012 01001 02345678901 45',
      holderName: 'Teranga Services SARL',
      active: true,
    },
  ],
};

export const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Moussa Diop',
    type: 'individual',
    phone: '77 820 40 50',
    email: 'moussa.diop@gmail.com',
    address: 'Sacré-Cœur 3, Villa 214',
    city: 'Dakar',
  },
  {
    id: 'cli-2',
    name: 'Société Baobab Logistique SARL',
    type: 'company',
    phone: '33 824 10 20',
    email: 'achats@baobab-logistique.sn',
    address: 'Zone Industrielle de Mbao',
    city: 'Dakar',
    ninea: '006541239 1B2',
    rccm: 'SN.DKR.2021.B.8950',
  },
  {
    id: 'cli-3',
    name: 'Fatou Ndiaye Boutique',
    type: 'individual',
    phone: '70 456 78 90',
    email: 'fatou.ndiaye@yahoo.fr',
    address: 'Marché HLM 5',
    city: 'Dakar',
  },
];

export const SAMPLE_CATALOG: CatalogItem[] = [
  {
    id: 'cat-1',
    description: 'Installation & Configuration Réseau Wi-Fi Pro',
    details: 'Câblage, paramétrage routeurs, tests de débit et sécurisation WPA3',
    unit: 'Forfait',
    unitPrice: 150000,
    category: 'Informatique',
  },
  {
    id: 'cat-2',
    description: 'Maintenance Informatique Mensuelle',
    details: 'Nettoyage système, antivirus, sauvegarde des données et support',
    unit: 'Mois',
    unitPrice: 75000,
    category: 'Informatique',
  },
  {
    id: 'cat-3',
    description: 'Création Site Web Vitrine Mobile-Friendly',
    details: 'Design sur-mesure, intégration WhatsApp, nom de domaine .sn',
    unit: 'Projet',
    unitPrice: 350000,
    category: 'Digital',
  },
  {
    id: 'cat-4',
    description: 'Conception Graphique Logo + Carte de Visite',
    details: '3 propositions, fichiers vectoriels HD prêts pour impression',
    unit: 'Forfait',
    unitPrice: 65000,
    category: 'Design',
  },
  {
    id: 'cat-5',
    description: 'Livraison express marchandise Dakar & banlieue',
    details: 'Transport sécurisé avec suivi d’acheminement',
    unit: 'Course',
    unitPrice: 15000,
    category: 'Logistique',
  },
];

export const SAMPLE_QUOTES: Quote[] = [
  {
    id: 'quote-sample-1',
    quoteNumber: 'DEV-2026-001',
    date: '2026-08-25',
    validityDays: 15,
    validUntil: '2026-09-09',
    status: 'sent',
    client: SAMPLE_CLIENTS[0],
    items: [
      {
        id: 'item-1',
        description: 'Installation & Configuration Réseau Wi-Fi Pro',
        details: 'Pose 2 bornes Wi-Fi longue portée et paramétrage du routeur',
        quantity: 1,
        unit: 'Forfait',
        unitPrice: 150000,
      },
      {
        id: 'item-2',
        description: 'Câble réseau blindé Cat6 (au mètre)',
        details: 'Câble haute performance avec connecteurs RJ45 blindés',
        quantity: 30,
        unit: 'Mètre',
        unitPrice: 1000,
      },
    ],
    taxRate: 18,
    applyTax: false,
    globalDiscountPercent: 5,
    depositPercent: 40,
    notes: 'Matériel garanti 1 an. Début des travaux dès réception de l’acompte.',
    paymentTerms: 'Acompte de 40% à la commande, solde à la livraison.',
    deliveryTime: '3 jours ouvrés',
    template: 'modern',
    themeColor: '#059669',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
  },
  {
    id: 'quote-sample-2',
    quoteNumber: 'DEV-2026-002',
    date: '2026-08-26',
    validityDays: 30,
    validUntil: '2026-09-25',
    status: 'accepted',
    client: SAMPLE_CLIENTS[1],
    items: [
      {
        id: 'item-3',
        description: 'Création Site Web Vitrine Mobile-Friendly',
        details: 'Site 5 pages, optimisation SEO local, formulaire et bouton WhatsApp',
        quantity: 1,
        unit: 'Projet',
        unitPrice: 350000,
      },
      {
        id: 'item-4',
        description: 'Maintenance & Hébergement annuel .sn',
        details: 'Certificat SSL, sauvegardes hebdomadaires automatiques',
        quantity: 1,
        unit: 'An',
        unitPrice: 120000,
      },
    ],
    taxRate: 18,
    applyTax: true,
    globalDiscountPercent: 0,
    depositPercent: 50,
    notes: 'Validation des maquettes sous 7 jours. Déploiement en ligne sous 15 jours.',
    paymentTerms: '50% à la signature, 50% à la mise en ligne.',
    deliveryTime: '15 jours',
    template: 'classic',
    themeColor: '#2563EB',
    createdAt: '2026-08-26T08:30:00.000Z',
    updatedAt: '2026-08-26T09:00:00.000Z',
  },
];

// Storage helper functions
export function getSavedCompany(): CompanyProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
  } catch {
    return DEFAULT_COMPANY;
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save company profile', e);
  }
}

export function getSavedQuotes(): Quote[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return saved ? JSON.parse(saved) : SAMPLE_QUOTES;
  } catch {
    return SAMPLE_QUOTES;
  }
}

export function saveQuotes(quotes: Quote[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed to save quotes', e);
  }
}

export function getSavedClients(): Client[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : SAMPLE_CLIENTS;
  } catch {
    return SAMPLE_CLIENTS;
  }
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients', e);
  }
}

export function getSavedCatalog(): CatalogItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATALOG);
    return saved ? JSON.parse(saved) : SAMPLE_CATALOG;
  } catch {
    return SAMPLE_CATALOG;
  }
}

export function saveCatalog(catalog: CatalogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
  } catch (e) {
    console.error('Failed to save catalog', e);
  }
}

export function getSavedSubscription(): Subscription {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTION;
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscription(sub: Subscription): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  } catch (e) {
    console.error('Failed to save subscription', e);
  }
}

export function getQuotesCreatedThisMonth(quotes: Quote[]): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return quotes.filter((q) => {
    try {
      const qDate = new Date(q.createdAt || q.date);
      return qDate.getFullYear() === currentYear && qDate.getMonth() === currentMonth;
    } catch {
      return false;
    }
  }).length;
}

export function checkQuoteCreationAllowed(
  quotes: Quote[],
  subscription: Subscription
): { allowed: boolean; used: number; limit: number; remaining: number } {
  if (subscription.plan === 'pro') {
    return { allowed: true, used: quotes.length, limit: -1, remaining: Infinity };
  }

  const used = getQuotesCreatedThisMonth(quotes);
  const limit = subscription.monthlyQuoteLimit || 3;
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return { allowed, used, limit, remaining };
}

export function createBlankQuote(existingCount: number, companyColor?: string): Quote {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: `quote-${Date.now()}`,
    quoteNumber: generateQuoteNumber(existingCount),
    date: today,
    validityDays: 15,
    validUntil: calculateValidUntil(today, 15),
    status: 'draft',
    client: {
      id: `client-${Date.now()}`,
      name: '',
      type: 'individual',
      phone: '',
      email: '',
      address: '',
      city: 'Dakar',
    },
    items: [
      {
        id: `item-${Date.now()}-1`,
        description: '',
        details: '',
        quantity: 1,
        unit: 'Unité',
        unitPrice: 0,
      },
    ],
    taxRate: 18,
    applyTax: false,
    globalDiscountPercent: 0,
    depositPercent: 0,
    notes: 'Devis valable 15 jours. Paiement accepté par Wave, Orange Money ou Espèces.',
    paymentTerms: 'Paiement à la livraison.',
    deliveryTime: 'Immédiat / Selon accord',
    template: 'modern',
    themeColor: companyColor || '#059669',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
