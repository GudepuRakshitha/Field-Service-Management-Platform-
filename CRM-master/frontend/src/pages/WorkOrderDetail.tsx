import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Attachment, Part, WorkOrder, WorkOrderStatusHistory, WorkOrderStatus } from '../api/types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { useAuth } from '../auth/AuthContext';
import { ComicLoadingScreen } from '../components/ComicLoadingScreen';
import { ArrowLeft, CheckCircle, Clock, HardHat, Package, Play, Pause, XCircle, RotateCcw, Lock, X, Camera, Printer, Upload, Image as ImageIcon, DollarSign } from 'lucide-react';

export const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const woId = Number(id);

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [history, setHistory] = useState<WorkOrderStatusHistory[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Upload State
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | ''>('');
  const [qtyUsed, setQtyUsed] = useState(1);
  const [partError, setPartError] = useState('');
  const [loggingPart, setLoggingPart] = useState(false);

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [timeNote, setTimeNote] = useState('');
  const [loggingTime, setLoggingTime] = useState(false);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<'BEFORE' | 'AFTER' | 'INSPECTION' | 'GENERAL'>('BEFORE');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [statusNote, setStatusNote] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  const { user, isManager, isDispatcher, isTechnician, isCustomer } = useAuth();

  const loadDetails = async () => {
    setLoading(true);
    try {
      const wo = await api.getWorkOrderById(woId);
      setWorkOrder(wo);

      const hist = await api.getStatusHistory(woId);
      setHistory(hist);

      const atts = await api.getWorkOrderAttachments(woId);
      setAttachments(atts);
    } catch (err: any) {
      console.error('Failed to load work order details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (woId) loadDetails();
  }, [woId]);

  const loadPartsCatalog = async () => {
    try {
      const res = await api.getParts({ size: 100 });
      setParts(res.content);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusTransition = async (toStatus: WorkOrderStatus) => {
    setTransitioning(true);
    try {
      await api.changeStatus(woId, { toStatus, note: statusNote || undefined });
      setStatusNote('');
      loadDetails();
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  const handleLogPartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || qtyUsed < 1) return;

    setPartError('');
    setLoggingPart(true);
    try {
      await api.logPartUsage(woId, {
        partId: Number(selectedPartId),
        qtyUsed,
      });
      setIsPartModalOpen(false);
      setSelectedPartId('');
      setQtyUsed(1);
      loadDetails();
    } catch (err: any) {
      setPartError(err.message || 'Failed to log part usage');
    } finally {
      setLoggingPart(false);
    }
  };

  const handleLogTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeMinutes < 1) return;

    setLoggingTime(true);
    try {
      await api.logTime(woId, {
        minutes: timeMinutes,
        note: timeNote,
      });
      setIsTimeModalOpen(false);
      setTimeMinutes(30);
      setTimeNote('');
      loadDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to log labor time');
    } finally {
      setLoggingTime(false);
    }
  };

  const handleUploadPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setPhotoError('');
    setUploadingPhoto(true);
    try {
      await api.uploadWorkOrderAttachment(woId, selectedFile, photoType);
      setIsPhotoModalOpen(false);
      setSelectedFile(null);
      loadDetails();
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return <ComicLoadingScreen message="LOADING WORK ORDER..." subtitle="Fetching Job Details" />;
  }

  if (!workOrder) {
    return <div className="p-8 text-center text-slate-400">Work Order not found or access denied.</div>;
  }

  const isAssignedTech = workOrder.assignedToId === user?.id;
  const isTerminal = workOrder.status === 'CLOSED' || workOrder.status === 'CANCELLED';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Back Link & Print Action */}
      <div className="flex items-center justify-between no-print">
        <Link to="/work-orders" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> Back to Work Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Main Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-extrabold text-indigo-400">{workOrder.code}</span>
              <PriorityBadge priority={workOrder.priority} />
              <StatusBadge status={workOrder.status} />
              <SlaBadge status={workOrder.slaStatus} dueAt={workOrder.slaDueAt} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{workOrder.title}</h1>
          </div>

          {!isCustomer && !isTerminal && (
            <div className="flex flex-wrap gap-2 no-print">
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-3.5 py-2 bg-blue-950/40 hover:border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" /> Attach Photo
              </button>

              <button
                onClick={() => {
                  loadPartsCatalog();
                  setIsPartModalOpen(true);
                }}
                className="px-3.5 py-2 bg-blue-950/40 hover:border-indigo-500/50 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Package className="w-4 h-4" /> Log Parts
              </button>

              <button
                onClick={() => setIsTimeModalOpen(true)}
                className="px-3.5 py-2 bg-blue-950/40 hover:border-amber-500/50 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" /> Log Labor Time
              </button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Customer</span>
            <div className="font-semibold text-white text-base">{workOrder.customerName}</div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Site Location</span>
            <div className="font-semibold text-white text-base">{workOrder.siteName}</div>
            <div className="text-xs text-slate-400">{workOrder.siteAddress}</div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Assigned Technician</span>
            <div className="font-semibold text-amber-300 text-base flex items-center gap-1.5">
              <HardHat className="w-4 h-4" />
              {workOrder.assignedToName || <span className="text-slate-500 italic font-normal">Unassigned</span>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Work Description</span>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {workOrder.description || 'No additional work description provided.'}
          </p>
        </div>

        {/* Cost & Labor Rollup */}
        {!isCustomer && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20">
              <div>
                <span className="text-xs text-indigo-300">Total Parts Cost</span>
                <div className="text-lg font-bold text-white">${(workOrder.totalPartsCost || 0).toFixed(2)}</div>
              </div>
              <div>
                <span className="text-xs text-indigo-300">Total Labor Spent</span>
                <div className="text-lg font-bold text-white">{workOrder.totalLaborMinutes || 0} minutes</div>
              </div>
              <div>
                <span className="text-xs text-indigo-300">Created Date</span>
                <div className="text-xs font-medium text-slate-300 mt-1">
                  {new Date(workOrder.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-xs text-indigo-300">SLA Target</span>
                <div className="text-xs font-medium text-slate-300 mt-1">
                  {new Date(workOrder.slaDueAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* ERP Invoice Financial Breakdown */}
            {(() => {
              const partsCost = workOrder.totalPartsCost || 0;
              const laborHours = (workOrder.totalLaborMinutes || 0) / 60;
              const laborRate = 85.0; // $85/hr standard field service rate
              const laborCost = laborHours * laborRate;
              const subtotal = partsCost + laborCost;
              const tax = subtotal * 0.08;
              const grandTotal = subtotal + tax;

              return (
                <div className="p-4 rounded-xl glass-panel space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-900/40 pb-2">
                    <span className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" /> ERP Invoice & Billing Financial Summary
                    </span>
                    {workOrder.status === 'CLOSED' || workOrder.status === 'COMPLETED' ? (
                      <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                        READY FOR BILLING / PAID
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                        ESTIMATE / WORK IN PROGRESS
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Parts Subtotal</span>
                      <span className="font-bold text-white">${partsCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Labor ({laborHours.toFixed(1)} hrs @ $85/hr)</span>
                      <span className="font-bold text-white">${laborCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Est. Tax (8%)</span>
                      <span className="font-bold text-white">${tax.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-sky-400">Total Invoice Amount</span>
                      <span className="text-base font-black text-emerald-400">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Field Photos & Attachments Gallery */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" /> Field Photos & Inspection Attachments ({attachments.length})
          </h3>
          {!isCustomer && !isTerminal && (
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 no-print"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Photo
            </button>
          )}
        </div>

        {attachments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
            <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-medium">No photo attachments uploaded yet.</div>
            <p className="text-xs text-slate-600">Technicians can upload before/after photos during site service.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((att) => (
              <div key={att.id} className="glass-panel rounded-xl overflow-hidden flex flex-col justify-between group">
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={att.url}
                    alt={att.originalFilename}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    att.attachmentType === 'BEFORE' ? 'bg-amber-500/90 text-black' :
                    att.attachmentType === 'AFTER' ? 'bg-emerald-500/90 text-black' :
                    att.attachmentType === 'INSPECTION' ? 'bg-sky-500/90 text-black' : 'bg-slate-700 text-white'
                  }`}>
                    {att.attachmentType}
                  </span>
                </div>
                <div className="p-3 space-y-1 text-xs">
                  <div className="font-semibold text-white truncate" title={att.originalFilename}>{att.originalFilename}</div>
                  <div className="text-slate-400 flex items-center justify-between text-[11px]">
                    <span>By {att.uploadedByName}</span>
                    <span>{new Date(att.createdAt).toLocaleDateString()}</span>
                  </div>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-indigo-400 hover:underline text-[11px] font-medium"
                  >
                    View Full Image ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guarded State Machine Transition Action Panel */}
      {!isCustomer && !isTerminal && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 no-print">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-400" /> State Machine Actions
          </h3>

          <div className="flex flex-wrap gap-3 items-center">
            {workOrder.status === 'ASSIGNED' && (isAssignedTech || isManager || isDispatcher) && (
              <button
                onClick={() => handleStatusTransition('IN_PROGRESS')}
                disabled={transitioning}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Start Work (In Progress)
              </button>
            )}

            {workOrder.status === 'IN_PROGRESS' && (isAssignedTech || isManager || isDispatcher) && (
              <>
                <button
                  onClick={() => handleStatusTransition('ON_HOLD')}
                  disabled={transitioning}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" /> Place On Hold
                </button>
                <button
                  onClick={() => handleStatusTransition('COMPLETED')}
                  disabled={transitioning}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Complete Work
                </button>
              </>
            )}

            {workOrder.status === 'ON_HOLD' && (isAssignedTech || isManager || isDispatcher) && (
              <button
                onClick={() => handleStatusTransition('IN_PROGRESS')}
                disabled={transitioning}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Resume Work
              </button>
            )}

            {workOrder.status === 'COMPLETED' && (isManager || isDispatcher) && (
              <button
                onClick={() => handleStatusTransition('IN_PROGRESS')}
                disabled={transitioning}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Re-open Work Order
              </button>
            )}

            {workOrder.status === 'COMPLETED' && isManager && (
              <button
                onClick={() => handleStatusTransition('CLOSED')}
                disabled={transitioning}
                className="px-4 py-2 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Close & Archive Work Order
              </button>
            )}

            {(workOrder.status === 'NEW' || workOrder.status === 'ASSIGNED') && (isManager || isDispatcher) && (
              <button
                onClick={() => handleStatusTransition('CANCELLED')}
                disabled={transitioning}
                className="px-4 py-2 bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 font-semibold rounded-xl text-sm flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Cancel Work Order
              </button>
            )}
          </div>
        </div>
      )}

      {/* Append-Only Work Order Status History Timeline */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-lg text-white">Append-Only Status Audit History</h3>

        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
          {history.map((h) => (
            <div key={h.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-slate-950"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>
                    {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `Created as ${h.toStatus}`}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">by {h.changedByName}</span>
                </div>
                <div className="text-xs text-slate-500">{new Date(h.changedAt).toLocaleString()}</div>
              </div>
              {h.note && <div className="text-xs text-slate-400 mt-1 italic">"{h.note}"</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" /> Upload Field Photo
              </h3>
              <button onClick={() => setIsPhotoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {photoError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {photoError}
              </div>
            )}

            <form onSubmit={handleUploadPhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Attachment Category</label>
                <select
                  value={photoType}
                  onChange={(e: any) => setPhotoType(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-sm"
                >
                  <option value="BEFORE">Before Inspection / Repair</option>
                  <option value="AFTER">After Completion</option>
                  <option value="INSPECTION">Inspection Log / Part</option>
                  <option value="GENERAL">General Document / Photo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Choose Photo File *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto || !selectedFile}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Part Modal */}
      {isPartModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Log Parts Used</h3>
              <button onClick={() => setIsPartModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {partError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {partError}
              </div>
            )}

            <form onSubmit={handleLogPartSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Part *</label>
                <select
                  required
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(Number(e.target.value))}
                  className="w-full rounded-xl p-2.5 text-sm"
                >
                  <option value="">-- Choose Part --</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku}) — In Stock: {p.stockQty} — ${p.unitCost.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Quantity Used *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qtyUsed}
                  onChange={(e) => setQtyUsed(Number(e.target.value))}
                  className="w-full rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPartModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loggingPart || !selectedPartId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {loggingPart ? 'Saving...' : 'Deduct & Log Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Labor Time Modal */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Log Labor Time</h3>
              <button onClick={() => setIsTimeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogTimeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Minutes Spent *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(Number(e.target.value))}
                  className="w-full rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Work Log Note</label>
                <textarea
                  rows={3}
                  value={timeNote}
                  onChange={(e) => setTimeNote(e.target.value)}
                  placeholder="Summary of labor performed..."
                  className="w-full rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTimeModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loggingTime || timeMinutes < 1}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {loggingTime ? 'Saving...' : 'Record Labor Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
