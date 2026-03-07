"use client"
export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 w-64">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
            placeholder="Search patients, doctors..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 hidden md:block">Mon, 23 Feb 2026</span>
      </div>
    </header>
  );
}