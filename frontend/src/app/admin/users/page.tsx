"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import RequireAdmin from "@/components/layout/RequireAdmin";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetAdminUsersQuery,
  useUpdateUserRoleMutation,
  type AdminRole,
} from "@/store/api/adminApi";
import type { InternalUser } from "@/store/api/authApi";
import { ArrowLeft, Shield, Star } from "lucide-react";

function Spinner() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RoleBadge({ role }: { role: AdminRole }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        isAdmin
          ? "bg-[#BF0A30]/10 text-[#BF0A30]"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {isAdmin && <Shield size={10} />}
      {role}
    </span>
  );
}

function AdminUsersContent() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, isError } = useGetAdminUsersQuery();
  const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  }, [users, query]);

  async function handleToggleRole(u: InternalUser) {
    const newRole: AdminRole = u.role === "ADMIN" ? "STANDARD" : "ADMIN";
    const action = newRole === "ADMIN" ? "promover a ADMIN" : "degradar a STANDARD";
    if (!window.confirm(`¿Confirmás ${action} a ${u.username}?`)) return;
    setError(null);
    setPendingId(u.id);
    try {
      await updateRole({ userId: u.id, role: newRole }).unwrap();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err &&
        "data" in err &&
        typeof (err as { data?: { message?: string } }).data?.message ===
          "string"
          ? (err as { data: { message: string } }).data.message
          : "No se pudo actualizar el rol.";
      setError(msg);
    } finally {
      setPendingId(null);
    }
  }

  if (isLoading) return <Spinner />;
  if (isError)
    return (
      <main className="container mx-auto px-4 pb-20">
        <PageHeader title="Gestión de usuarios" />
        <EmptyState message="No se pudieron cargar los usuarios." />
      </main>
    );

  return (
    <main className="container mx-auto px-4 pb-24 max-w-4xl">
      <div className="mt-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={14} />
          Volver al panel
        </Link>
      </div>

      <PageHeader
        title="Gestión de usuarios"
        subtitle="Listado completo de usuarios. Cambiá el rol con un click."
      />

      <div className="mb-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre, username o email..."
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-[#BF0A30]/10 border border-[#BF0A30]/30 text-sm text-[#BF0A30] font-semibold">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState message="No se encontraron usuarios." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1.2fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Usuario</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Reputación</span>
            <span>Acción</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((u) => {
              const isSelf = currentUser?.id === u.id;
              const isPending = pendingId === u.id;
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_auto_auto_auto] gap-2 md:gap-3 px-4 py-3 items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {u.username}
                      {isSelf && (
                        <span className="ml-2 text-[10px] font-semibold text-slate-400 uppercase">
                          (Vos)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {`${u.firstName} ${u.lastName}`.trim() || "—"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-600 break-all">
                    {u.email}
                  </span>
                  <RoleBadge role={u.role} />
                  <div className="flex items-center gap-1">
                    <Star
                      size={12}
                      className="text-yellow-400 fill-yellow-400"
                    />
                    <span className="text-xs font-semibold text-slate-600">
                      {u.reputation}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleRole(u)}
                    disabled={isPending || (isUpdating && pendingId !== u.id) || (isSelf && u.role === "ADMIN")}
                    title={
                      isSelf && u.role === "ADMIN"
                        ? "Un admin no puede degradar su propio rol"
                        : undefined
                    }
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-[#002B5E] text-white hover:bg-[#003a7a] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending
                      ? "..."
                      : u.role === "ADMIN"
                        ? "Hacer Standard"
                        : "Hacer Admin"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAdmin>
      <AdminUsersContent />
    </RequireAdmin>
  );
}
