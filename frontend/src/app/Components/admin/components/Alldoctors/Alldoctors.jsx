"use client"
import { useEffect, useState } from "react";
import { useAdminContext } from "@/app/context/AdminContext";

const avatarColors = [
  "from-teal-400 to-emerald-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-teal-500",
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-3/4" />
    </div>
  </div>
);

export default function AllDoctors() {
  const { doctors, loadingDoctors, fetchAllDoctors, removeDoctorById } = useAdminContext();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAllDoctors();
  }, [fetchAllDoctors]);

  const filtered = doctors.filter((d) => {
    const name = d.basicInfo?.fullName || d.name || "";
    const spec = d.professionalInfo?.specialization || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      spec.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this doctor?")) return;
    setDeletingId(id);
    try {
      await removeDoctorById(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
            All Doctors
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loadingDoctors ? "Loading..." : `${filtered.length} doctor${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-full sm:w-72 shadow-sm">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialization..."
            className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
          />
        </div>
      </div>

      {loadingDoctors ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm font-medium">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doc, i) => {
            const id = doc._id || doc.id;
            const name = doc.basicInfo?.fullName || doc.name || "Unknown";
            const specialization = doc.professionalInfo?.specialization || "—";
            const qualification = doc.professionalInfo?.qualification || "—";
            const experience = doc.professionalInfo?.experience;
            const fee = doc.professionalInfo?.consultationFee;
            const phone = doc.basicInfo?.phone || "—";
            const email = doc.basicInfo?.email || doc.email || "—";
            const profileImage = doc.basicInfo?.profileImage || doc.profileImage;
            const workingDays = doc.availability?.workingDays?.length || 0;

            return (
              <div key={id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden`}>
                      {profileImage
                        ? <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                        : getInitials(name)
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">{name}</p>
                      <p className="text-xs text-teal-600 font-medium mt-0.5">{specialization}</p>
                      <p className="text-xs text-slate-400">{qualification}</p>
                    </div>
                  </div>
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

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {experience !== undefined && (
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-xs text-slate-400">Experience</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{experience} yrs</p>
                    </div>
                  )}
                  {fee !== undefined && (
                    <div className="bg-teal-50 rounded-xl p-2.5">
                      <p className="text-xs text-teal-500">Consult Fee</p>
                      <p className="text-sm font-semibold text-teal-700 mt-0.5">₹{fee}</p>
                    </div>
                  )}
                  {workingDays > 0 && (
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-xs text-slate-400">Working Days</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{workingDays} days/wk</p>
                    </div>
                  )}
                  {doc.availability?.startTime && (
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-xs text-slate-400">Hours</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{doc.availability.startTime} – {doc.availability.endTime}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1.5">
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}