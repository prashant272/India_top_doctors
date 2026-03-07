"use client";
import { useState, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { NotificationContext } from "@/app/context/NotificationContext";
import {
  LayoutDashboard, Calendar, Users,
  Pill, BarChart2, MessageSquare, User,
  LogOut, ChevronLeft, ChevronRight, Stethoscope,
  BookOpen, CreditCard, Star,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/doctor/dashboard" },
  { icon: Calendar,        label: "Appointments",  href: "/doctor/Appointments" },
  { icon: Users,           label: "Patients",      href: "/doctor/patients" },
  { icon: Pill,            label: "Prescriptions", href: "/doctor/AddedPrescription" },
  { icon: MessageSquare,   label: "Messages",      href: "/doctor/notifications", showBadge: true },
  { icon: BookOpen,        label: "Blog",          href: "/doctor/blog" },
  { icon: Star,            label: "Reviews",       href: "/doctor/reviews" },
  { icon: User,            label: "Profile",       href: "/doctor/profile" },
  { icon: CreditCard,      label: "Plans",         href: "/doctor/plans" },
  { icon: CreditCard,      label: "Gallery Manager",         href: "/doctor/doctorGalleryManager" },
];

function Avatar({ src, alt, initials, size = "md" }) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    md: "w-10 h-10 rounded-2xl ring-2 ring-slate-100 text-sm",
    sm: "w-9 h-9 rounded-xl ring-2 ring-slate-100 text-xs",
  };

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} object-cover flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600 font-black flex items-center justify-center flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { UserAuthData, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);

  const name           = UserAuthData?.name || UserAuthData?.fullName || "Doctor";
  const email          = UserAuthData?.email || "";
  const profileImage   = UserAuthData?.profileImage || "";
  const specialization = UserAuthData?.roleData?.specialization || UserAuthData?.specialization || "";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    if (logout) logout();
    router.push("/auth");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm flex-shrink-0`}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-900/20">
          <Stethoscope className="text-white" style={{ width: 18, height: 18 }} />
        </div>
        {!collapsed && (
          <span className="text-sm font-black text-slate-800 tracking-tight leading-tight">
            INDIA TOP<br />
            <span className="text-rose-500">DOCTORS</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 border border-slate-100 transition-all duration-200"
        >
          {collapsed
            ? <ChevronRight style={{ width: 14, height: 14 }} />
            : <ChevronLeft style={{ width: 14, height: 14 }} />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 bg-slate-50/60">
          <Avatar src={profileImage} alt={name} initials={initials} size="md" />
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-800 truncate leading-tight">{name}</p>
            {specialization && (
              <p className="text-[11px] text-rose-500 font-bold mt-0.5">{specialization}</p>
            )}
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{email}</p>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center py-4 border-b border-slate-100">
          <Avatar src={profileImage} alt={name} initials={initials} size="sm" />
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href, showBadge }) => {
          const isActive   = pathname === href;
          const badgeCount = showBadge ? unreadCount : 0;
          return (
            <Link
              key={label}
              href={href}
              title={collapsed ? label : undefined}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon
                className={`flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                style={{ width: 16, height: 16 }}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 uppercase tracking-wide">{label}</span>
                  {badgeCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-lg">
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && badgeCount > 0 && (
                <span className="absolute right-1 top-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut style={{ width: 16, height: 16 }} className="flex-shrink-0" />
          {!collapsed && <span className="uppercase tracking-wide">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
