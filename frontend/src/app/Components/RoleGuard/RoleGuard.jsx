"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";

export default function RoleGuard({ allowedRoles, children }) {
  const { UserAuthData, initialStateLoaded } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!initialStateLoaded) return;

    if (!UserAuthData?.token) {
      if (allowedRoles.includes("admin")) {
        router.replace("/admin/auth");
      } else {
        router.replace("/");
      }
      return;
    }

    if (UserAuthData.role === "admin" && !allowedRoles.includes("admin")) {
      router.replace("/admin/auth");
      return;
    }

    if (!allowedRoles.includes(UserAuthData.role)) {
      if (UserAuthData.role === "doctor") router.replace("/doctor/dashboard");
      else if (UserAuthData.role === "patient") router.replace("/patient/dashboard");
      else router.replace("/");
    }
  }, [UserAuthData, initialStateLoaded, allowedRoles, router]);

  const Spinner = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!initialStateLoaded) return <Spinner />;

  if (!UserAuthData?.token) return <Spinner />;

  if (UserAuthData.role === "admin" && !allowedRoles.includes("admin")) return <Spinner />;

  if (!allowedRoles.includes(UserAuthData.role)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Unauthorized
          </h1>
          <p className="text-slate-400 text-sm mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-slate-500 text-xs mb-8">
            This area is restricted to{" "}
            {allowedRoles.map((r, i) => (
              <span key={r}>
                <span className="text-teal-400 font-medium capitalize">{r}</span>
                {i < allowedRoles.length - 1 && (
                  <span className="text-slate-500"> and </span>
                )}
              </span>
            ))}{" "}
            accounts only.
          </p>
          <button
            onClick={() => router.replace("/")}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 mb-3"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Go to Login
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-sm font-medium rounded-xl transition-all duration-200 border border-slate-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
