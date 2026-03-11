"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

function FailureContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const txnid = searchParams.get("txnid");

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-rose-100">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <XCircle className="w-14 h-14 text-rose-500" />
                </div>
                <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">Payment Failed</h2>
                <p className="text-slate-500 text-sm mb-8 font-medium">Something went wrong with your transaction. No money was deducted from your account.</p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-full py-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-600/20 text-sm font-black flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push("/patient/doctors")}
                        className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all text-sm font-black flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Doctors
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FailureContent />
        </Suspense>
    );
}
