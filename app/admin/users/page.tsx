"use client";

import { AdminUsersTab } from "@/components/admin/AdminUsersTab";

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage platform users, roles, and permissions
        </p>
      </div>
      <AdminUsersTab />
    </div>
  );
}
