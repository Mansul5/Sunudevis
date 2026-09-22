import React, { useState, useEffect } from 'react';
import { Quote, CompanyProfile, Client, CatalogItem, QuoteStatus, Subscription } from './types';
import {
  getSavedCompany,
  saveCompanyProfile,
  getSavedQuotes,
  saveQuotes,
  getSavedClients,
  saveClients,
  getSavedCatalog,
  saveCatalog,
  getSavedSubscription,
  saveSubscription,
  getQuotesCreatedThisMonth,
  checkQuoteCreationAllowed,
  createBlankQuote,
} from './utils/storage';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { QuoteList } from './components/QuoteList';
import { QuoteEditor } from './components/QuoteEditor';
import { ClientManager } from './components/ClientManager';
import { ItemCatalog } from './components/ItemCatalog';
import { CompanySettings } from './components/CompanySettings';
import { UpgradeModal } from './components/UpgradeModal';
import { generateQuoteNumber, calculateValidUntil } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState<'quotes' | 'editor' | 'clients' | 'catalog' | 'company'>('quotes');
  const [company, setCompany] = useState<CompanyProfile>(getSavedCompany);
  const [quotes, setQuotes] = useState<Quote[]>(getSavedQuotes);
  const [clients, setClients] = useState<Client[]>(getSavedClients);
  const [catalog, setCatalog] = useState<CatalogItem[]>(getSavedCatalog);
  const [subscription, setSubscription] = useState<Subscription>(getSavedSubscription);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  // Upgrade Modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalReason, setUpgradeModalReason] = useState<string | undefined>(undefined);

  const quotesCountThisMonth = getQuotesCreatedThisMonth(quotes);

  const handleOpenUpgradeModal = (reason?: string) => {
    setUpgradeModalReason(reason);
    setIsUpgradeModalOpen(true);
  };

  const handleCloseUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalReason(undefined);
  };

  const handleUpdateSubscription = (newSub: Subscription) => {
    setSubscription(newSub);
    saveSubscription(newSub);
  };

  // Sync to local storage
  const handleSaveCompany = (updated: CompanyProfile) => {
    setCompany(updated);
    saveCompanyProfile(updated);
  };

  const handleSaveQuotes = (updated: Quote[]) => {
    setQuotes(updated);
    saveQuotes(updated);
  };

  const handleSaveClients = (updated: Client[]) => {
    setClients(updated);
    saveClients(updated);
  };

  const handleSaveCatalog = (updated: CatalogItem[]) => {
    setCatalog(updated);
    saveCatalog(updated);
  };

  // Start new quote (with quota check)
  const handleNewQuote = () => {
    const quota = checkQuoteCreationAllowed(quotes, subscription);
    if (!quota.allowed) {
      handleOpenUpgradeModal(
        `Vous avez utilisé vos ${quota.limit} devis gratuits ce mois-ci. Débloquez les devis illimités pour 1 000 FCFA seulement !`
      );
      return;
    }
    const blank = createBlankQuote(quotes.length, company.themeColor);
    setCurrentQuote(blank);
    setActiveTab('editor');
  };

  // Start new quote for a specific client
  const handleNewQuoteForClient = (client: Client) => {
    const quota = checkQuoteCreationAllowed(quotes, subscription);
    if (!quota.allowed) {
      handleOpenUpgradeModal(
        `Vous avez utilisé vos ${quota.limit} devis gratuits ce mois-ci. Débloquez les devis illimités pour 1 000 FCFA seulement !`
      );
      return;
    }
    const blank = createBlankQuote(quotes.length, company.themeColor);
    blank.client = { ...client };
    setCurrentQuote(blank);
    setActiveTab('editor');
  };

  // Edit quote
  const handleEditQuote = (quote: Quote) => {
    setCurrentQuote(quote);
    setActiveTab('editor');
  };

  // Duplicate quote
  const handleDuplicateQuote = (quoteToDup: Quote) => {
    const quota = checkQuoteCreationAllowed(quotes, subscription);
    if (!quota.allowed) {
      handleOpenUpgradeModal(
        `Vous avez utilisé vos ${quota.limit} devis gratuits ce mois-ci. Passez en Pro pour dupliquer et créer des devis sans limite !`
      );
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const newQuote: Quote = {
      ...quoteToDup,
      id: `quote-${Date.now()}`,
      quoteNumber: generateQuoteNumber(quotes.length),
      date: today,
      validUntil: calculateValidUntil(today, quoteToDup.validityDays || 15),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newQuote, ...quotes];
    handleSaveQuotes(updated);
    setCurrentQuote(newQuote);
    setActiveTab('editor');
  };

  // Delete quote
  const handleDeleteQuote = (id: string) => {
    const updated = quotes.filter((q) => q.id !== id);
    handleSaveQuotes(updated);
  };

  // Update status
  const handleUpdateQuoteStatus = (id: string, newStatus: QuoteStatus) => {
    const updated = quotes.map((q) => (q.id === id ? { ...q, status: newStatus, updatedAt: new Date().toISOString() } : q));
    handleSaveQuotes(updated);
  };

  // Save quote from editor
  const handleSaveQuoteFromEditor = (savedQuote: Quote) => {
    const exists = quotes.some((q) => q.id === savedQuote.id);
    let updated: Quote[];
    if (exists) {
      updated = quotes.map((q) => (q.id === savedQuote.id ? savedQuote : q));
    } else {
      updated = [savedQuote, ...quotes];
    }
    handleSaveQuotes(updated);
    setActiveTab('quotes');
    setCurrentQuote(null);
  };

  // Add new client from editor
  const handleAddNewClient = (newClient: Client) => {
    if (!newClient.name.trim()) return;
    const exists = clients.some((c) => c.name.toLowerCase() === newClient.name.toLowerCase());
    if (!exists) {
      const updated = [newClient, ...clients];
      handleSaveClients(updated);
    }
  };

  // Export all data as JSON
  const handleExportAllData = () => {
    const backup = {
      company,
      quotes,
      clients,
      catalog,
      subscription,
      exportedAt: new Date().toISOString(),
      version: '1.1',
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SunuDevis_Sauvegarde_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import all data from JSON
  const handleImportAllData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.company) handleSaveCompany(data.company);
        if (data.quotes) handleSaveQuotes(data.quotes);
        if (data.clients) handleSaveClients(data.clients);
        if (data.catalog) handleSaveCatalog(data.catalog);
        if (data.subscription) handleUpdateSubscription(data.subscription);
        alert('Données importées avec succès !');
      } catch (err) {
        alert('Erreur lors de la lecture du fichier de sauvegarde.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Top App Bar */}
      <Header
        activeTab={activeTab}
        onNewQuote={handleNewQuote}
        quotesCount={quotes.length}
        subscription={subscription}
        quotesCountThisMonth={quotesCountThisMonth}
        onOpenUpgradeModal={() => handleOpenUpgradeModal()}
      />

      {/* Navigation (Desktop Tabs & Mobile Bar) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'editor' && !currentQuote) {
            handleNewQuote();
          } else {
            setActiveTab(tab as any);
          }
        }}
        quotesCount={quotes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Quotes List Tab */}
        {activeTab === 'quotes' && (
          <QuoteList
            quotes={quotes}
            company={company}
            subscription={subscription}
            quotesCountThisMonth={quotesCountThisMonth}
            onOpenUpgradeModal={handleOpenUpgradeModal}
            onNewQuote={handleNewQuote}
            onEditQuote={handleEditQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={handleDeleteQuote}
            onUpdateQuoteStatus={handleUpdateQuoteStatus}
          />
        )}

        {/* Quote Editor / Creator Tab */}
        {activeTab === 'editor' && currentQuote && (
          <QuoteEditor
            quote={currentQuote}
            company={company}
            subscription={subscription}
            savedClients={clients}
            catalog={catalog}
            onSaveQuote={handleSaveQuoteFromEditor}
            onCancel={() => {
              setActiveTab('quotes');
              setCurrentQuote(null);
            }}
            onAddNewClient={handleAddNewClient}
            onOpenUpgradeModal={handleOpenUpgradeModal}
          />
        )}

        {/* Clients Directory Tab */}
        {activeTab === 'clients' && (
          <ClientManager
            clients={clients}
            subscription={subscription}
            onSaveClients={handleSaveClients}
            onSelectClientForQuote={handleNewQuoteForClient}
            onOpenUpgradeModal={handleOpenUpgradeModal}
          />
        )}

        {/* Item Catalog Tab */}
        {activeTab === 'catalog' && (
          <ItemCatalog
            catalog={catalog}
            subscription={subscription}
            onSaveCatalog={handleSaveCatalog}
            onOpenUpgradeModal={handleOpenUpgradeModal}
            onSelectItemForQuote={(item) => {
              if (!currentQuote) {
                const quota = checkQuoteCreationAllowed(quotes, subscription);
                if (!quota.allowed) {
                  handleOpenUpgradeModal(
                    `Vous avez utilisé vos ${quota.limit} devis gratuits ce mois-ci. Débloquez les devis illimités pour 1 000 FCFA seulement !`
                  );
                  return;
                }
                const blank = createBlankQuote(quotes.length, company.themeColor);
                blank.items = [
                  {
                    id: `item-${Date.now()}`,
                    description: item.description,
                    details: item.details,
                    quantity: 1,
                    unit: item.unit,
                    unitPrice: item.unitPrice,
                  },
                ];
                setCurrentQuote(blank);
                setActiveTab('editor');
              } else {
                setCurrentQuote({
                  ...currentQuote,
                  items: [
                    ...currentQuote.items,
                    {
                      id: `item-${Date.now()}`,
                      description: item.description,
                      details: item.details,
                      quantity: 1,
                      unit: item.unit,
                      unitPrice: item.unitPrice,
                    },
                  ],
                });
                setActiveTab('editor');
              }
            }}
          />
        )}

        {/* Company Settings Tab */}
        {activeTab === 'company' && (
          <CompanySettings
            company={company}
            subscription={subscription}
            onSaveCompany={handleSaveCompany}
            onExportAllData={handleExportAllData}
            onImportAllData={handleImportAllData}
            onOpenUpgradeModal={handleOpenUpgradeModal}
          />
        )}
      </main>

      {/* Upgrade / Pricing Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={handleCloseUpgradeModal}
        subscription={subscription}
        onUpdateSubscription={handleUpdateSubscription}
        quotesCountThisMonth={quotesCountThisMonth}
        reason={upgradeModalReason}
      />
    </div>
  );
}
