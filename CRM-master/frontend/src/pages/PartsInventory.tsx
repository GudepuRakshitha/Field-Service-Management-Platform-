import React, { useEffect, useState } from 'react';
import { Part } from '../api/types';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useAuth } from '../auth/AuthContext';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Boxes,
  DollarSign,
  Barcode,
  Edit,
  TrendingDown
} from 'lucide-react';

export const PartsInventory: React.FC = () => {
  const { isManager } = useAuth();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Part Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [stockQty, setStockQty] = useState('');

  // Edit / Restock Modal
  const [editPart, setEditPart] = useState<Part | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editUnitCost, setEditUnitCost] = useState('');
  const [editStockQty, setEditStockQty] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchParts = async () => {
    setLoading(true);
    try {
      const response = await api.getParts({ query: search, size: 100 });
      setParts(response.content || []);
    } catch (e) {
      console.error('Failed to load parts inventory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [search]);

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createPart({
        name,
        sku,
        unitCost: parseFloat(unitCost),
        stockQty: parseInt(stockQty, 10),
      });
      setSuccess(`Part '${name}' added to inventory catalog!`);
      setAddModalOpen(false);
      setName('');
      setSku('');
      setUnitCost('');
      setStockQty('');
      fetchParts();
    } catch (err: any) {
      setError(err.message || 'Failed to create part');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (p: Part) => {
    setEditPart(p);
    setEditName(p.name);
    setEditSku(p.sku);
    setEditUnitCost(p.unitCost.toString());
    setEditStockQty(p.stockQty.toString());
  };

  const handleUpdatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPart) return;
    setError('');
    setSubmitting(true);
    try {
      await api.updatePart(editPart.id, {
        name: editName,
        sku: editSku,
        unitCost: parseFloat(editUnitCost),
        stockQty: parseInt(editStockQty, 10),
      });
      setSuccess(`Updated stock quantity & details for '${editName}'!`);
      setEditPart(null);
      fetchParts();
    } catch (err: any) {
      setError(err.message || 'Failed to update part');
    } finally {
      setSubmitting(false);
    }
  };

  const totalInventoryValue = parts.reduce((acc, p) => acc + p.unitCost * p.stockQty, 0);
  const lowStockCount = parts.filter((p) => p.stockQty <= 5).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Parts & Inventory Catalog"
        subtitle="Manage spare parts, monitor warehouse stock levels, unit costs, and trigger restock orders."
        icon={<Package className="w-7 h-7 text-sky-400" />}
        actions={
          isManager ? (
            <Button
              onClick={() => setAddModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> + Add New Part Catalog
            </Button>
          ) : undefined
        }
      />

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-4 rounded-2xl text-sm font-medium flex items-center justify-between shadow-lg">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SKUs in Catalog</div>
            <div className="text-2xl font-black text-white">{parts.length} Items</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inventory Valuation</div>
            <div className="text-2xl font-black text-white">${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${lowStockCount > 0 ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-800/40 border-slate-700 text-slate-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts (&le; 5)</div>
            <div className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>{lowStockCount} Parts</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU or part name..."
            className="w-full pl-10 pr-4 py-2 bg-[#081324] border border-blue-900/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Parts Directory Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading parts inventory catalog...</div>
        ) : parts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-600" />
            <div className="font-semibold text-slate-300">No parts found</div>
            <div className="text-xs text-slate-500">Try adjusting your search criteria.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#08152b] text-xs uppercase font-extrabold text-blue-300 border-b border-blue-900/40">
                <tr>
                  <th className="px-6 py-4 text-center">Part Name</th>
                  <th className="px-6 py-4 text-center">SKU Code</th>
                  <th className="px-6 py-4 text-center">Unit Cost</th>
                  <th className="px-6 py-4 text-center">In-Stock Quantity</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  {isManager && <th className="px-6 py-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/30">
                {parts.map((p) => {
                  const isLow = p.stockQty <= 5;
                  const isOut = p.stockQty === 0;

                  return (
                    <tr key={p.id} className="hover:bg-blue-950/30 transition-colors">
                      <td className="px-6 py-4 text-left font-bold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left font-mono text-xs text-sky-300">
                        <div className="flex justify-start">
                          <span className="inline-flex items-center gap-1.5 bg-sky-950/50 px-2.5 py-1 rounded-lg border border-sky-800/40">
                            <Barcode className="w-3.5 h-3.5 text-sky-400" /> {p.sku}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left font-bold text-emerald-400">${p.unitCost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-left font-extrabold text-base text-white">{p.stockQty} units</td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/40">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40 animate-pulse">
                              <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>
                      {isManager && (
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center justify-start">
                            <button
                              onClick={() => openEditModal(p)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5"
                            >
                              <Edit className="w-3.5 h-3.5 text-sky-400" /> Restock / Edit
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Part Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Inventory Catalog Part">
        <form onSubmit={handleCreatePart} className="space-y-4">
          {error && <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Part Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 50kW Compressor Pump" className="w-full" />
          </div>

          <div>
            <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">SKU Number</label>
            <input type="text" required value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. COMP-50KW-X" className="w-full font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Unit Cost ($)</label>
              <input type="number" step="0.01" required value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="149.99" className="w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Initial Stock Qty</label>
              <input type="number" required value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="25" className="w-full" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-blue-900/40">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold">Add to Inventory</Button>
          </div>
        </form>
      </Modal>

      {/* Edit / Restock Modal */}
      {editPart && (
        <Modal isOpen={!!editPart} onClose={() => setEditPart(null)} title={`Restock & Edit '${editPart.name}'`}>
          <form onSubmit={handleUpdatePart} className="space-y-4">
            {error && <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs">{error}</div>}

            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Part Name</label>
              <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">SKU Code</label>
              <input type="text" required value={editSku} onChange={(e) => setEditSku(e.target.value)} className="w-full font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Unit Cost ($)</label>
                <input type="number" step="0.01" required value={editUnitCost} onChange={(e) => setEditUnitCost(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Restock Quantity</label>
                <input type="number" required value={editStockQty} onChange={(e) => setEditStockQty(e.target.value)} className="w-full font-bold text-sky-400" />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-blue-900/40">
              <Button type="button" variant="outline" onClick={() => setEditPart(null)}>Cancel</Button>
              <Button type="submit" loading={submitting} className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold">Update Stock</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
