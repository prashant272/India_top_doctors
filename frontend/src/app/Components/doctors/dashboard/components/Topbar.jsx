"use client";
import { useContext, useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { NotificationContext } from "@/app/context/NotificationContext";
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Settings,
  Shield,
  Stethoscope,
} from "lucide-react";

export default function TopNav() {
  const { UserAuthData, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const name = UserAuthData?.name || "Doctor";
  const email = UserAuthData?.email || "";
  const profileImage = UserAuthData?.profileImage || "";
  const specialization = UserAuthData?.roleData?.specialization || "";
  const currentPlanName = UserAuthData?.planDetails
?.planName || "Basic Plan";
  const planIsActive = UserAuthData?.isActive || false;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pageTitle = (() => {
    const segments = pathname?.split("/").filter(Boolean);
    const last = segments?.[segments.length - 1] || "dashboard";
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  })();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfile = () => {
    setProfileOpen(false);
    router.push("/doctor/profile");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  const handleNotifications = () => {
    setProfileOpen(false);
    router.push("/doctor/notifications");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shadow-sm z-30 relative">

      <div className="flex flex-col justify-center">
        <h1 className="text-base font-black text-slate-800 leading-tight tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-1.5">

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100">
          <Shield size={12} className="text-violet-500" />
          <span className="text-[11px] font-black text-violet-600">{currentPlanName}</span>
          {planIsActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>

        <button
          onClick={handleNotifications}
          className="relative p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group"
          aria-label="Notifications"
        >
          <Bell size={17} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>


        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border transition-all duration-200 ${
              profileOpen
                ? "bg-slate-50 border-slate-200 shadow-sm"
                : "border-transparent hover:bg-slate-50 hover:border-slate-100"
            }`}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-8 h-8 rounded-lg ring-2 ring-slate-100 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 text-white text-xs font-black flex items-center justify-center shadow-sm shadow-rose-200">
                {initials}
              </div>
            )}

            <div className="hidden md:block text-left">
              <p className="text-xs font-black text-slate-800 leading-tight max-w-[100px] truncate">
                {name}
              </p>
              {specialization ? (
                <p className="text-[10px] text-rose-500 font-semibold leading-tight truncate max-w-[100px]">
                  {specialization}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 leading-tight">{email}</p>
              )}
            </div>

            <ChevronDown
              size={13}
              className={`text-slate-300 transition-transform duration-200 hidden md:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

              <div className="px-4 py-3.5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={name}
                      className="w-10 h-10 rounded-xl ring-2 ring-white shadow object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white text-sm font-black flex items-center justify-center shadow shadow-rose-200">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{email}</p>
                    {specialization && (
                      <div className="flex items-center gap-1 mt-1">
                        <Stethoscope size={9} className="text-rose-400" />
                        <span className="text-[10px] font-bold text-rose-500 truncate">
                          {specialization}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 border border-violet-100 w-fit">
                  <Shield size={10} className="text-violet-500" />
                  <span className="text-[10px] font-black text-violet-600">{currentPlanName}</span>
                  {planIsActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <User size={13} className="text-slate-500" />
                  </div>
                  View Profile
                </button>

                <button
                  onClick={handleNotifications}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center relative">
                      <Bell size={13} className="text-slate-500" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-1 ring-white" />
                      )}
                    </div>
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                    <LogOut size={13} className="text-rose-500" />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
