"use client";

import { useContext, useState } from "react";
import { NotificationContext } from "@/app/context/NotificationContext";
import {
  Bell, BellOff, CheckCheck, Trash2, Info, CheckCircle,
  XCircle, AlertTriangle, Clock, ChevronLeft, Inbox,
  RefreshCw, AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    dot: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
  },
  error: {
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    dot: "bg-rose-400",
    badge: "bg-rose-100 text-rose-700",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
  },
  info: {
    icon: Info,
    color: "text-sky-500",
    bg: "bg-sky-50",
    border: "border-sky-100",
    dot: "bg-sky-400",
    badge: "bg-sky-100 text-sky-700",
  },
};

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function SkeletonItem() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 animate-pulse">
      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between gap-2">
          <div className="h-3 bg-slate-100 rounded-full w-2/5" />
          <div className="h-3 bg-slate-100 rounded-full w-16" />
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full w-3/4" />
        <div className="h-5 bg-slate-100 rounded-lg w-14" />
      </div>
    </div>
  );
}

function NotificationItem({ notification, onRead }) {
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => !notification.read && onRead(notification.id)}
      className={`relative flex items-start gap-4 px-5 py-4 transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 ${
        !notification.read ? "bg-white cursor-pointer" : "bg-slate-50/40 cursor-default"
      }`}
    >
      {!notification.read && (
        <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      )}

      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
        <Icon className={`w-5 h-5 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${!notification.read ? "font-black text-slate-800" : "font-semibold text-slate-500"}`}>
            {notification.title}
          </p>
          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1 flex-shrink-0 mt-0.5">
            <Clock className="w-3 h-3" />
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notification.message}</p>
        <span className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${cfg.badge}`}>
          {notification.type}
        </span>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAllRead,
    markOneRead,
    clearAll,
    fetchNotifications,
  } = useContext(NotificationContext);
  const [filter, setFilter] = useState("all");

  const filters = ["all", "unread", "success", "error", "info", "warning"];

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const filterCounts = filters.reduce((acc, f) => {
    if (f === "all") acc[f] = notifications.length;
    else if (f === "unread") acc[f] = notifications.filter((n) => !n.read).length;
    else acc[f] = notifications.filter((n) => n.type === f).length;
    return acc;
  }, {});

  return (
    <section className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-5">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 mb-5 transition-colors uppercase tracking-wider"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Notifications</h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {loading ? "Loading..." : unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all duration-200 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all duration-200"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map((f) => {
              const cfg = f !== "all" && f !== "unread" ? TYPE_CONFIG[f] : null;
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-black capitalize transition-all duration-200 border ${
                    isActive
                      ? f === "all" || f === "unread"
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                        : `${cfg.bg} ${cfg.color} ${cfg.border}`
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                  }`}
                >
                  {f === "unread" && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
                  {f}
                  {filterCounts[f] > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${isActive ? "bg-white/20 text-current" : "bg-slate-100 text-slate-500"}`}>
                      {filterCounts[f]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center gap-3 px-5 py-4 mb-4 bg-rose-50 border border-rose-100 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-600 font-semibold flex-1">{error}</p>
            <button
              onClick={fetchNotifications}
              className="text-xs font-black text-rose-500 hover:text-rose-700 uppercase tracking-wide"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {[...Array(5)].map((_, i) => <SkeletonItem key={i} />)}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-5">
              {filter === "unread" ? (
                <BellOff className="w-7 h-7 text-slate-300" />
              ) : (
                <Inbox className="w-7 h-7 text-slate-300" />
              )}
            </div>
            <h3 className="text-base font-black text-slate-700 mb-1">
              {filter === "unread" ? "No unread notifications" : "No notifications"}
            </h3>
            <p className="text-xs text-slate-400 font-medium text-center max-w-[200px]">
              {filter === "all"
                ? "You're all caught up! Nothing here yet."
                : `No ${filter} notifications to show.`}
            </p>
          </div>
        )}

        {/* Notification List */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                {filtered.length} {filtered.length === 1 ? "notification" : "notifications"}
              </p>
              {filter === "all" && unreadCount > 0 && (
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wide">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-50">
              {filtered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markOneRead}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
