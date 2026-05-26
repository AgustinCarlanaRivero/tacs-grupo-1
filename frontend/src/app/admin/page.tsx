"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import RequireAdmin from "@/components/layout/RequireAdmin";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { useGetAdminStatsQuery } from "@/store/api/adminApi";
import {
  Users,
  Shield,
  UserCog,
  Bell,
  BellRing,
  BellOff,
  Star,
  ChevronRight,
} from "lucide-react";

interface StatCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm">
      {icon}
      <span className="text-2xl font-extrabold text-slate-800">{value}</span>
      <span className="text-xs text-slate-500 font-medium text-center">
        {label}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AdminDashboardContent() {
  const { data: stats, isLoading, isError } = useGetAdminStatsQuery();

  if (isLoading) return <Spinner />;
  if (isError || !stats)
    return (
      <main className="container mx-auto px-4 pb-20">
        <PageHeader title="Panel de Administración" />
        <EmptyState message="No se pudieron cargar las estadísticas." />
      </main>
    );

  const typeEntries = Object.entries(stats.notifications.byType).sort(
    (a, b) => b[1] - a[1]
  );
  const maxTypeCount = typeEntries.reduce(
    (max, [, count]) => Math.max(max, count),
    0
  );

  return (
    <main className="container mx-auto px-4 pb-24 max-w-3xl">
      <PageHeader
        title="Panel de Administración"
        subtitle="Estadísticas de uso y actividad de la plataforma."
      />

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Usuarios
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Users size={18} className="text-[#002B5E]" />}
            value={stats.users.total}
            label="Total"
          />
          <StatCard
            icon={<Shield size={18} className="text-[#BF0A30]" />}
            value={stats.users.byRole.admin}
            label="Admins"
          />
          <StatCard
            icon={<UserCog size={18} className="text-slate-500" />}
            value={stats.users.byRole.standard}
            label="Standard"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Notificaciones
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Bell size={18} className="text-[#002B5E]" />}
            value={stats.notifications.total}
            label="Total"
          />
          <StatCard
            icon={<BellRing size={18} className="text-[#BF0A30]" />}
            value={stats.notifications.unread}
            label="No leídas"
          />
          <StatCard
            icon={<BellOff size={18} className="text-slate-400" />}
            value={stats.notifications.read}
            label="Leídas"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Top reputación
          </h3>
        </div>
        {stats.users.topByReputation.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Sin datos.</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
            {stats.users.topByReputation.map((u, idx) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {u.username}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star
                    size={13}
                    className="text-yellow-400 fill-yellow-400"
                  />
                  <span className="text-sm font-semibold text-slate-600">
                    {u.reputation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {typeEntries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Notificaciones por tipo
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
            {typeEntries.map(([type, count]) => {
              const pct = maxTypeCount > 0 ? (count / maxTypeCount) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600">
                      {type}
                    </span>
                    <span className="font-bold text-slate-500">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#002B5E] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Link href="/admin/users">
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-[#002B5E]/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-[#002B5E]" />
            <div>
              <span className="text-sm font-bold text-slate-800">
                Gestión de usuarios
              </span>
              <p className="text-xs text-slate-500">
                Ver y cambiar roles de usuarios
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </Link>
    </main>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminDashboardContent />
    </RequireAdmin>
  );
}
