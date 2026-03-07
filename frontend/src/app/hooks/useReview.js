import { useState } from "react";
import {
  createReview,
  getAllReviews,
  getDoctorReviews,
  getPlatformReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../services/review.service";

export const useReview = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleCreateReview = async (data) => {
    try {
      setLoading(true);
      const res = await createReview(data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllReviews = async () => {
    try {
      setLoading(true);
      const res = await getAllReviews();
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetDoctorReviews = async (doctorId) => {
    try {
      setLoading(true);
      const res = await getDoctorReviews(doctorId);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetPlatformReviews = async () => {
    try {
      setLoading(true);
      const res = await getPlatformReviews();
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetMyReviews = async () => {
    try {
      setLoading(true);
      const res = await getMyReviews();
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetReviewById = async (id) => {
    try {
      setLoading(true);
      const res = await getReviewById(id);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async (id, data) => {
    try {
      setLoading(true);
      const res = await updateReview(id, data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      setLoading(true);
      const res = await deleteReview(id);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleCreateReview,
    handleGetAllReviews,
    handleGetDoctorReviews,
    handleGetPlatformReviews,
    handleGetMyReviews,
    handleGetReviewById,
    handleUpdateReview,
    handleDeleteReview,
  };
};
