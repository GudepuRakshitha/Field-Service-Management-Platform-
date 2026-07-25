import React, { useEffect, useState } from 'react';
import { Customer, Site } from '../api/types';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ComicLoadingScreen } from '../components/ComicLoadingScreen';
import { useAuth } from '../auth/AuthContext';
import {
  Building2,
  Plus,
  MapPin,
  Mail,
  Search,
  Building,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const CustomersList: React.FC = () => {
  const { isManager, isDispatcher } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);
  const [sites, setSites] = useState<Record<number, Site[]>>({});
  const [sitesLoading, setSitesLoading] = useState<Record<number, boolean>>({});

  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');

  const [addSiteModalOpen, setAddSiteModalOpen] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState<number | null>(null);
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canManage = isManager || isDispatcher;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.getCustomers({ query: search, size: 100 });
      setCustomers(response.content || []);
    } catch (e) {
      console.error('Failed to load customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const toggleExpandCustomer = async (id: number) => {
    if (expandedCustomerId === id) {
      setExpandedCustomerId(null);
      return;
    }
    setExpandedCustomerId(id);
    if (!sites[id]) {
      setSitesLoading((prev) => ({ ...prev, [id]: true }));
      try {
        const data = await api.getCustomerSites(id);
        setSites((prev) => ({ ...prev, [id]: data }));
      } catch (e) {
        console.error('Failed to load customer sites', e);
      } finally {
        setSitesLoading((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createCustomer({ name: custName, contactEmail: custEmail });
      setSuccess(`Customer Organization '${custName}' registered successfully!`);
      setAddCustomerModalOpen(false);
      setCustName('');
      setCustEmail('');
      fetchCustomers();
    } catch (err: any) {
      setError(err.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddSiteModal = (cId: number) => {
    setTargetCustomerId(cId);
    setAddSiteModalOpen(true);
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomerId) return;
    setError('');
    setSubmitting(true);
    try {
      await api.createSite(targetCustomerId, { name: siteName, address: siteAddress });
      setSuccess(`Facility Site '${siteName}' created!`);
      setAddSiteModalOpen(false);
      setSiteName('');
      setSiteAddress('');
      const updated = await api.getCustomerSites(targetCustomerId);
      setSites((prev) => ({ ...prev, [targetCustomerId]: updated }));
      fetchCustomers();
    } catch (err: any) {
      setError(err.message || 'Failed to create site');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ComicLoadingScreen message="LOADING CUSTOMERS..." subtitle="Retrieving Tenant Directory" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Customers & Site Facilities"
        subtitle="Multi-tenant client organizations, commercial site directory, and physical facility location management."
        icon={<Building2 className="w-7 h-7 text-sky-400" />}
        actions={
          canManage ? (
            <Button
              onClick={() => setAddCustomerModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> + Register Customer Tenant
            </Button>
          ) : undefined
        }
      />

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-sm font-medium flex items-center justify-between shadow-lg">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer organization name..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Customer Directory Cards */}
      {customers.length === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-2">
          <Building className="w-10 h-10 mx-auto text-slate-600" />
          <div className="font-semibold text-slate-300">No customers registered</div>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((c) => {
            const isExpanded = expandedCustomerId === c.id;
            const customerSites = sites[c.id] || [];

            return (
              <div key={c.id} className="glass-panel rounded-2xl overflow-hidden shadow-xl transition-all">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-600/30 shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-lg font-black text-white">{c.name}</div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1.5 font-mono text-sky-400">
                          <Mail className="w-3.5 h-3.5" /> {c.contactEmail}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-300">
                          <Building className="w-3.5 h-3.5 text-blue-400" /> {c.sitesCount} Facilities / Sites
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {canManage && (
                      <button
                        onClick={() => openAddSiteModal(c.id)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4 text-sky-400" /> + Add Site Facility
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpandCustomer(c.id)}
                      className="px-3.5 py-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 text-slate-200 border border-blue-900/40 text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      {isExpanded ? (
                        <>Hide Sites <ChevronUp className="w-4 h-4 text-sky-400" /></>
                      ) : (
                        <>View Sites ({c.sitesCount}) <ChevronDown className="w-4 h-4 text-sky-400" /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Sites Section — theme-aware */}
                {isExpanded && (
                  <div className="border-t border-blue-900/30 glass-panel rounded-none p-5 space-y-3">
                    <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-sky-400" /> Facilities & Locations for {c.name}
                    </div>

                    {sitesLoading[c.id] ? (
                      <div className="text-xs text-slate-400 py-4">Loading sites...</div>
                    ) : customerSites.length === 0 ? (
                      <div className="text-xs text-slate-400 py-4">
                        No sites recorded for this customer. Click '+ Add Site Facility' to add one.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {customerSites.map((s) => (
                          <div
                            key={s.id}
                            className="p-3.5 rounded-xl glass-panel border border-blue-900/40 space-y-1"
                          >
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-sky-400 shrink-0" /> {s.name}
                            </div>
                            <div className="text-xs text-slate-400 leading-relaxed font-medium">
                              {s.address}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={addCustomerModalOpen} onClose={() => setAddCustomerModalOpen(false)} title="Register Customer Tenant Organization">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Organization Name</label>
            <input type="text" required value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="e.g. Metro Commercial Properties" className="w-full rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Primary Contact Email</label>
            <input type="email" required value={custEmail} onChange={(e) => setCustEmail(e.target.value)} placeholder="dispatch@metroprops.com" className="w-full rounded-xl" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/60">
            <Button type="button" variant="outline" onClick={() => setAddCustomerModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold">Register Customer</Button>
          </div>
        </form>
      </Modal>

      {/* Add Site Modal */}
      {addSiteModalOpen && (
        <Modal isOpen={addSiteModalOpen} onClose={() => setAddSiteModalOpen(false)} title="Add Physical Site Facility Location">
          <form onSubmit={handleCreateSite} className="space-y-4">
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Facility Site Name</label>
              <input type="text" required value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="e.g. Tower B - Central HVAC Room" className="w-full rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Full Street Address</label>
              <textarea required rows={3} value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} placeholder="789 Market Street, Floor 4, San Francisco, CA 94103" className="w-full rounded-xl" />
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/60">
              <Button type="button" variant="outline" onClick={() => setAddSiteModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting} className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold">Save Site Location</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
