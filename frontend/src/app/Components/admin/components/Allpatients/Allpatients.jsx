"use client"
import { useEffect, useState } from "react";
import { useAdminContext } from "@/app/context/AdminContext";

const bloodGroupColors = {
  "A+": "bg-red-100 text-red-600",
  "A-": "bg-red-100 text-red-600",
  "B+": "bg-orange-100 text-orange-600",
  "B-": "bg-orange-100 text-orange-600",
  "O+": "bg-blue-100 text-blue-600",
  "O-": "bg-blue-100 text-blue-600",
  "AB+": "bg-violet-100 text-violet-600",
  "AB-": "bg-violet-100 text-violet-600",
};

const avatarColors = [
  "from-pink-400 to-rose-500",
  "from-blue-400 to-indigo-500",
  "from-teal-400 to-emerald-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-teal-500",
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3 bg-slate-100 rounded w-20" />
      </td>
    ))}
  </tr>
);

export default function AllPatients() {
  const { patients, loadingPatients, fetchAllPatients, removePatientById } = useAdminContext();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [view, setView] = useState("table");

  useEffect(() => {
    fetchAllPatients();
  }, [fetchAllPatients]);

  const filtered = patients.filter((p) => {
    const name = p.basicInfo?.fullName || p.name || "";
    const phone = p.basicInfo?.phone || p.phone || "";
    const email = p.basicInfo?.email || p.email || "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || phone.includes(q) || email.toLowerCase().includes(q);
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this patient?")) return;
    setDeletingId(id);
    try {
      await removePatientById(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
            All Patients
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loadingPatients ? "Loading..." : `${filtered.length} patient${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-full sm:w-64 shadow-sm">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
            />
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView("table")}
              className={`p-2 rounded-lg transition ${view === "table" ? "bg-white shadow text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18" />
              </svg>
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition ${view === "grid" ? "bg-white shadow text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs text-slate-400 font-medium px-5 py-3">Patient</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 hidden md:table-cell">Gender</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 hidden md:table-cell">Age</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Phone</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 hidden lg:table-cell">Email</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 hidden lg:table-cell">Blood Group</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-left text-xs text-slate-400 font-medium px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingPatients ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14 text-slate-400 text-sm">No patients found.</td>
                  </tr>
                ) : (
                  filtered.map((pat, i) => {
                    const id = pat._id || pat.id;
                    const name = pat.basicInfo?.fullName || pat.name || "Unknown";
                    const phone = pat.basicInfo?.phone || pat.phone || "—";
                    const email = pat.basicInfo?.email || pat.email || "—";
                    const gender = pat.basicInfo?.gender || pat.gender || "—";
                    const age = pat.basicInfo?.age;
                    const bloodGroup = pat.basicInfo?.bloodGroup || pat.bloodGroup;
                    const profileImage = pat.basicInfo?.profileImage || pat.profileImage;
                    const joined = formatDate(pat.createdAt);

                    return (
                      <tr key={id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden`}>
                              {profileImage ? <img src={profileImage} alt={name} className="w-full h-full object-cover" /> : getInitials(name)}
                            </div>
                            <span className="font-medium text-slate-700 whitespace-nowrap">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{gender}</td>
                        <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{age !== undefined && age >= 0 ? age : "—"}</td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{phone}</td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{email}</td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          {bloodGroup ? (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${bloodGroupColors[bloodGroup] || "bg-slate-100 text-slate-500"}`}>
                              {bloodGroup}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs hidden lg:table-cell whitespace-nowrap">{joined}</td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={deletingId === id}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loadingPatients ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-28" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : filtered.map((pat, i) => {
            const id = pat._id || pat.id;
            const name = pat.basicInfo?.fullName || pat.name || "Unknown";
            const phone = pat.basicInfo?.phone || pat.phone || "—";
            const email = pat.basicInfo?.email || pat.email || "—";
            const gender = pat.basicInfo?.gender || pat.gender || "—";
            const age = pat.basicInfo?.age;
            const bloodGroup = pat.basicInfo?.bloodGroup || pat.bloodGroup;
            const profileImage = pat.basicInfo?.profileImage || pat.profileImage;
            const joined = formatDate(pat.createdAt);

            return (
              <div key={id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0`}>
                      {profileImage ? <img src={profileImage} alt={name} className="w-full h-full object-cover" /> : getInitials(name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{name}</p>
                      <p className="text-xs text-slate-400">{gender}{age !== undefined && age >= 0 ? `, ${age} yrs` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bloodGroup && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bloodGroupColors[bloodGroup] || "bg-slate-100 text-slate-500"}`}>
                        {bloodGroup}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(id)}
                      disabled={deletingId === id}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate">{phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Joined {joined}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}