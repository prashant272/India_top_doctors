"use client";
import { useEffect, useState } from "react";
import { usePlans } from "@/app/hooks/useplans";

const EMPTY_FORM = {
  name: "",
  price: { monthly: "", halfYearly: "", yearly: "" },
  features: {
    blogAccess: false,
    verifiedBadge: false,
    onlineBooking: false,
    onlineConsultation: false,
    searchBoost: 0,
  },
  platformFee: {
    percentage: "",
    maxFeePerTransaction: "",
    description: "",
  },
  isActive: true,
};

export default function PlanManagement() {
  const {
    loading,
    error,
    handleCreatePlan,
    handleGetPlans,
    handleUpdatePlan,
    handleDeletePlan,
  } = usePlans();

  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await handleGetPlans();
      setPlans(res.data || []);
    } catch {}
  };

  const handlePriceChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      price: { ...prev.price, [key]: value },
    }));
  };

  const handlePlatformFeeChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      platformFee: { ...prev.platformFee, [key]: value },
    }));
  };

  const handleFeatureToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }));
  };

  const openEditForm = (plan) => {
    setForm({
      name: plan.name,
      price: {
        monthly: plan.price?.monthly ?? "",
        halfYearly: plan.price?.halfYearly ?? "",
        yearly: plan.price?.yearly ?? "",
      },
      features: {
        blogAccess: plan.features?.blogAccess || false,
        verifiedBadge: plan.features?.verifiedBadge || false,
        onlineBooking: plan.features?.onlineBooking || false,
        onlineConsultation: plan.features?.onlineConsultation || false,
        searchBoost: plan.features?.searchBoost || 0,
      },
      platformFee: {
        percentage: plan.platformFee?.percentage ?? "",
        maxFeePerTransaction: plan.platformFee?.maxFeePerTransaction ?? "",
        description: plan.platformFee?.description ?? "",
      },
      isActive: plan.isActive,
    });
    setEditingId(plan._id);
    setShowForm(true);
    setFormError("");
    setSuccessMsg("");
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!form.name.trim()) {
      setFormError("Plan name is required.");
      return;
    }

    const payload = {
      name: form.name,
      price: {
        monthly: Number(form.price.monthly),
        halfYearly: Number(form.price.halfYearly),
        yearly: Number(form.price.yearly),
      },
      features: {
        ...form.features,
        searchBoost: Number(form.features.searchBoost),
      },
      platformFee: {
        percentage: Number(form.platformFee.percentage) || 0,
        maxFeePerTransaction: form.platformFee.maxFeePerTransaction
          ? Number(form.platformFee.maxFeePerTransaction)
          : null,
        description: form.platformFee.description || "",
      },
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await handleUpdatePlan(editingId, payload);
        setSuccessMsg("Plan updated successfully!");
      } else {
        await handleCreatePlan(payload);
        setSuccessMsg("Plan created successfully!");
      }
      resetForm();
      fetchPlans();
    } catch {
      setFormError(editingId ? "Failed to update plan." : "Failed to create plan.");
    }
  };

  const confirmDelete = async (id) => {
    try {
      await handleDeletePlan(id);
      setDeleteConfirm(null);
      setSuccessMsg("Plan deleted successfully!");
      fetchPlans();
    } catch {
      setFormError("Failed to delete plan.");
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Plan Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage subscription plans for doctors</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
              setFormError("");
              setSuccessMsg("");
            }
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          {showForm ? "Cancel" : "Add Plan"}
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {(formError || error) && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {formError || "Something went wrong."}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Plan</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete this plan? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-5">
            {editingId ? "Update Plan" : "Create New Plan"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Premium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="text-sm font-medium text-gray-600">Active</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Pricing (₹)</label>
              <div className="grid grid-cols-3 gap-3">
                {["monthly", "halfYearly", "yearly"].map((key) => (
                  <div key={key}>
                    <span className="block text-xs text-gray-400 capitalize mb-1">
                      {key === "halfYearly" ? "Half-Yearly" : key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.price[key]}
                      onChange={(e) => handlePriceChange(key, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Features</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {[
                  { key: "blogAccess", label: "Blog Access" },
                  { key: "verifiedBadge", label: "Verified Badge" },
                  { key: "onlineBooking", label: "Online Booking" },
                  { key: "onlineConsultation", label: "Online Consultation" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${
                      form.features[key]
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.features[key]}
                      onChange={() => handleFeatureToggle(key)}
                    />
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                        form.features[key] ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"
                      }`}
                    >
                      {form.features[key] && "✓"}
                    </span>
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Search Boost</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.features.searchBoost}
                  onChange={(e) =>
                    setForm({ ...form, features: { ...form.features, searchBoost: e.target.value } })
                  }
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Platform Fee Section */}
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-amber-700 mb-3">
                💰 Platform Fee Configuration
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Fee Percentage (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 5"
                    value={form.platformFee.percentage}
                    onChange={(e) => handlePlatformFeeChange("percentage", e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {form.platformFee.percentage > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Doctor keeps ₹{(100 - Number(form.platformFee.percentage)).toFixed(0)} of every ₹100
                    </p>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Max Fee Cap (₹) — optional</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 200"
                    value={form.platformFee.maxFeePerTransaction}
                    onChange={(e) => handlePlatformFeeChange("maxFeePerTransaction", e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave blank for no cap</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Description</span>
                  <input
                    type="text"
                    placeholder="e.g. 5% per consultation"
                    value={form.platformFee.description}
                    onChange={(e) => handlePlatformFeeChange("description", e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {loading
                  ? editingId ? "Updating..." : "Creating..."
                  : editingId ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="flex justify-center py-16 text-gray-400 text-sm">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">📋</span>
          <p className="text-sm">No plans found. Create your first plan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Monthly</th>
                <th className="px-4 py-3 font-medium">Half-Yearly</th>
                <th className="px-4 py-3 font-medium">Yearly</th>
                <th className="px-4 py-3 font-medium">Platform Fee</th>
                <th className="px-4 py-3 font-medium">Features</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {plans.map((plan) => (
                <tr key={plan._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-800">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {plan.price?.monthly ? `₹${plan.price.monthly}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {plan.price?.halfYearly ? `₹${plan.price.halfYearly}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {plan.price?.yearly ? `₹${plan.price.yearly}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {plan.platformFee?.percentage > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                          💰 {plan.platformFee.percentage}%
                        </span>
                        {plan.platformFee.maxFeePerTransaction && (
                          <span className="text-xs text-gray-400">
                            Cap ₹{plan.platformFee.maxFeePerTransaction}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No fee</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {plan.features?.blogAccess && <FeatureBadge label="Blog" />}
                      {plan.features?.verifiedBadge && <FeatureBadge label="Verified" />}
                      {plan.features?.onlineBooking && <FeatureBadge label="Booking" />}
                      {plan.features?.onlineConsultation && <FeatureBadge label="Consult" />}
                      {plan.features?.searchBoost > 0 && (
                        <FeatureBadge label={`Boost ×${plan.features.searchBoost}`} color="purple" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditForm(plan)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(plan._id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FeatureBadge({ label, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  );
}
