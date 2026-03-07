"use client";

import { useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { useAdminContext } from "@/app/context/AdminContext";
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  User, Settings, LogOut, ChevronLeft, ChevronRight,
  Shield, CreditCard, ShieldCheck, BookOpen, UserPlus, Building2,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",        path: "/admin/dashboard"        },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: Stethoscope, label: "Doctors",          path: "/admin/doctors"          },
      { icon: Users,       label: "Patients",         path: "/admin/patients"         },
      { icon: Calendar,    label: "Appointments",     path: "/admin/appointments"     },
      { icon: User,        label: "Admins",           path: "/admin/admins"           },
      { icon: UserPlus,    label: "Register Doctor",  path: "/admin/RegisterDoctor"   },
      { icon: Building2,   label: "Verify Hospitals", path: "/admin/VerifyHospitals"  },
    ],
  },
  {
    label: "Content",
    items: [
      { icon: ShieldCheck, label: "Manage Reviews",   path: "/admin/ManageReviews"    },
      { icon: BookOpen,    label: "Manage Blogs",     path: "/admin/ManageBlog"       },
    ],
  },
  {
    label: "System",
    items: [
      { icon: CreditCard, label: "Plan Management",  path: "/admin/PlanManagement"   },
    ],
  },
];

const TIER_CONFIG = [
  { key: "premiumDoctors",  label: "Premium",  dot: "bg-rose-400",   bg: "bg-rose-500/20",   text: "text-rose-400"   },
  { key: "standardDoctors", label: "Standard", dot: "bg-sky-400",    bg: "bg-sky-500/20",    text: "text-sky-400"    },
  { key: "basicDoctors",    label: "Basic",    dot: "bg-orange-400", bg: "bg-orange-500/20", text: "text-orange-400" },
];

function Avatar({ src, name, initials, size = "md" }) {
  const dims = size === "sm" ? "w-9 h-9 text-xs" : "w-10 h-10 text-sm";
  return src ? (
    <img src={src} alt={name} className={`${dims} rounded-xl object-cover ring-2 ring-slate-700 flex-shrink-0`} />
  ) : (
    <div className={`${dims} rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function NavItem({ icon: Icon, label, path, badge, isOpen, pathname }) {
  const isActive = pathname === path || pathname.startsWith(path + "/");

  return (
    <Link
      href={path}
      title={!isOpen ? label : undefined}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
        isActive
          ? "bg-teal-500/15 text-teal-400 border border-teal-500/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-400 rounded-r-full" />
      )}
      <Icon
        className={`flex-shrink-0 transition-colors ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`}
        style={{ width: 16, height: 16 }}
      />
      {isOpen && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== null && badge !== undefined && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
              isActive ? "bg-teal-500/25 text-teal-300" : "bg-slate-700/80 text-slate-400"
            }`}>
              {badge > 999 ? "999+" : badge}
            </span>
          )}
        </>
      )}
      {!isOpen && badge !== null && badge !== undefined && (
        <span className="absolute right-1.5 top-1.5 w-2 h-2 bg-teal-400 rounded-full" />
      )}
    </Link>
  );
}

function DoctorTierWidget({ stats, total }) {
  if (!total) return null;
  return (
    <div className="mx-1 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Doctor Tiers</p>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-3">
        {TIER_CONFIG.map(({ key, dot, label }) => {
          const val = stats[key] ?? 0;
          return val > 0 ? (
            <div
              key={label}
              className={`${dot} transition-all duration-700`}
              style={{ width: `${(val / total) * 100}%` }}
            />
          ) : null;
        })}
      </div>
      <div className="space-y-1.5">
        {TIER_CONFIG.map(({ key, label, dot, bg, text }) => {
          const val = stats[key] ?? 0;
          return (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${bg} ${text}`}>{val}</span>
                <span className="text-[10px] text-slate-600">{((val / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { UserAuthData, logout } = useContext(AuthContext);
  const { dashboardStats } = useAdminContext();

  const name         = UserAuthData?.name         || "Admin User";
  const email        = UserAuthData?.email        || "admin@medisys.com";
  const profileImage = UserAuthData?.profileImage || "";
  const role         = UserAuthData?.role         || "admin";
  const initials     = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout?.();
    router.push("/login");
  };

  const badgeMap = {
    "/admin/doctors":      dashboardStats?.totalDoctors           ?? null,
    "/admin/patients":     dashboardStats?.totalPatients          ?? null,
    "/admin/appointments": dashboardStats?.totalAppointmentsToday ?? null,
  };

  const totalDoctors = dashboardStats?.totalDoctors || 0;

  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-[72px]"} bg-slate-900 flex flex-col flex-shrink-0 overflow-hidden`}
      style={{ transition: "width 0.25s ease" }}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/60">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30">
          <Stethoscope style={{ width: 18, height: 18 }} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-black tracking-tight leading-tight">INDIA TOP</p>
            <p className="text-teal-400 text-xs font-black tracking-tight leading-tight">DOCTORS</p>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(p => !p)}
          className="w-7 h-7 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-slate-700/60 transition flex-shrink-0"
        >
          {sidebarOpen
            ? <ChevronLeft  style={{ width: 14, height: 14 }} />
            : <ChevronRight style={{ width: 14, height: 14 }} />
          }
        </button>
      </div>

      {sidebarOpen ? (
        <div className="mx-3 my-3 bg-slate-800/60 border border-slate-700/40 rounded-2xl px-3 py-3 flex items-center gap-3">
          <Avatar src={profileImage} name={name} initials={initials} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-bold truncate leading-tight">{name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield style={{ width: 11, height: 11 }} className="text-teal-400 flex-shrink-0" />
              <p className="text-teal-400 text-[11px] font-semibold capitalize">{role}</p>
            </div>
            <p className="text-slate-500 text-[10px] truncate mt-0.5">{email}</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-3 border-b border-slate-700/60">
          <Avatar src={profileImage} name={name} initials={initials} size="sm" />
        </div>
      )}

      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-4 scrollbar-none">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {sidebarOpen && (
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ icon, label, path }) => (
                <NavItem
                  key={path}
                  icon={icon}
                  label={label}
                  path={path}
                  badge={badgeMap[path] ?? null}
                  isOpen={sidebarOpen}
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        ))}

        {sidebarOpen && (
          <DoctorTierWidget stats={dashboardStats ?? {}} total={totalDoctors} />
        )}
      </nav>

      <div className="px-2 py-3 border-t border-slate-700/60">
        <button
          onClick={handleLogout}
          title={!sidebarOpen ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-150 group"
        >
          <LogOut style={{ width: 16, height: 16 }} className="flex-shrink-0 group-hover:text-rose-400 transition-colors" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
