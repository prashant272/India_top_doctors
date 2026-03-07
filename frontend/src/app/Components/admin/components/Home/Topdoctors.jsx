"use client";
import { useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { Star, TrendingUp, Award } from "lucide-react";

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-5 py-4 animate-pulse">
    <div className="w-10 h-10 rounded-2xl bg-slate-200 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-200 rounded w-32" />
      <div className="h-2 bg-slate-100 rounded w-20" />
    </div>
    <div className="space-y-2 text-right">
      <div className="h-3 bg-slate-200 rounded w-10" />
      <div className="h-2 bg-slate-100 rounded w-8" />
    </div>
  </div>
);

const avatarColors = [
  "from-teal-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-orange-400 to-amber-500",
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const getRatingColor = (rating) => {
  if (rating >= 4.5) return "text-emerald-500";
  if (rating >= 4.0) return "text-amber-500";
  if (rating >= 3.0) return "text-orange-500";
  return "text-rose-500";
};

export default function TopDoctors() {
  const { dashboardStats, loadingStats, fetchDashboardStats } = useAdminContext();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const doctors = dashboardStats?.topDoctors || [];

  const avgRating = doctors.length
    ? (
        doctors.reduce((acc, d) => acc + (d.averageRating || d.rating || 0), 0) /
        doctors.length
      ).toFixed(1)
    : "—";

  const avgSatisfaction = dashboardStats?.satisfactionRate
    ? `${dashboardStats.satisfactionRate}%`
    : "—";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm">Top Doctors</h2>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
          {doctors.length} listed
        </span>
      </div>

      <div className="divide-y divide-slate-50 flex-1">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No doctors found</p>
            <p className="text-slate-300 text-xs mt-0.5">
              Data will appear here once available
            </p>
          </div>
        ) : (
          doctors.map((doc, i) => {
            const name     = doc.basicInfo?.fullName || doc.fullName || doc.name || "Unknown";
            const dept     = doc.professionalInfo?.specialization || doc.specialization || doc.department || "—";
            const patients = doc.totalPatients ?? doc.patients ?? "—";
            const reviews  = doc.totalReviews  ?? 0;
            const rating   =
              typeof doc.averageRating === "number" ? doc.averageRating :
              typeof doc.rating        === "number" ? doc.rating        : null;
            const image    = doc.basicInfo?.profileImage || doc.profileImage || null;

            return (
              <div
                key={doc._id || doc.id || i}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors duration-150 group"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-black overflow-hidden`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      getInitials(name)
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[9px] font-black text-slate-500 border border-slate-200 shadow-sm">
                    {i + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                    {name}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{dept}</p>
                </div>

                <div className="text-right flex-shrink-0 space-y-0.5">
                  <p className="text-sm font-bold text-slate-700">
                    {typeof patients === "number" ? patients.toLocaleString() : patients}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">pts</span>
                  </p>
                  {rating !== null ? (
                    <p className={`text-xs font-bold flex items-center justify-end gap-0.5 ${getRatingColor(rating)}`}>
                      <Star className="w-3 h-3 fill-current" />
                      {rating.toFixed(1)}
                      <span className="text-[10px] text-slate-300 font-normal ml-0.5">
                        ({reviews})
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-300 font-medium">No rating</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 grid grid-cols-2 gap-3">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
            <p className="text-lg font-black text-teal-600">{avgSatisfaction}</p>
          </div>
          <p className="text-xs text-teal-500 font-medium">Satisfaction</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <p className="text-lg font-black text-amber-600">{avgRating}</p>
          </div>
          <p className="text-xs text-amber-500 font-medium">Avg Rating</p>
        </div>
      </div>
    </div>
  );
}
