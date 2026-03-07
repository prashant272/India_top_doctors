"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { useDoctors } from "@/app/hooks/useDoctors";
import {
  Crown, CheckCircle, Loader2, AlertCircle, Sparkles,
  BookOpen, TrendingUp, Star, BarChart2, ArrowLeft,
} from "lucide-react";

const FEATURES = [
  { icon: BookOpen,   text: "Unlimited blog publishing" },
  { icon: TrendingUp, text: "Priority listing in search" },
  { icon: Star,       text: "Featured doctor badge" },
  { icon: BarChart2,  text: "Advanced analytics" },
];

export default function PremiumPage() {
  const router = useRouter();
  const { UserAuthData, Userdispatch } = useContext(AuthContext);
  const { updateDoctorProfile, loading } = useDoctors();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (!UserAuthData?.userId) {
      setError("Session expired. Please log in again.");
      return;
    }
    setError("");
    try {
      await updateDoctorProfile(UserAuthData.userId, { isPremium: true });
      Userdispatch({ type: "SET_PREMIUM" });
      setSuccess(true);
      setTimeout(() => router.push("/doctor/blog"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Upgrade failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You're Premium!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Your account has been upgraded successfully.
          </p>
          <p className="text-xs text-gray-400">Taking you to your blog page...</p>
          <div className="mt-4 flex justify-center">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center">

        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Crown className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upgrade to Premium</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Access blog publishing, advanced visibility, featured profile and more.
        </p>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Premium Plan</h2>
            <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Most Popular
            </span>
          </div>
          <p className="text-4xl font-extrabold mb-5">
            ₹999 <span className="text-lg font-medium text-blue-200">/ month</span>
          </p>
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {UserAuthData?.isPremium ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 px-4 py-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              You already have an active Premium plan
            </div>
            <button
              onClick={() => router.push("/doctor/blog")}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Go to My Blogs
            </button>
          </div>
        ) : (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            {loading ? "Upgrading..." : "Upgrade Now"}
          </button>
        )}

        <button
          onClick={() => router.push("/doctor/dashboard")}
          className="mt-4 flex items-center justify-center gap-1.5 w-full text-gray-400 hover:text-gray-600 text-sm transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
