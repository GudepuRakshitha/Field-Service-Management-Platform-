import React, { useEffect, useState } from 'react';
import { User, Customer } from '../api/types';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  UserPlus,
  Users,
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  ShieldCheck,
  HardHat,
  User as UserIcon,
  Shield,
  Key,
  CheckSquare,
  Square,
  UserX,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ALL_PERMISSIONS = [
  { id: 'CREATE_WORK_ORDERS', label: 'Raise & Create Work Orders', desc: 'Can submit maintenance requests' },
  { id: 'ASSIGN_TECHNICIANS', label: 'Assign & Dispatch Technicians', desc: 'Can assign field techs on Kanban board' },
  { id: 'EXECUTE_FIELD_JOBS', label: 'Execute Field Jobs & Log Parts', desc: 'Can update job status, log labor & parts' },
  { id: 'CLOSE_WORK_ORDERS', label: 'Close & Archive Work Orders', desc: 'Can approve completion & close jobs' },
  { id: 'MANAGE_INVENTORY', label: 'Manage Parts Inventory', desc: 'Can create parts and edit stock levels' },
  { id: 'MANAGE_TENANTS', label: 'Manage Customer Tenants & Sites', desc: 'Can create customer orgs and sites' },
  { id: 'MANAGE_USERS', label: 'Manage Users & Permissions', desc: 'Can create user accounts & assign RBAC permissions' },
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [tenantFilter, setTenantFilter] = useState<string>('ALL');

  // Create User Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string>('TECHNICIAN');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'EXECUTE_FIELD_JOBS'
  ]);

  // Edit Permissions Modal State
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [updatingPerms, setUpdatingPerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersData, customersData] = await Promise.all([
        api.getAllUsers(),
        api.getCustomers()
      ]);
      setUsers(usersData);
      setCustomers(customersData.content || []);
    } catch (e) {
      console.error('Failed to load user directory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update default permissions on role change
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    switch (newRole) {
      case 'MANAGER':
        setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id));
        break;
      case 'DISPATCHER':
        setSelectedPermissions(['CREATE_WORK_ORDERS', 'ASSIGN_TECHNICIANS', 'EXECUTE_FIELD_JOBS', 'MANAGE_TENANTS']);
        break;
      case 'TECHNICIAN':
        setSelectedPermissions(['EXECUTE_FIELD_JOBS']);
        break;
      case 'CUSTOMER':
        setSelectedPermissions(['CREATE_WORK_ORDERS']);
        break;
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleEditPermission = (permId: string) => {
    setEditPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.createUser({
        name,
        email,
        password,
        role,
        customerId: role === 'CUSTOMER' ? customerId : undefined,
        permissions: selectedPermissions.join(','),
      });

      setSuccess(`User '${name}' created successfully with customized tenant permissions!`);
      setModalOpen(false);
      // Reset Form
      setName('');
      setEmail('');
      setPassword('');
      setRole('TECHNICIAN');
      setCustomerId(undefined);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: User) => {
    setEditUser(u);
    const existing = u.permissions ? u.permissions.split(',') : [];
    setEditPermissions(existing);
  };

  const handleSavePermissions = async () => {
    if (!editUser) return;
    setUpdatingPerms(true);
    try {
      await api.updateUserPermissions(editUser.id, editPermissions.join(','));
      setSuccess(`Permissions updated for '${editUser.name}'!`);
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setUpdatingPerms(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    const currentActive = u.active ?? true;
    const nextActive = !currentActive;
    setError('');
    setSuccess('');
    try {
      await api.updateUserStatus(u.id, nextActive);
      setSuccess(`User account '${u.name}' has been ${nextActive ? 'ACTIVATED' : 'DEACTIVATED'}!`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user account status');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesTenant =
      tenantFilter === 'ALL' ||
      (tenantFilter === 'INTERNAL' && !u.customerId) ||
      (u.customerId && u.customerId.toString() === tenantFilter);

    return matchesSearch && matchesRole && matchesTenant;
  });

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'MANAGER':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 bg-purple-500/20 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/40 whitespace-nowrap shrink-0 h-[30px]">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" /> MANAGER
          </span>
        );
      case 'DISPATCHER':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 bg-blue-500/20 text-blue-200 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/40 whitespace-nowrap shrink-0 h-[30px]">
            <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" /> DISPATCHER
          </span>
        );
      case 'TECHNICIAN':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 bg-amber-500/20 text-amber-200 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/40 whitespace-nowrap shrink-0 h-[30px]">
            <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" /> TECHNICIAN
          </span>
        );
      case 'CUSTOMER':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 bg-emerald-500/20 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40 whitespace-nowrap shrink-0 h-[30px]">
            <UserIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> CUSTOMER
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Tenant & User Permission Management"
        subtitle="Manage multi-tenant organizations, user accounts, system roles, and fine-grained permission assignments."
        icon={<Users className="w-7 h-7 text-sky-400" />}
        actions={
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> + Add New User
          </Button>
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

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-[#081324] border border-blue-900/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Tenant Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" />
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="bg-[#081324] border border-blue-900/50 text-white text-xs font-bold py-2 px-3 rounded-xl"
            >
              <option value="ALL">All Tenants</option>
              <option value="INTERNAL">Internal Meridian Ops</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1">
            {['ALL', 'MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  roleFilter === r
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/50'
                    : 'bg-blue-950/40 text-slate-400 hover:text-white border border-blue-900/30'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading user directory & tenant assignments...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-600" />
            <div className="font-semibold text-slate-300">No users match criteria</div>
            <div className="text-xs text-slate-500">Try clearing filters or search keywords.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#08152b] text-xs uppercase font-extrabold text-blue-300 border-b border-blue-900/40">
                <tr>
                  <th className="px-6 py-4 text-center">User & Contact</th>
                  <th className="px-6 py-4 text-center">Tenant Scope</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-center">Account Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/30">
                {filteredUsers.map((u) => {
                  const isActive = u.active ?? true;

                  return (
                    <tr key={u.id} className="hover:bg-blue-950/30 transition-colors">
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30 shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-white flex items-center gap-2">
                              {u.name}
                              {!isActive && (
                                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                                  DEACTIVATED
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start">
                          {u.customerName ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-sky-300 font-bold bg-sky-950/50 px-3 py-1 rounded-xl border border-sky-800/40 whitespace-nowrap shrink-0 h-[30px]">
                              <Building className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{u.customerName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-purple-300 font-bold bg-purple-950/50 px-3 py-1 rounded-xl border border-purple-800/40 whitespace-nowrap shrink-0 h-[30px]">
                              <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>Internal Meridian</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start">{getRoleBadge(u.role)}</div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start">
                          {isActive ? (
                            <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40 whitespace-nowrap shrink-0 h-[30px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-500/40 whitespace-nowrap shrink-0 h-[30px]">
                              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-start gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5"
                          >
                            <Key className="w-3.5 h-3.5 text-sky-400" /> Permissions
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                              isActive
                                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                            }`}
                            title={isActive ? 'Deactivate User Account' : 'Reactivate User Account'}
                          >
                            {isActive ? (
                              <>
                                <UserX className="w-3.5 h-3.5 text-rose-400" /> Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New User Modal with Role & Permission Checkboxes */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create User & Assign Role Permissions">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@meridian.com"
                  className="w-full pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-blue-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">System Role</label>
              <select value={role} onChange={(e) => handleRoleChange(e.target.value)} className="w-full">
                <option value="TECHNICIAN">Field Technician (Mobile App Access)</option>
                <option value="DISPATCHER">Dispatcher (Kanban & Dispatch Access)</option>
                <option value="MANAGER">Manager (Full Executive System Access)</option>
                <option value="CUSTOMER">Customer (Client Self-Service Portal Access)</option>
              </select>
            </div>
          </div>

          {role === 'CUSTOMER' && (
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">
                Assign to Tenant / Customer Organization
              </label>
              <select
                required
                value={customerId || ''}
                onChange={(e) => setCustomerId(Number(e.target.value))}
                className="w-full"
              >
                <option value="">-- Select Customer Tenant Org --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Granular Permission Assignment Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">
              Assign Granular Capabilities & Permissions
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {ALL_PERMISSIONS.map((perm) => {
                const checked = selectedPermissions.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                      checked
                        ? 'bg-blue-950/60 border-blue-500/50 text-white'
                        : 'bg-[#081324] border-blue-900/30 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold">{perm.label}</div>
                      <div className="text-[10px] text-slate-400">{perm.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-blue-900/40">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold"
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Permissions Modal */}
      {editUser && (
        <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit Permissions for '${editUser.name}'`}>
          <div className="space-y-4">
            <div className="text-xs text-slate-300">
              Modify assigned capabilities for <strong className="text-white">{editUser.email}</strong> ({editUser.role}):
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {ALL_PERMISSIONS.map((perm) => {
                const checked = editPermissions.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => toggleEditPermission(perm.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                      checked
                        ? 'bg-blue-950/60 border-blue-500/50 text-white'
                        : 'bg-[#081324] border-blue-900/30 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold">{perm.label}</div>
                      <div className="text-[10px] text-slate-400">{perm.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-blue-900/40">
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSavePermissions}
                loading={updatingPerms}
                className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold"
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
