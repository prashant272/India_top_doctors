"use client";
import { useState, useEffect, useContext } from "react";
import useAppointment from "@/app/hooks/useAppointment";
import { AuthContext } from "@/app/context/AuthContext";
import {
  Users, FlaskConical, IndianRupee, Calendar,
  CheckCircle, Activity, TrendingUp, Clock,
  ArrowUpRight, ArrowDownRight, Stethoscope,
} from "lucide-react";

export function StatsCard({ icon: Icon, label, value, sub, trend, trendUp, accent = "rose" }) {
  const accentMap = {
    rose:   { bg: "bg-rose-50",   icon: "text-rose-500",   ring: "ring-rose-100",  bar: "bg-rose-400"   },
    violet: { bg: "bg-violet-50", icon: "text-violet-500", ring: "ring-violet-100",bar: "bg-violet-400" },
    emerald:{ bg: "bg-emerald-50",icon: "text-emerald-500",ring: "ring-emerald-100",bar: "bg-emerald-400"},
    sky:    { bg: "bg-sky-50",    icon: "text-sky-500",    ring: "ring-sky-100",    bar: "bg-sky-400"    },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-500",  ring: "ring-amber-100",  bar: "bg-amber-400"  },
    slate:  { bg: "bg-slate-50",  icon: "text-slate-500",  ring: "ring-slate-200",  bar: "bg-slate-400"  },
  };
  const a = accentMap[accent] || accentMap.rose;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-300 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${a.bg} ring-4 ${a.ring}`}>
        <Icon className={`w-5 h-5 ${a.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-0.5 truncate">{label}</p>
        <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
        {(sub || trend) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
                {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend}
              </span>
            )}
            {sub && <span className="text-[11px] text-slate-400 font-medium">{sub}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_STYLE = {
  confirmed:  "bg-emerald-50 text-emerald-600 border border-emerald-100",
  pending:    "bg-amber-50 text-amber-600 border border-amber-100",
  completed:  "bg-sky-50 text-sky-600 border border-sky-100",
  cancelled:  "bg-rose-50 text-rose-500 border border-rose-100",
  waiting:    "bg-violet-50 text-violet-600 border border-violet-100",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getPatientName(appt) {
  return (
    appt?.Patient?.basicInfo?.fullName ||
    appt?.patientName ||
    appt?.patient?.name ||
    "Unknown Patient"
  );
}

function getPatientInitial(appt) {
  return getPatientName(appt).charAt(0).toUpperCase();
}

function getApptTime(appt) {
  if (appt?.timeSlot?.label) return appt.timeSlot.label;
  if (appt?.timeSlot?.start) return `${appt.timeSlot.start} – ${appt.timeSlot.end}`;
  if (appt?.time) return appt.time;
  if (appt?.appointmentDate || appt?.date) {
    return new Date(appt.appointmentDate || appt.date).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    });
  }
  return "—";
}

function getApptType(appt) {
  return appt?.consultationType || appt?.type || appt?.appointmentType || "Consultation";
}

function getApptStatus(appt) {
  return (appt?.status || "pending").toLowerCase();
}

export default function DashboardHome() {
  const { fetchAppointments, loading, error } = useAppointment();
  const [appointments, setAppointments] = useState([]);
  const { UserAuthData } = useContext(AuthContext);

  const userId = UserAuthData?.userId;
  const role = UserAuthData?.role;
  const name = UserAuthData?.name;
  const profileImage = UserAuthData?.profileImage;
  const specialization = UserAuthData?.roleData?.specialization;

  useEffect(() => {
    if (!userId || !role) return;
    const load = async () => {
      const res = await fetchAppointments(role, userId);
      if (res?.status === 200) {
        const data = res.data?.data || res.data || [];
        setAppointments(Array.isArray(data) ? data : []);
      }
    };
    load();
  }, [fetchAppointments, userId, role]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.appointmentDate || a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const pendingCount   = appointments.filter((a) => a.status === "pending").length;
  const totalRevenue   = appointments
    .filter((a) => a.isPaid)
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const upcomingAppts = appointments
    .filter((a) => {
      const d = new Date(a.appointmentDate || a.date);
      d.setHours(0, 0, 0, 0);
      return d >= today && (a.status === "confirmed" || a.status === "pending");
    })
    .sort((a, b) => new Date(a.appointmentDate || a.date) - new Date(b.appointmentDate || b.date));

  const nextPatient = upcomingAppts[0] ?? null;

  const weeklyStats = [
    { label: "Appointments", value: completedCount, max: Math.max(completedCount + 20, 50), color: "bg-rose-400" },
    { label: "Confirmed",   value: confirmedCount, max: Math.max(confirmedCount + 15, 40), color: "bg-emerald-400" },
    { label: "Pending",     value: pendingCount,   max: Math.max(pendingCount + 10, 20),   color: "bg-amber-400" },
  ];

  const LoadingSkeleton = ({ className = "h-3" }) => (
    <div className={`${className} bg-slate-100 animate-pulse rounded-xl`} />
  );

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">

      <div className="relative bg-slate-900 rounded-3xl p-6 flex items-center justify-between overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-400 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-400 rounded-full blur-3xl translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mb-1">{getGreeting()}</p>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Dr. {name ?? "Doctor"} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
            {specialization && (
              <span className="text-rose-400 font-bold">{specialization}</span>
            )}
            {specialization && <span className="text-slate-600">•</span>}
            <span>
              {loading ? "Loading..." : (
                <>
                  <span className="text-white font-bold">{todayAppts.length} appointment{todayAppts.length !== 1 ? "s" : ""}</span>
                  {" "}today
                </>
              )}
            </span>
          </p>
        </div>
        <div className="relative z-10 hidden sm:block">
          {profileImage ? (
            <img src={profileImage} alt={name} className="w-16 h-16 rounded-2xl ring-4 ring-white/10 object-cover shadow-xl" />
          ) : (
            <div className="w-16 h-16 rounded-2xl ring-4 ring-white/10 bg-rose-500/20 text-rose-300 text-2xl font-black flex items-center justify-center shadow-xl">
              {name?.charAt(0)?.toUpperCase() ?? "D"}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          icon={Calendar}
          label="Today's Appointments"
          value={loading ? "—" : todayAppts.length}
          sub="Live"
          accent="rose"
        />
        <StatsCard
          icon={CheckCircle}
          label="Confirmed"
          value={loading ? "—" : confirmedCount}
          sub={`of ${appointments.length} total`}
          accent="emerald"
        />
        <StatsCard
          icon={Activity}
          label="Completed"
          value={loading ? "—" : completedCount}
          accent="sky"
        />
        <StatsCard
          icon={IndianRupee}
          label="Revenue Collected"
          value={loading ? "—" : `₹${totalRevenue.toLocaleString("en-IN")}`}
          sub="Paid appointments"
          accent="violet"
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-5 py-3.5 text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-slate-900 rounded-full" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em]">All Appointments</h2>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              {appointments.length} total
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-slate-50">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <LoadingSkeleton className="h-3 w-32" />
                    <LoadingSkeleton className="h-2 w-20" />
                  </div>
                  <LoadingSkeleton className="h-6 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-semibold">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((appt, idx) => {
                const status = getApptStatus(appt);
                return (
                  <div
                    key={appt._id ?? idx}
                    className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-rose-600 font-black text-sm shadow-sm">
                        {getPatientInitial(appt)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{getPatientName(appt)}</p>
                        <p className="text-[11px] text-slate-400 font-medium capitalize">{getApptType(appt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-semibold hidden sm:block">
                        <Clock className="w-3 h-3 inline mr-1 opacity-60" />
                        {getApptTime(appt)}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl capitalize ${STATUS_STYLE[status] ?? "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-5">

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-rose-400 rounded-full" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em]">Next Patient</h2>
            </div>
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <LoadingSkeleton className="h-3 w-28" />
                  <LoadingSkeleton className="h-2 w-20" />
                  <LoadingSkeleton className="h-2 w-24" />
                </div>
              </div>
            ) : nextPatient ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-rose-600 text-2xl font-black shadow-sm">
                    {getPatientInitial(nextPatient)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{getPatientName(nextPatient)}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {nextPatient.Patient?.basicInfo?.age ? `Age ${nextPatient.Patient.basicInfo.age}` : ""}
                      {nextPatient.Patient?.basicInfo?.gender ? ` • ${nextPatient.Patient.basicInfo.gender}` : ""}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-3 h-3 text-rose-400" />
                      <p className="text-[11px] text-rose-500 font-bold">{getApptTime(nextPatient)} — {getApptType(nextPatient)}</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-700 transition-all duration-200 shadow-lg shadow-slate-900/20 uppercase tracking-wider flex items-center justify-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Start Consultation
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm font-semibold">No upcoming patient</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-violet-400 rounded-full" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em]">Overview</h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                [1,2,3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <LoadingSkeleton className="h-2 w-24" />
                      <LoadingSkeleton className="h-2 w-10" />
                    </div>
                    <LoadingSkeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))
              ) : (
                weeklyStats.map(({ label, value, max, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-700">{value}<span className="text-slate-300">/{max}</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${color} h-1.5 rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-2xl p-3 text-center">
                <p className="text-lg font-black text-slate-800">{loading ? "—" : pendingCount}</p>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mt-0.5">Pending</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 text-center">
                <p className="text-lg font-black text-slate-800">{loading ? "—" : confirmedCount}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mt-0.5">Confirmed</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}