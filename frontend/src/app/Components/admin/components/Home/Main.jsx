import AppointmentsTable from "./Appointmentstable";
import DepartmentLoad from "./Departmentload";
import StatsGrid from "./StatsGrid";
import TopDoctors from "./Topdoctors";


export default function Main() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Welcome back. Here's what's happening today.</p>
        </div>
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white outline-none cursor-pointer">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1">
          <AppointmentsTable />
      </div>
    </div>
  );
}