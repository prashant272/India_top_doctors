"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import useAppointment from "@/app/hooks/useAppointment";
import {
  ArrowLeft, CheckCircle, Stethoscope, Calendar,
  Clock, IndianRupee, CreditCard, Smartphone,
  Building2, Wallet, Loader2, ShieldCheck, AlertCircle,
} from "lucide-react";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Pay via any UPI app" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Building2, desc: "All major banks supported" },
  { id: "wallet", label: "Wallet", icon: Wallet, desc: "Paytm, PhonePe, Amazon Pay" },
];

const PaymentPageFallback = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
      </div>
      <p className="text-sm text-slate-500 font-medium">Loading payment details...</p>
    </div>
  </div>
);

function PaymentPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { UserAuthData: auth } = useContext(AuthContext);
  const { createAppointment, loading: apiLoading } = useAppointment();

  const doctorId = searchParams.get("doctorId") || "";
  const patientId = searchParams.get("patientId") || "";
  const doctorName = searchParams.get("doctorName") || "Doctor";
  const specialization = searchParams.get("specialization") || "";
  const date = searchParams.get("date") || "";
  const timeSlotStart = searchParams.get("timeSlotStart") || "";
  const timeSlotEnd = searchParams.get("timeSlotEnd") || "";
  const timeSlotLabel = searchParams.get("timeSlotLabel") || "";
  const consultationMode = searchParams.get("consultationMode") || "offline";
  // ✅ Fixed: was searchParams.get("type") — param is sent as "consultationType"
  const consultationType = searchParams.get("consultationType") || (consultationMode === "online" ? "video" : "in-person");
  const amount = Number(searchParams.get("amount") || 0);
  const symptoms = searchParams.get("symptoms") || "";
  const notes = searchParams.get("notes") || "";

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [appointmentResult, setAppointmentResult] = useState(null);
  const [error, setError] = useState("");

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    })
    : "";

  const sendAppointmentNotification = (appointmentData) => {
    if (!("Notification" in window)) return;
    const doSend = () => {
      try {
        new Notification(`✅ Appointment Confirmed with ${doctorName}`, {
          body: `${consultationLabel} · ${formattedDate} at ${timeSlotLabel}\nAmount paid: ₹${amount}`,
          icon: "/favicon.ico",
          tag: appointmentData?._id || "appointment",
        });
      } catch (_) { /* silent — some browsers block even with permission */ }
    };
    if (Notification.permission === "granted") {
      doSend();
    } else if (Notification.permission === "default") {
      // Request permission — user can dismiss without error
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") doSend();
        // "denied" or "default" (dismissed) — no action, no error
      }).catch(() => { /* ignore */ });
    }
    // If "denied" — skip silently
  };

  const bookAppointment = async ({ paymentId }) => {
    const payload = {
      patientId: patientId || auth?.userId || auth?._id,
      doctorId,
      appointmentDate: new Date(date).toISOString(),
      timeSlot: { start: timeSlotStart, end: timeSlotEnd },
      status: "pending",
      consultationType,
      meetingLink: "",
      isPaid: true,
      paymentId,
      amount,
      symptoms,
      notes,
    };

    const res = await createAppointment(payload);

    if (res?.status === 201 || res?.status === 200) {
      const appointment = res.data?.appointment || res.data;
      setAppointmentResult(appointment);
      setPaid(true);
      // 🔔 Auto push notification on successful booking
      sendAppointmentNotification(appointment);
    } else {
      setError(
        res?.data?.message ||
        "Payment successful but appointment could not be created. Please contact support."
      );
    }
    setPaying(false);
  };


  const handlePay = async () => {
    setError("");
    if (selectedMethod === "upi" && !upiId.trim()) {
      return setError("Please enter your UPI ID");
    }
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      await bookAppointment({ paymentId: "simulated_" + Date.now() });
    } catch {
      setError("Payment failed. Please try again.");
      setPaying(false);
    }
  };

  const consultationLabel = consultationType === "video" ? "Online / Video" : "In-Person / Clinic";

  if (paid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-1 text-slate-800">Booking Confirmed!</h2>
          <p className="text-slate-500 text-sm mb-6">Payment received and appointment created successfully.</p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm space-y-2 text-left border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor</span>
              <span className="font-medium text-slate-800">{doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-800">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-medium text-slate-800">{timeSlotLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="font-medium text-slate-800">{consultationLabel}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-semibold text-emerald-700">₹{amount}</span>
            </div>
            {appointmentResult?._id && (
              <div className="flex justify-between">
                <span className="text-slate-500">Booking ID</span>
                <span className="font-mono text-xs text-slate-600">
                  {appointmentResult._id.slice(-8).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push("/patient/MyAppointments")}
            className="w-full py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition text-sm font-semibold mb-3"
          >
            View My Appointments
          </button>
          <button
            onClick={() => router.push("/patient/doctors")}
            className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-3 text-sm hover:text-teal-100 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-semibold tracking-tight">Complete Payment</h1>
          <p className="text-sm text-teal-100 mt-1">
            Your appointment will be created after payment is successful.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 flex items-center">
          {[
            { step: 1, label: "Select Slot", done: true, active: false },
            { step: 2, label: "Payment", done: false, active: true },
            { step: 3, label: "Confirmed", done: false, active: false },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.done ? "bg-emerald-500 text-white" :
                  s.active ? "bg-teal-600 text-white" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                  {s.done ? <CheckCircle size={16} /> : s.step}
                </div>
                <p className={`text-xs mt-1 font-medium ${s.active ? "text-teal-700" :
                  s.done ? "text-emerald-600" :
                    "text-slate-400"
                  }`}>
                  {s.label}
                </p>
              </div>
              {i < 2 && (
                <div className={`h-0.5 w-full mx-2 mb-4 ${s.done ? "bg-emerald-300" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-teal-600" /> Choose Payment Method
              </h3>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedMethod(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedMethod === id
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedMethod === id ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${selectedMethod === id ? "text-teal-800" : "text-slate-700"
                        }`}>
                        {label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedMethod === id ? "border-teal-600 bg-teal-600" : "border-slate-300"
                      }`}>
                      {selectedMethod === id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod === "upi" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Enter UPI ID</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <button
                    type="button"
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">e.g. mobilenumber@paytm, name@gpay</p>
              </div>
            )}

            {selectedMethod === "card" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Card Details</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Name on Card</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>
            )}

            {selectedMethod === "netbanking" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Bank</h3>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
                  <option value="">Choose your bank</option>
                  {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Punjab National Bank", "Bank of Baroda"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedMethod === "wallet" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Wallet</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Paytm", "PhonePe", "Amazon Pay", "MobiKwik"].map((w) => (
                    <button
                      key={w}
                      type="button"
                      className="py-3 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-teal-400 hover:text-teal-700 transition"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-teal-100 p-6 sticky top-6">
              <h3 className="text-base font-semibold text-slate-800 mb-5">Order Summary</h3>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="text-teal-600" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{doctorName}</p>
                    <p className="text-xs text-teal-600">{specialization}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{consultationLabel} consultation</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={14} className="text-slate-400 flex-shrink-0" />
                  <span>{timeSlotLabel}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Consultation Fee</span>
                    <span>₹{amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Platform Fee</span>
                    <span className="text-emerald-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-slate-800 pt-2 border-t border-slate-100">
                    <span>Total</span>
                    <span className="text-teal-700">₹{amount}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg flex items-start gap-2 text-xs border border-rose-100">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={paying || apiLoading}
                className="w-full py-3.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition shadow-lg shadow-teal-600/25"
              >
                {paying || apiLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    {paying ? "Processing payment..." : "Creating appointment..."}
                  </>
                ) : (
                  <><IndianRupee size={16} /> Pay ₹{amount}</>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck size={13} className="text-emerald-500" />
                100% Secure · Appointment created after payment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentPageFallback />}>
      <PaymentPageInner />
    </Suspense>
  );
}
