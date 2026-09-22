import React, { useState } from 'react';
import { Client, Subscription } from '../types';
import { Users, Plus, Search, Trash2, Edit2, Phone, Mail, MapPin, UserCheck, MessageSquare, Crown } from 'lucide-react';
import { formatDisplayPhone, cleanPhoneForWhatsApp } from '../utils/formatters';

interface ClientManagerProps {
  clients: Client[];
  subscription: Subscription;
  onSaveClients: (clients: Client[]) => void;
  onSelectClientForQuote?: (client: Client) => void;
  onOpenUpgradeModal?: (reason?: string) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  subscription,
  onSaveClients,
  onSelectClientForQuote,
  onOpenUpgradeModal,
}) => {
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isPro = subscription.plan === 'pro';
  const maxClients = subscription.maxClients || 5;
  const isLimitReached = !isPro && clients.length >= maxClients;

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name.trim()) return;

    if (isCreating) {
      const newClients = [{ ...editingClient, id: `client-${Date.now()}` }, ...clients];
      onSaveClients(newClients);
    } else {
      const newClients = clients.map((c) => (c.id === editingClient.id ? editingClient : c));
      onSaveClients(newClients);
    }

    setEditingClient(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce client ?')) {
      onSaveClients(clients.filter((c) => c.id !== id));
    }
  };

  const startCreate = () => {
    if (isLimitReached) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal(`Vous avez atteint la limite de ${maxClients} clients de la version Découverte. Passez à SunuDevis Pro pour un répertoire illimité !`);
      }
      return;
    }
    setEditingClient({
      id: '',
      name: '',
      type: 'individual',
      phone: '',
      email: '',
      address: '',
      city: 'Dakar',
      ninea: '',
      rccm: '',
    });
    setIsCreating(true);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleaned = cleanPhoneForWhatsApp(phone);
    if (!cleaned) return;
    const text = encodeURIComponent(`Bonjour ${name}, nous vous contactons concernant vos devis.`);
    window.open(`https://wa.me/${cleaned}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 pb-20">
      {/* Top Header - High Density */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Répertoire Clients</h2>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {clients.length} {isPro ? '' : `/ ${maxClients} (Découverte)`}
            </span>
            {!isPro && (
              <button
                onClick={() => onOpenUpgradeModal && onOpenUpgradeModal('Débloquez un répertoire client illimité avec SunuDevis Pro !')}
                className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100 transition flex items-center gap-1"
              >
                <Crown className="w-2.5 h-2.5" />
                <span>Illimité Pro</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Gérez vos clients réguliers pour les ajouter en 1 clic à vos futurs devis
          </p>
        </div>

        <button
          id="btn-add-client"
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone (+221), quartier ou ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 transition shadow-sm flex flex-col justify-between space-y-2.5"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center font-mono shrink-0">
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                      {client.name}
                    </h4>
                    <span className="text-[9px] uppercase font-bold text-slate-400">
                      {client.type === 'company' ? 'Entreprise' : 'Particulier'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setEditingClient(client);
                      setIsCreating(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                {client.phone && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{formatDisplayPhone(client.phone)}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {(client.city || client.address) && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {client.address ? `${client.address}, ` : ''}{client.city}
                    </span>
                  </div>
                )}
                {client.ninea && (
                  <div className="font-mono text-[10px] text-slate-500">
                    NINEA : {client.ninea}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
              {client.phone ? (
                <button
                  onClick={() => openWhatsApp(client.phone, client.name)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-1 rounded-lg transition"
                >
                  <MessageSquare className="w-3 h-3 text-green-600" />
                  <span>WhatsApp</span>
                </button>
              ) : <div />}

              {onSelectClientForQuote && (
                <button
                  onClick={() => onSelectClientForQuote(client)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition"
                >
                  <UserCheck className="w-3 h-3 text-slate-600" />
                  <span>Créer un devis</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-800 font-bold text-sm">Aucun client trouvé</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Commencez par ajouter votre premier client ou modifiez votre recherche.
          </p>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un client</span>
          </button>
        </div>
      )}

      {/* Modal for Create & Edit Client */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 my-8 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {isCreating ? 'Ajouter un nouveau client' : 'Modifier le client'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Annuler
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Type de client :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient({ ...editingClient, type: 'individual' })}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    editingClient.type === 'individual'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Particulier
                </button>
                <button
                  type="button"
                  onClick={() => setEditingClient({ ...editingClient, type: 'company' })}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    editingClient.type === 'company'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Entreprise / Pro
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Nom complet ou Raison Sociale * :
              </label>
              <input
                type="text"
                required
                value={editingClient.name}
                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                placeholder="Ex: Moussa Diop ou Baobab SARL"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Téléphone (Sénégal) :
                </label>
                <input
                  type="text"
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  placeholder="Ex : 77 123 45 67"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Ville :
                </label>
                <input
                  type="text"
                  value={editingClient.city}
                  onChange={(e) => setEditingClient({ ...editingClient, city: e.target.value })}
                  placeholder="Dakar, Thiès, Touba..."
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Adresse / Quartier :
              </label>
              <input
                type="text"
                value={editingClient.address}
                onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                placeholder="Ex: Almadies, Sacré-Cœur, Mbour..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Adresse E-mail :
              </label>
              <input
                type="email"
                value={editingClient.email}
                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                placeholder="client@gmail.com"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {editingClient.type === 'company' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    NINEA :
                  </label>
                  <input
                    type="text"
                    value={editingClient.ninea}
                    onChange={(e) => setEditingClient({ ...editingClient, ninea: e.target.value })}
                    placeholder="001234567 2G2"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    RCCM :
                  </label>
                  <input
                    type="text"
                    value={editingClient.rccm}
                    onChange={(e) => setEditingClient({ ...editingClient, rccm: e.target.value })}
                    placeholder="SN.DKR..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
