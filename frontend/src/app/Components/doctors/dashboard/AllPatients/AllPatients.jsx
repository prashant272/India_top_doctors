"use client";

import { useContext, useEffect, useState } from "react";
import { useDoctors } from "@/app/hooks/useDoctors";
import { Users, Phone, User, Calendar, Search, RefreshCw } from "lucide-react";
import { AuthContext } from "@/app/context/AuthContext";

export default function AllPatients({ }) {
  const { getAllpatientofDoctor, loading, error } = useDoctors();
  const [patients, setPatients] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const {UserAuthData} = useContext(AuthContext)
  const doctorId = UserAuthData.userId

  const fetchPatients = async () => {
    const result = await getAllpatientofDoctor(doctorId);
    if (result?.status === 200 && result.data?.success) {
      setPatients(result.data.patients);
      setCount(result.data.count);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [doctorId]);

  const filtered = patients.filter(
    (p) =>
      p.basicInfo.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.basicInfo.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">All Patients</h1>
        </div>
        <p className="text-gray-500 ml-14 text-sm">
          View all patients linked to your appointments
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold text-gray-800">{count}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Male Patients</p>
            <p className="text-2xl font-bold text-gray-800">
              {patients.filter((p) => p.basicInfo.gender === "Male").length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-pink-50 rounded-lg">
            <User className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Female Patients</p>
            <p className="text-2xl font-bold text-gray-800">
              {patients.filter((p) => p.basicInfo.gender === "Female").length}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchPatients}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((patient, index) => (
            <div
              key={patient._id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all"
            >
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-700 font-bold text-base">
                    {patient.basicInfo.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-gray-800 font-semibold text-base truncate">
                      {patient.basicInfo.fullName}
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>{patient.basicInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>{patient.basicInfo.gender}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-green-400" />
                      <span>
                        Age:{" "}
                        {patient.basicInfo.age < 0
                          ? "N/A"
                          : patient.basicInfo.age}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gender Badge */}
                <span
                  className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full ${
                    patient.basicInfo.gender === "Male"
                      ? "bg-blue-50 text-blue-600"
                      : patient.basicInfo.gender === "Female"
                      ? "bg-pink-50 text-pink-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {patient.basicInfo.gender}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg mb-1">
            No patients found
          </h3>
          <p className="text-gray-400 text-sm">
            {search
              ? "Try adjusting your search query"
              : "No patients are linked to your appointments yet"}
          </p>
        </div>
      )}

    </div>
  );
}
