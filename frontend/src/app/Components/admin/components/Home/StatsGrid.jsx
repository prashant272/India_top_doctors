"use client";
import { useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";

const statConfig = [
  {
    key: "totalDoctors",
    label: "Total Doctors",
    changeKey: "newDoctorsThisMonth",
    changeSuffix: "this month",
    positive: true,
    bg: "bg-teal-50",
    text: "text-teal-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
      </svg>
    ),
  },
  {
    key: "totalPatients",
    label: "Total Patients",
    changeKey: "newPatientsThisWeek",
    changeSuffix: "this week",
    positive: true,
    bg: "bg-blue-50",
    text: "text-blue-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    key: "totalAppointmentsToday",
    label: "Appointments Today",
    changeKey: "pendingAppointments",
    changeSuffix: "pending",
    positive: null,
    bg: "bg-violet-50",
    text: "text-violet-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    key: "monthlyRevenue",
    label: "Revenue (Month)",
    changeKey: "revenueGrowth",
    changeSuffix: "vs last month",
    positive: "auto",
    prefix: "₹",
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    changeKey: "totalPaidAppointments",
    changeSuffix: "paid appointments",
    positive: true,
    prefix: "₹",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    key: "premiumDoctors",
    label: "Premium Doctors",
    changeKey: "premiumDoctorsThisMonth",
    changeSuffix: "joined this month",
    positive: true,
    bg: "bg-rose-50",
    text: "text-rose-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    key: "standardDoctors",
    label: "Standard Doctors",
    changeKey: "totalDoctors",
    changeSuffix: "total doctors",
    positive: null,
    bg: "bg-sky-50",
    text: "text-sky-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "basicDoctors",
    label: "Basic Doctors",
    changeKey: "totalDoctors",
    changeSuffix: "total doctors",
    positive: null,
    bg: "bg-orange-50",
    text: "text-orange-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-slate-200 mb-3" />
    <div className="h-7 w-20 bg-slate-200 rounded mb-2" />
    <div className="h-3 w-28 bg-slate-100 rounded mb-2" />
    <div className="h-3 w-20 bg-slate-100 rounded" />
  </div>
);

function resolveChangeColor(positive, rawChange) {
  if (positive === "auto") {
    if (rawChange === undefined || rawChange === null) return "text-slate-400";
    const numericVal = parseFloat(String(rawChange));
    if (isNaN(numericVal)) return "text-slate-400";
    if (numericVal > 0) return "text-emerald-500";
    if (numericVal < 0) return "text-red-500";
    return "text-slate-400";
  }
  if (positive === true) return "text-emerald-500";
  if (positive === false) return "text-red-500";
  return "text-slate-400";
}

function resolveChangePrefix(positive, rawChange) {
  if (positive === "auto") {
    if (rawChange === undefined || rawChange === null) return "";
    const numericVal = parseFloat(String(rawChange));
    if (isNaN(numericVal)) return "";
    if (numericVal > 0) return "↑ ";
    if (numericVal < 0) return "↓ ";
    return "";
  }
  if (positive === true) return "↑ ";
  if (positive === false) return "↓ ";
  return "";
}

const tierBadgeConfig = {
  premiumDoctors:  { label: "Premium",  bg: "bg-rose-100",   text: "text-rose-600"  },
  standardDoctors: { label: "Standard", bg: "bg-sky-100",    text: "text-sky-600"   },
  basicDoctors:    { label: "Basic",    bg: "bg-orange-100", text: "text-orange-500" },
};

export default function StatsGrid() {
  const { dashboardStats, loadingStats, fetchDashboardStats } = useAdminContext();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loadingStats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const total = dashboardStats?.totalDoctors || 0;
  const premium = dashboardStats?.premiumDoctors || 0;
  const standard = dashboardStats?.standardDoctors || 0;
  const basic = dashboardStats?.basicDoctors || 0;

  return (
    <div className="flex flex-col gap-6">

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statConfig.slice(0, 6).map((s) => {
          const rawValue = dashboardStats?.[s.key];
          const rawChange = dashboardStats?.[s.changeKey];

          const displayValue =
            rawValue !== undefined && rawValue !== null
              ? `${s.prefix ?? ""}${Number(rawValue).toLocaleString()}${s.suffix ?? ""}`
              : "—";

          const displayChange =
            rawChange !== undefined && rawChange !== null
              ? `${rawChange}${s.changeSuffix ? " " + s.changeSuffix : ""}`
              : "—";

          const changeColor = resolveChangeColor(s.positive, rawChange);
          const changePrefix = resolveChangePrefix(s.positive, rawChange);

          return (
            <div
              key={s.key}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm cursor-default"
              style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.text} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                {displayValue}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight">{s.label}</p>
              <p className={`text-xs mt-2 font-medium ${changeColor}`}>
                {displayChange !== "—" ? `${changePrefix}${displayChange}` : "—"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'Syne', sans-serif" }}>
              Doctor Tier Breakdown
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{total} total doctors across all plans</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: "Premium",  color: "bg-rose-400"   },
              { label: "Standard", color: "bg-sky-400"    },
              { label: "Basic",    color: "bg-orange-400" },
            ].map((t) => (
              <span key={t.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${t.color}`} />
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-5">
          {total > 0 && (
            <>
              {premium > 0 && (
                <div
                  className="bg-rose-400 rounded-l-full transition-all duration-700"
                  style={{ width: `${(premium / total) * 100}%` }}
                />
              )}
              {standard > 0 && (
                <div
                  className="bg-sky-400 transition-all duration-700"
                  style={{ width: `${(standard / total) * 100}%` }}
                />
              )}
              {basic > 0 && (
                <div
                  className="bg-orange-400 rounded-r-full transition-all duration-700"
                  style={{ width: `${(basic / total) * 100}%` }}
                />
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {statConfig.slice(6).map((s) => {
            const rawValue = dashboardStats?.[s.key];
            const badge = tierBadgeConfig[s.key];

            const displayValue =
              rawValue !== undefined && rawValue !== null
                ? Number(rawValue).toLocaleString()
                : "—";

            const pct =
              total > 0 && rawValue !== undefined && rawValue !== null
                ? ((rawValue / total) * 100).toFixed(1)
                : null;

            return (
              <div
                key={s.key}
                className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 cursor-default"
                style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.text} flex items-center justify-center`}>
                    {s.icon}
                  </div>
                  {badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {displayValue}
                </p>
                <p className="text-xs text-slate-400 leading-tight">{s.label}</p>
                {pct !== null && (
                  <p className="text-xs font-medium text-slate-500">
                    {pct}% of total doctors
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
