import { useState } from "react";
import { createPlan, getPlans, updatePlan, deletePlan, purchasePlan } from "../services/plans.service";

export const usePlans = () => {
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreatePlan = async (data) => {
    try {
      setLoading(true);
      const res = await createPlan(data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetPlans = async () => {
    try {
      setLoading(true);
      const res = await getPlans();
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (id, data) => {
    try {
      setLoading(true);
      const res = await updatePlan(data, id);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      setLoading(true);
      const res = await deletePlan(id);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePlan = async (doctorId, planId, billingCycle) => {
    try {
      setPurchaseLoading(true);
      setError(null);
      const res = await purchasePlan({ doctorId, planId, billingCycle });
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setPurchaseLoading(false);
    }
  };

  return {
    loading,
    purchaseLoading,
    error,
    handleCreatePlan,
    handleGetPlans,
    handleUpdatePlan,
    handleDeletePlan,
    handlePurchasePlan,
  };
};
