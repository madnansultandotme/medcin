'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, RefreshCw, Mail, Calendar } from 'lucide-react';

interface User {
  id: string;
  authUid: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'ADMIN' | 'CENTER' | 'PATIENT';
  createdAt: string;
  updatedAt: string;
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', name: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create admin');
      }

      setSuccess('Admin user created successfully!');
      setNewAdmin({ email: '', name: '', phone: '', password: '' });
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const otherUsers = users.filter(u => u.role !== 'ADMIN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl backdrop-blur-xl bg-white/80 border border-white/70 p-6 md:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[var(--mist)]">
          <div>
            <h3 className="font-bold text-xl sm:text-2xl text-[var(--ink)]">
              Admin Users Management
            </h3>
            <p className="text-sm text-[var(--muted)] font-mono-ledger mt-0.5">
              Manage administrator accounts and platform access
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--clay)] hover:bg-[var(--sage)] text-white rounded-xl font-semibold transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Admin</span>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Admin Users */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-lg text-[var(--ink)] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--clay)]" />
              Administrator Accounts ({adminUsers.length})
            </h4>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-3 py-1.5 border border-[var(--mist)] rounded-lg text-sm hover:bg-[var(--paper)] transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--clay)] mx-auto mb-4"></div>
              <p className="text-[var(--muted)] text-sm">Loading users...</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--mist)] border border-[var(--mist)] rounded-2xl overflow-hidden bg-white/40">
              {adminUsers.map((user) => (
                <div key={user.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--paper)]/50 transition">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[var(--clay)]/10 text-[var(--clay)] border border-[var(--clay)]/20 flex items-center justify-center font-bold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-base text-[var(--ink)]">{user.name}</div>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <Mail className="w-3.5 h-3.5" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono-ledger text-[var(--muted)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {user.phone && <div>Phone: {user.phone}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge-ledger badge-confirmed rounded-full text-xs px-3 py-1 font-semibold">
                      ADMIN
                    </span>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {adminUsers.length === 0 && (
                <div className="p-12 text-center text-[var(--muted)] text-sm">
                  No admin users found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other Users (for reference) */}
        <div className="space-y-4 pt-6 border-t border-[var(--mist)]">
          <h4 className="font-bold text-lg text-[var(--ink)]">
            All Users ({otherUsers.length} centers/patients)
          </h4>
          <div className="bg-[var(--paper)] p-4 rounded-xl border border-[var(--mist)]">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[var(--ink)]">
                  {users.filter(u => u.role === 'CENTER').length}
                </div>
                <div className="text-sm text-[var(--muted)]">Centers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--ink)]">
                  {users.filter(u => u.role === 'PATIENT').length}
                </div>
                <div className="text-sm text-[var(--muted)]">Patients</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--clay)]">
                  {users.length}
                </div>
                <div className="text-sm text-[var(--muted)]">Total Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#102A43] rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-[var(--ink)] dark:text-[#EAF5FF]">
              Add New Admin User
            </h3>
            <p className="text-sm text-[var(--muted)] dark:text-[#A1B8CB] mb-6">
              Create a new admin user with email and password authentication.
            </p>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--ink)] dark:text-[#EAF5FF]">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--mist)] dark:border-[#244766] rounded-lg bg-white dark:bg-[#081B2D] text-[var(--ink)] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[var(--clay)] transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--ink)] dark:text-[#EAF5FF]">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--mist)] dark:border-[#244766] rounded-lg bg-white dark:bg-[#081B2D] text-[var(--ink)] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[var(--clay)] transition"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--ink)] dark:text-[#EAF5FF]">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--mist)] dark:border-[#244766] rounded-lg bg-white dark:bg-[#081B2D] text-[var(--ink)] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[var(--clay)] transition"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--ink)] dark:text-[#EAF5FF]">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--mist)] dark:border-[#244766] rounded-lg bg-white dark:bg-[#081B2D] text-[var(--ink)] dark:text-[#EAF5FF] focus:ring-2 focus:ring-[var(--clay)] transition"
                  placeholder="Minimum 8 characters"
                />
                <p className="mt-1 text-xs text-[var(--muted)] dark:text-[#A1B8CB]">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewAdmin({ email: '', name: '', phone: '', password: '' });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-[var(--mist)] dark:border-[#244766] rounded-lg font-semibold hover:bg-[var(--paper)] dark:hover:bg-[#244766] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[var(--clay)] hover:bg-[var(--sage)] text-white rounded-lg font-semibold transition shadow-sm"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
