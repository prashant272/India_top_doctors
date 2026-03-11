"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Clock, User, ArrowRight } from "lucide-react";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const txnid = searchParams.get("txnid");

    useEffect(() => {
        // Optional: Fetch latest appointment status here
    }, [txnid]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-emerald-100">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle className="w-14 h-14 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">Payment Successful!</h2>
                <p className="text-slate-500 text-sm mb-8 font-medium">Your appointment has been confirmed and the doctor has been notified.</p>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-sm space-y-3 text-left border border-slate-100 italic">
                    <p className="text-slate-400 text-center font-bold uppercase tracking-widest text-[10px]">Transaction Details</p>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-slate-500 font-bold uppercase text-[10px]">Booking ID</span>
                        <span className="font-mono text-teal-600 font-black">{txnid?.slice(-8).toUpperCase() || "N/A"}</span>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/patient/MyAppointments")}
                    className="w-full py-4 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 text-sm font-black flex items-center justify-center gap-2 group"
                >
                    Go to My Appointments
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
