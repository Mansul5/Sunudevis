import React, { useState } from 'react';
import { CatalogItem, Subscription } from '../types';
import { Package, Plus, Search, Trash2, Edit2, Tag, Crown } from 'lucide-react';
import { formatFCFA } from '../utils/formatters';

interface ItemCatalogProps {
  catalog: CatalogItem[];
  subscription: Subscription;
  onSaveCatalog: (catalog: CatalogItem[]) => void;
  onSelectItemForQuote?: (item: CatalogItem) => void;
  onOpenUpgradeModal?: (reason?: string) => void;
}

export const ItemCatalog: React.FC<ItemCatalogProps> = ({
  catalog,
  subscription,
  onSaveCatalog,
  onSelectItemForQuote,
  onOpenUpgradeModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isPro = subscription.plan === 'pro';
  const maxItems = subscription.maxCatalogItems || 5;
  const isLimitReached = !isPro && catalog.length >= maxItems;

  const categories = Array.from(new Set(catalog.map((i) => i.category || 'Général'))).filter(Boolean);

  const filteredItems = catalog.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      (item.details && item.details.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || (item.category || 'Général') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.description.trim()) return;

    if (isCreating) {
      const newCatalog = [{ ...editingItem, id: `cat-${Date.now()}` }, ...catalog];
      onSaveCatalog(newCatalog);
    } else {
      const newCatalog = catalog.map((i) => (i.id === editingItem.id ? editingItem : i));
      onSaveCatalog(newCatalog);
    }

    setEditingItem(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous supprimer cet article du catalogue ?')) {
      onSaveCatalog(catalog.filter((i) => i.id !== id));
    }
  };

  const startCreate = () => {
    if (isLimitReached) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal(`Vous avez atteint la limite de ${maxItems} articles de la version Découverte. Débloquez un catalogue illimité avec SunuDevis Pro !`);
      }
      return;
    }
    setEditingItem({
      id: '',
      description: '',
      details: '',
      unit: 'Unité',
      unitPrice: 10000,
      category: 'Général',
    });
    setIsCreating(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 pb-20">
      {/* Top Bar - High Density */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Catalogue Articles & Services</h2>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {catalog.length} {isPro ? '' : `/ ${maxItems} (Découverte)`}
            </span>
            {!isPro && (
              <button
                onClick={() => onOpenUpgradeModal && onOpenUpgradeModal('Débloquez un catalogue d\'articles et prestations illimité avec SunuDevis Pro !')}
                className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100 transition flex items-center gap-1"
              >
                <Crown className="w-2.5 h-2.5" />
                <span>Illimité Pro</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Enregistrez vos tarifs réguliers en FCFA pour remplir vos devis en 1 clic
          </p>
        </div>

        <button
          id="btn-add-catalog-item"
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter un Article</span>
        </button>
      </div>

      {/* Search & Category filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un produit, une prestation, un forfait..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tous ({catalog.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items Grid - High Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 transition shadow-sm flex flex-col justify-between space-y-2.5"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                    {item.category || 'Général'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 leading-snug">
                    {item.description}
                  </h4>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsCreating(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {item.details && (
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded">
                  {item.details}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Prix unitaire</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm sm:text-base font-black font-mono text-slate-900">
                    {formatFCFA(item.unitPrice)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">/ {item.unit}</span>
                </div>
              </div>

              {onSelectItemForQuote && (
                <button
                  onClick={() => onSelectItemForQuote(item)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
                >
                  Ajouter au devis
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-800 font-bold text-sm">Aucun article trouvé</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Ajoutez vos produits ou prestations fréquentes pour les réutiliser facilement.
          </p>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un article</span>
          </button>
        </div>
      )}

      {/* Edit / Create modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 my-8 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {isCreating ? 'Ajouter un article au catalogue' : "Modifier l'article"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Annuler
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Désignation de la prestation ou de l'article * :
              </label>
              <input
                type="text"
                required
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Ex: Pose de carrelage, Confection robe, Sac de ciment..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Catégorie :
              </label>
              <input
                type="text"
                value={editingItem.category || ''}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                placeholder="Ex: Construction, Informatique, Beauté, Transport..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Prix Unitaire (FCFA) * :
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingItem.unitPrice}
                  onChange={(e) => setEditingItem({ ...editingItem, unitPrice: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Unité de mesure :
                </label>
                <select
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Unité">Unité</option>
                  <option value="Forfait">Forfait</option>
                  <option value="Heure">Heure</option>
                  <option value="Jour">Jour</option>
                  <option value="Mois">Mois</option>
                  <option value="Prestation">Prestation</option>
                  <option value="Mètre">Mètre (m)</option>
                  <option value="m²">Mètre carré (m²)</option>
                  <option value="Kg">Kilogramme (kg)</option>
                  <option value="Sac">Sac</option>
                  <option value="Carton">Carton</option>
                  <option value="Lot">Lot</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Détails / Caractéristiques (Optionnel) :
              </label>
              <textarea
                rows={2}
                value={editingItem.details || ''}
                onChange={(e) => setEditingItem({ ...editingItem, details: e.target.value })}
                placeholder="Précisions sur les garanties, matériaux, délais..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
              >
                Enregistrer l'article
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
