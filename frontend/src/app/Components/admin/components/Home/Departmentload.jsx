"use client"
import { useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";

const barColors = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const SkeletonBar = () => (
  <div className="animate-pulse">
    <div className="flex items-center justify-between mb-1.5">
      <div className="h-3 bg-slate-200 rounded w-24" />
      <div className="h-3 bg-slate-200 rounded w-8" />
    </div>
    <div className="h-2 bg-slate-100 rounded-full" />
  </div>
);

export default function DepartmentLoad() {
  const { dashboardStats, loadingStats, fetchDashboardStats } = useAdminContext();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const departments = dashboardStats?.departmentLoad || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 className="font-semibold text-slate-800 mb-4">Department Load</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonBar key={i} />)
        ) : departments.length === 0 ? (
          <p className="text-slate-400 text-sm col-span-4 text-center py-6">No department data available.</p>
        ) : (
          departments.map((d, i) => {
            const name = d.name || d.department || "Unknown";
            const load = d.load ?? d.occupancyPercent ?? 0;

            return (
              <div key={d._id || name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600 font-medium">{name}</span>
                  <span className="text-sm font-bold text-slate-700">{load}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColors[i % barColors.length]}`}
                    style={{ width: `${Math.min(load, 100)}%`, transition: "width 1s ease" }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}