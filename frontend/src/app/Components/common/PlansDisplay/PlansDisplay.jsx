"use client";
import { useContext, useEffect, useState } from "react";
import { usePlans } from "@/app/hooks/useplans";
import { AuthContext } from "@/app/context/AuthContext";

const FEATURES = [
  { key: "blogAccess", label: "Blog Access", icon: "✍️" },
  { key: "verifiedBadge", label: "Verified Badge", icon: "✅" },
  { key: "onlineBooking", label: "Online Booking", icon: "📅" },
  { key: "onlineConsultation", label: "Online Consultation", icon: "💬" },
];

const CYCLES = [
  { key: "monthly", label: "Monthly", suffix: "mo" },
  { key: "halfYearly", label: "6 Months", suffix: "6mo" },
  { key: "yearly", label: "Yearly", suffix: "yr" },
];

export default function PlansDisplay() {
  const { handleGetPlans, handlePurchasePlan, loading, purchaseLoading } = usePlans();
  const { UserAuthData, Userdispatch } = useContext(AuthContext);
  const doctorId = UserAuthData.userId;

  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const activePlanId = UserAuthData?.currentPlan?._id;
  const planIsActive = UserAuthData?.isActive;
  const planExpiry   = UserAuthData?.planExpiryDate;
  const planStart    = UserAuthData?.planStartDate;

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res = await handleGetPlans();
      setPlans((res?.data || []).filter((p) => p.isActive));
    } catch {}
  };

  const getPrice = (plan) => {
    if (billingCycle === "monthly")    return plan.price?.monthly;
    if (billingCycle === "halfYearly") return plan.price?.halfYearly;
    if (billingCycle === "yearly")     return plan.price?.yearly;
  };

  const getSavings = (plan) => {
    const monthly = plan.price?.monthly;
    if (!monthly) return null;
    if (billingCycle === "halfYearly") {
      const saved = monthly * 6 - (plan.price?.halfYearly || 0);
      return saved > 0 ? saved : null;
    }
    if (billingCycle === "yearly") {
      const saved = monthly * 12 - (plan.price?.yearly || 0);
      return saved > 0 ? saved : null;
    }
    return null;
  };

  const getFeeBreakdown = (plan, amount = 100) => {
    const percentage = plan.platformFee?.percentage || 0;
    const maxFee = plan.platformFee?.maxFeePerTransaction || null;
    let fee = (percentage / 100) * amount;
    if (maxFee !== null) fee = Math.min(fee, maxFee);
    return {
      fee: parseFloat(fee.toFixed(2)),
      earning: parseFloat((amount - fee).toFixed(2)),
      percentage,
    };
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !doctorId) return;
    setErrorMsg("");
    try {
      const res = await handlePurchasePlan(doctorId, selectedPlan._id, billingCycle);
      const plan = res?.plan;
      Userdispatch({
        type: "SET_PREMIUM",
        payload: {
          currentPlan: { _id: plan?.planId, name: plan?.planName },
          planDetails: {
            isActive: plan?.isActive, billingCycle: plan?.billingCycle,
            planStartDate: plan?.planStartDate, planExpiryDate: plan?.planExpiryDate,
            features: plan?.features,
          },
          isActive: plan?.isActive,
          planStartDate: plan?.planStartDate,
          planExpiryDate: plan?.planExpiryDate,
          features: plan?.features || {},
        },
      });
      setPurchaseResult(plan);
      setSelectedPlan(null);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Purchase failed. Please try again.");
    }
  };

  const isCurrentPlan = (plan) => activePlanId === plan._id && planIsActive;
  const isPopular      = (index) => index === Math.floor(plans.length / 2);

  const gridClass =
    plans.length === 1 ? "grid-cols-1 max-w-sm mx-auto" :
    plans.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" :
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .plans-root * { box-sizing: border-box; }
        .plans-root {
          font-family: 'Sora', sans-serif;
          min-height: 100vh;
          background: #0a0f1e;
          padding: 80px 20px;
          position: relative;
          overflow: hidden;
        }
        .plans-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 20% 10%, rgba(99,102,241,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(16,185,129,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(15,23,42,0.8) 0%, transparent 100%);
          pointer-events: none; z-index: 0;
        }
        .plans-content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc; font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 5px 14px; border-radius: 100px; margin-bottom: 20px;
        }
        .badge::before { content: '◆'; font-size: 8px; }
        .heading {
          font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: #f1f5f9;
          line-height: 1.15; margin-bottom: 14px; letter-spacing: -0.03em;
        }
        .heading span { background: linear-gradient(135deg, #818cf8, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subheading { color: #64748b; font-size: 15px; font-weight: 400; max-width: 420px; margin: 0 auto; line-height: 1.7; }
        .current-plan-banner {
          max-width: 560px; margin: 0 auto 32px;
          padding: 16px 22px; border-radius: 16px;
          background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.25);
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .cp-left { display: flex; flex-direction: column; gap: 2px; }
        .cp-label { font-size: 11px; color: #6366f1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
        .cp-name  { font-size: 16px; color: #e2e8f0; font-weight: 700; }
        .cp-meta  { display: flex; gap: 14px; margin-top: 4px; }
        .cp-meta-item { font-size: 11px; color: #475569; display: flex; align-items: center; gap: 4px; }
        .cp-meta-item span { color: #94a3b8; font-weight: 500; }
        .cp-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .cp-active-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; font-size: 11px; font-weight: 700;
          padding: 4px 12px; border-radius: 100px; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
        }
        .cp-active-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; }
        .cp-expiry-badge { font-size: 11px; color: #64748b; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 3px 10px; border-radius: 100px; }
        .cycle-switcher {
          display: inline-flex; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 5px; gap: 4px;
        }
        .cycle-btn {
          padding: 9px 22px; border-radius: 10px; border: none;
          font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; background: transparent;
          color: #64748b; position: relative;
        }
        .cycle-btn.active { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; box-shadow: 0 4px 15px rgba(99,102,241,0.4); }
        .cycle-btn:not(.active):hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
        .save-pill { position: absolute; top: -8px; right: -8px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 100px; }
        .plan-card {
          border-radius: 20px; display: flex; flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative; overflow: hidden;
        }
        .plan-card:hover { transform: translateY(-4px); }
        .plan-card.default { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .plan-card.default:hover { border-color: rgba(99,102,241,0.3); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .plan-card.popular {
          background: linear-gradient(160deg, #312e81 0%, #1e1b4b 100%);
          border: 1px solid rgba(129,140,248,0.4);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.2), 0 30px 80px rgba(99,102,241,0.25);
          transform: scale(1.03);
        }
        .plan-card.popular:hover { transform: scale(1.03) translateY(-4px); }
        .plan-card.current-active {
          border-color: rgba(16,185,129,0.5) !important;
          box-shadow: 0 0 0 1px rgba(16,185,129,0.2), 0 20px 60px rgba(16,185,129,0.15) !important;
        }
        .popular-badge {
          position: absolute; top: 0; left: 0; right: 0;
          background: linear-gradient(90deg, #f59e0b, #f97316);
          color: #fff; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-align: center; padding: 6px; text-transform: uppercase;
        }
        .active-plan-ribbon {
          position: absolute; top: 0; left: 0; right: 0;
          background: linear-gradient(90deg, #10b981, #059669);
          color: #fff; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-align: center; padding: 6px; text-transform: uppercase;
        }
        .card-header { padding: 28px 28px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .card-header.has-badge { padding-top: 40px; }
        .plan-name { font-size: 18px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px; }
        .savings-pill {
          display: inline-block; background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3); color: #34d399;
          font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px; margin-bottom: 14px;
        }
        .price-row { display: flex; align-items: flex-end; gap: 4px; margin-top: 10px; }
        .price-amount { font-size: 42px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.04em; line-height: 1; font-family: 'JetBrains Mono', monospace; }
        .price-free { color: #818cf8; }
        .price-suffix { font-size: 13px; color: #475569; margin-bottom: 4px; font-weight: 400; }
        .price-note { margin-top: 6px; font-size: 12px; color: #475569; }
        .platform-fee-strip {
          margin: 14px 0 0; padding: 8px 12px;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.18);
          border-radius: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .pf-label { font-size: 11px; color: #d97706; display: flex; align-items: center; gap: 5px; }
        .pf-value { font-size: 12px; font-weight: 700; color: #fbbf24; font-family: 'JetBrains Mono', monospace; }
        .pf-earning { font-size: 11px; color: #6ee7b7; }
        .card-body { padding: 22px 28px 26px; flex: 1; display: flex; flex-direction: column; }

        /* Feature list redesigned */
        .feature-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
        }
        .feature-section-label.included { color: #6366f1; }
        .feature-section-label.excluded { color: #334155; margin-top: 14px; }
        .feature-section-label::after {
          content: ''; flex: 1; height: 1px;
        }
        .feature-section-label.included::after { background: rgba(99,102,241,0.2); }
        .feature-section-label.excluded::after { background: rgba(255,255,255,0.04); }
        .feature-list { list-style: none; padding: 0; margin: 0 0 24px; }
        .feature-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 450; padding: 6px 0;
        }
        .feature-item.enabled { color: #cbd5e1; }
        .feature-item.disabled { color: #334155; }
        .feature-icon {
          width: 22px; height: 22px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; flex-shrink: 0; font-weight: 700;
        }
        .feature-icon.check { background: rgba(99,102,241,0.18); color: #818cf8; }
        .feature-icon.cross { background: rgba(51,65,85,0.25); color: #334155; }
        .feature-icon.boost { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .feature-label-disabled { text-decoration: line-through; opacity: 0.45; }

        .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 4px 0 14px; }

        .cta-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none;
          font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em;
        }
        .cta-btn.default-btn { background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); color: #818cf8; }
        .cta-btn.default-btn:hover { background: rgba(99,102,241,0.22); border-color: rgba(99,102,241,0.5); color: #a5b4fc; }
        .cta-btn.popular-btn { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; box-shadow: 0 8px 25px rgba(99,102,241,0.4); }
        .cta-btn.popular-btn:hover { box-shadow: 0 12px 35px rgba(99,102,241,0.55); filter: brightness(1.05); }
        .cta-btn.active-btn { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #34d399; cursor: default; }
        .alert { max-width: 500px; margin: 0 auto 28px; padding: 12px 18px; border-radius: 12px; font-size: 13px; text-align: center; font-weight: 500; }
        .alert.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171; }
        .footer-note { text-align: center; color: #334155; font-size: 12px; margin-top: 48px; display: flex; align-items: center; justify-content: center; gap: 16px; }
        .footer-note span::before { content: '·'; margin-right: 16px; }
        .footer-note span:first-child::before { content: ''; margin: 0; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 20px; animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal {
          background: #0f172a; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; width: 100%; max-width: 440px; padding: 32px; animation: slideUp 0.2s ease;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .modal-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .modal-sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }
        .modal-details { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; margin-bottom: 16px; }
        .modal-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 6px 0; }
        .modal-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.04); }
        .modal-label { color: #64748b; }
        .modal-value { color: #e2e8f0; font-weight: 600; }
        .modal-total { color: #818cf8; font-weight: 800; font-size: 18px; font-family: 'JetBrains Mono', monospace; }
        .modal-fee-box { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.18); border-radius: 12px; padding: 14px; margin-bottom: 16px; }
        .modal-fee-label { font-size: 11px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .modal-fee-row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; }
        .modal-fee-row:not(:last-child) { border-bottom: 1px solid rgba(245,158,11,0.08); }
        .fee-row-label { color: #78716c; }
        .fee-row-value { font-weight: 600; font-family: 'JetBrains Mono', monospace; }
        .fee-row-value.deduct { color: #fb923c; }
        .fee-row-value.earn   { color: #34d399; }
        .fee-row-value.pct    { color: #fbbf24; }
        .modal-features { background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.12); border-radius: 12px; padding: 14px; margin-bottom: 22px; }
        .modal-features-label { font-size: 11px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
        .modal-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); color: #a5b4fc; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 8px; }
        .chip.boost { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.2); color: #fbbf24; }
        .modal-actions { display: flex; gap: 10px; }
        .cancel-btn { flex: 1; padding: 13px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: transparent; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.18s; }
        .cancel-btn:hover { border-color: rgba(255,255,255,0.15); color: #94a3b8; }
        .confirm-btn { flex: 1; padding: 13px; border-radius: 12px; border: none; background: linear-gradient(135deg, #6366f1, #4f46e5); font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer; transition: all 0.18s; box-shadow: 0 6px 20px rgba(99,102,241,0.35); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .confirm-btn:hover { box-shadow: 0 10px 30px rgba(99,102,241,0.5); filter: brightness(1.05); }
        .confirm-btn:disabled { opacity: 0.55; cursor: not-allowed; filter: none; }
        .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(16,185,129,0.15); border: 2px solid rgba(16,185,129,0.3); display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
        .success-details { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; margin-bottom: 22px; }
        .success-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; font-size: 13px; }
        .success-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.04); }
        .success-label { color: #64748b; }
        .success-value { color: #e2e8f0; font-weight: 600; }
        .active-pill { display: inline-flex; align-items: center; gap: 5px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #34d399; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
        .active-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block; }
        .done-btn { width: 100%; padding: 13px; border-radius: 12px; border: none; background: linear-gradient(135deg, #10b981, #059669); font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer; transition: all 0.18s; box-shadow: 0 6px 20px rgba(16,185,129,0.3); }
        .done-btn:hover { box-shadow: 0 10px 30px rgba(16,185,129,0.45); filter: brightness(1.05); }
        .empty { text-align: center; padding: 80px 0; color: #334155; }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-text { font-size: 14px; font-weight: 500; }
        .grid-layout { display: grid; gap: 24px; }
      `}</style>

      <div className="plans-root">
        <div className="plans-content">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div className="badge">Pricing Plans</div>
            <h1 className="heading">Built for <span>Healthcare Professionals</span></h1>
            <p className="subheading">
              Flexible plans that grow with your practice. Upgrade or cancel anytime with no hidden fees.
            </p>
          </div>

          {activePlanId && planIsActive && (
            <div className="current-plan-banner">
              <div className="cp-left">
                <div className="cp-label">Active Plan</div>
                <div className="cp-name">{UserAuthData.currentPlan.name}</div>
                <div className="cp-meta">
                  {planStart && (
                    <div className="cp-meta-item">
                      Started: <span>{new Date(planStart).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="cp-right">
                <div className="cp-active-badge"><span className="cp-active-dot" /> Active</div>
                {planExpiry && (
                  <div className="cp-expiry-badge">
                    Expires {new Date(planExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMsg && <div className="alert error">{errorMsg}</div>}

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "48px" }}>
            <div className="cycle-switcher">
              {CYCLES.map((cycle) => (
                <button
                  key={cycle.key}
                  onClick={() => setBillingCycle(cycle.key)}
                  className={`cycle-btn${billingCycle === cycle.key ? " active" : ""}`}
                >
                  {cycle.label}
                  {cycle.key === "yearly" && <span className="save-pill">SAVE</span>}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <div className="spinner" />
            </div>
          ) : plans.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <p className="empty-text">No plans available right now.</p>
            </div>
          ) : (
            <div className={`grid-layout ${gridClass}`}>
              {plans.map((plan, index) => {
                const price       = getPrice(plan);
                const savings     = getSavings(plan);
                const popular     = isPopular(index);
                const isCurrent   = isCurrentPlan(plan);
                const cycleSuffix = CYCLES.find((c) => c.key === billingCycle)?.suffix;
                const fee         = getFeeBreakdown(plan, 100);

                const enabledFeatures  = FEATURES.filter(({ key }) => plan.features?.[key]);
                const disabledFeatures = FEATURES.filter(({ key }) => !plan.features?.[key]);
                const hasBoost         = plan.features?.searchBoost > 0;

                return (
                  <div
                    key={plan._id}
                    className={`plan-card ${popular ? "popular" : "default"} ${isCurrent ? "current-active" : ""}`}
                  >
                    {isCurrent  && <div className="active-plan-ribbon">✓ Your Current Plan</div>}
                    {!isCurrent && popular && <div className="popular-badge">⭐ Most Popular</div>}

                    <div className={`card-header${popular || isCurrent ? " has-badge" : ""}`}>
                      <div className="plan-name">{plan.name}</div>
                      {savings && <div className="savings-pill">Save ₹{savings}</div>}
                      <div className="price-row">
                        <span className={`price-amount${!price ? " price-free" : ""}`}>
                          {price ? `₹${price}` : "Free"}
                        </span>
                        {price && <span className="price-suffix">/{cycleSuffix}</span>}
                      </div>
                      {billingCycle !== "monthly" && plan.price?.monthly && (
                        <p className="price-note">vs ₹{plan.price.monthly}/mo billed monthly</p>
                      )}
                      {fee.percentage > 0 && (
                        <div className="platform-fee-strip">
                          <span className="pf-label">💰 Platform Fee</span>
                          <span className="pf-value">{fee.percentage}%</span>
                          <span className="pf-earning">Keep ₹{fee.earning} of ₹100</span>
                        </div>
                      )}
                    </div>

                    <div className="card-body">
                      <ul className="feature-list">

                        {/* ── Included features first ── */}
                        {(enabledFeatures.length > 0 || hasBoost) && (
                          <div className="feature-section-label included">What you get</div>
                        )}
                        {enabledFeatures.map(({ key, label, icon }) => (
                          <li key={key} className="feature-item enabled">
                            <span className="feature-icon check">✓</span>
                            {icon} {label}
                          </li>
                        ))}
                        {hasBoost && (
                          <li className="feature-item enabled">
                            <span className="feature-icon boost">🚀</span>
                            Search Boost ×{plan.features.searchBoost}
                          </li>
                        )}

                        {/* ── Excluded features at the bottom ── */}
                        {disabledFeatures.length > 0 && (
                          <>
                            <div className="divider" />
                            <div className="feature-section-label excluded">Not included</div>
                            {disabledFeatures.map(({ key, label, icon }) => (
                              <li key={key} className="feature-item.disabled { color: #64748b; }">
                                <span className="feature-icon.cross { background: rgba(239,68,68,0.08); color: #475569; }">✕</span>
                                <span className="feature-label-disabled { text-decoration: line-through; opacity: 0.6; }">{icon} {label}</span>
                              </li>
                            ))}
                          </>
                        )}
                      </ul>

                      <button
                        onClick={() => {
                          if (isCurrent) return;
                          setErrorMsg("");
                          setSelectedPlan(plan);
                        }}
                        className={`cta-btn ${isCurrent ? "active-btn" : popular ? "popular-btn" : "default-btn"}`}
                        disabled={isCurrent}
                      >
                        {isCurrent ? "✓ Current Plan" : `Get ${plan.name}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="footer-note">
            <span>24/7 Support</span>
            <span>No hidden fees</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {selectedPlan && (() => {
        const price = getPrice(selectedPlan);
        const fee   = getFeeBreakdown(selectedPlan, price || 0);
        return (
          <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setSelectedPlan(null)}
          >
            <div className="modal">
              <div className="modal-title">Confirm Subscription</div>
              <div className="modal-sub">Review your plan before confirming.</div>

              <div className="modal-details">
                <div className="modal-row">
                  <span className="modal-label">Plan</span>
                  <span className="modal-value">{selectedPlan.name}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Billing Cycle</span>
                  <span className="modal-value" style={{ textTransform: "capitalize" }}>{billingCycle}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Total</span>
                  <span className="modal-total">{price ? `₹${price}` : "Free"}</span>
                </div>
              </div>

              {fee.percentage > 0 && price > 0 && (
                <div className="modal-fee-box">
                  <div className="modal-fee-label">💰 Platform Fee Breakdown</div>
                  <div className="modal-fee-row">
                    <span className="fee-row-label">Consultation Amount</span>
                    <span className="fee-row-value">₹{price}</span>
                  </div>
                  <div className="modal-fee-row">
                    <span className="fee-row-label">Platform Fee ({fee.percentage}%)</span>
                    <span className="fee-row-value deduct">− ₹{fee.fee}</span>
                  </div>
                  {selectedPlan.platformFee?.maxFeePerTransaction && (
                    <div className="modal-fee-row">
                      <span className="fee-row-label">Max Fee Cap</span>
                      <span className="fee-row-value pct">₹{selectedPlan.platformFee.maxFeePerTransaction}</span>
                    </div>
                  )}
                  <div className="modal-fee-row">
                    <span className="fee-row-label">You Earn</span>
                    <span className="fee-row-value earn">₹{fee.earning}</span>
                  </div>
                </div>
              )}

              {FEATURES.filter((f) => selectedPlan.features?.[f.key]).length > 0 && (
                <div className="modal-features">
                  <div className="modal-features-label">Included Features</div>
                  <div className="modal-chips">
                    {FEATURES.filter((f) => selectedPlan.features?.[f.key]).map((f) => (
                      <span key={f.key} className="chip">{f.icon} {f.label}</span>
                    ))}
                    {selectedPlan.features?.searchBoost > 0 && (
                      <span className="chip boost">🚀 Boost ×{selectedPlan.features.searchBoost}</span>
                    )}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="alert error" style={{ marginBottom: "16px" }}>{errorMsg}</div>
              )}

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => { setSelectedPlan(null); setErrorMsg(""); }}>
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handlePurchase} disabled={purchaseLoading}>
                  {purchaseLoading ? <><span className="btn-spinner" /> Processing…</> : "Confirm & Subscribe"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Success Modal */}
      {purchaseResult && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setPurchaseResult(null)}
        >
          <div className="modal">
            <div className="success-icon">✅</div>
            <div className="modal-title" style={{ textAlign: "center" }}>Purchase Successful!</div>
            <div className="modal-sub" style={{ textAlign: "center", marginBottom: "20px" }}>
              {purchaseResult.planName} is now active on your account.
            </div>
            <div className="success-details">
              <div className="success-row">
                <span className="success-label">Plan</span>
                <span className="success-value">{purchaseResult.planName}</span>
              </div>
              <div className="success-row">
                <span className="success-label">Billing Cycle</span>
                <span className="success-value" style={{ textTransform: "capitalize" }}>{purchaseResult.billingCycle}</span>
              </div>
              <div className="success-row">
                <span className="success-label">Start Date</span>
                <span className="success-value">
                  {new Date(purchaseResult.planStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="success-row">
                <span className="success-label">Expiry Date</span>
                <span className="success-value">
                  {new Date(purchaseResult.planExpiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="success-row">
                <span className="success-label">Status</span>
                <span className="active-pill"><span className="active-dot" /> Active</span>
              </div>
              {purchaseResult.features && Object.keys(purchaseResult.features).length > 0 && (
                <div className="success-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                  <span className="success-label">Features Unlocked</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {FEATURES.filter((f) => purchaseResult.features?.[f.key]).map((f) => (
                      <span key={f.key} className="chip">{f.icon} {f.label}</span>
                    ))}
                    {purchaseResult.features?.searchBoost > 0 && (
                      <span className="chip boost">🚀 Boost ×{purchaseResult.features.searchBoost}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="done-btn" onClick={() => setPurchaseResult(null)}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}
