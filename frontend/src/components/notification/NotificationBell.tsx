"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Circle } from "lucide-react";
import { mockNotifications } from "@/data/mock-notifications";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { MockNotification } from "@/data/types";

interface NotificationRowProps {
  notif: MockNotification;
  onMarkRead: (id: string) => void;
  onNavigate: (notif: MockNotification) => void;
}

function NotificationRow({ notif, onMarkRead, onNavigate }: NotificationRowProps) {
  return (
    <div
      onClick={() => notif.link && onNavigate(notif)}
      className={`flex items-start gap-3 p-4 border-b border-slate-50 transition-colors last:border-none ${
        notif.read ? "bg-white" : "bg-blue-50/50"
      } ${notif.link ? "cursor-pointer hover:bg-slate-50" : ""}`}
    >
      <div className="mt-0.5">
        {notif.read ? (
          <Check size={14} className="text-slate-300" />
        ) : (
          <Circle size={10} className="text-blue-500 fill-blue-500 mt-0.5" />
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <p
          className={`text-sm leading-snug ${
            notif.read ? "text-slate-600" : "text-slate-800 font-medium"
          }`}
        >
          {notif.message}
        </p>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          {new Date(notif.createdAt).toLocaleDateString("es-AR")}
        </span>
      </div>
      {!notif.read && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notif.id);
          }}
          className="p-1 hover:bg-white rounded-md transition-all text-slate-400 hover:text-slate-600"
          title="Marcar como leída"
        >
          <Check size={14} />
        </button>
      )}
    </div>
  );
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<MockNotification[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(dropdownRef, close);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNavigate = (notif: MockNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) router.push(notif.link);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-blue-200/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-[#BF0A30] rounded-full ring-2 ring-[#002B5E]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No tenés notificaciones.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <NotificationRow
                    key={notif.id}
                    notif={notif}
                    onMarkRead={markAsRead}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
