'use client';

import { useState } from 'react';
import { sendForgotOTP, verifyForgotOTP, resetPassword } from '../services/forgotPassword.service';

export const useForgotPassword = () => {
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpVerifyStatus, setOtpVerifyStatus] = useState(null);
  const [otpVerifyMessage, setOtpVerifyMessage] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const VALID_ROLES = ['doctor', 'patient', 'admin', 'superadmin'];

  const handleSendForgotOTP = async (email, role) => {
    if (!email || !role) {
      setError('Email and role are required');
      return;
    }

    if (!VALID_ROLES.includes(role)) {
      setError('Invalid role provided');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await sendForgotOTP({ email, role });
      if (res.data?.success) {
        setOtpSent(true);
        setStep('otp');
        setSuccessMsg(res.data.msg);
      } else {
        setError(res.data?.msg || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotOTP = async (email, otp) => {
    if (!otp || otp.length < 6) return;
    setOtpVerifyStatus('loading');
    setOtpVerifyMessage('Verifying OTP...');
    setError('');
    try {
      const res = await verifyForgotOTP({ email, otp });
      if (res.data?.success) {
        setOtpVerifyStatus('success');
        setOtpVerifyMessage('OTP verified successfully!');
        setOtpVerified(true);
        setTimeout(() => setStep('reset'), 800);
      } else {
        setOtpVerifyStatus('error');
        setOtpVerifyMessage(res.data?.msg || 'Invalid OTP');
        setOtpVerified(false);
      }
    } catch (err) {
      setOtpVerifyStatus('error');
      setOtpVerifyMessage(err?.response?.data?.msg || 'Verification failed. Please try again.');
      setOtpVerified(false);
    }
  };

  const handleOtpChange = (val, email, setOtp) => {
    setOtp(val);
    setOtpVerifyStatus(null);
    setOtpVerified(false);
    if (val.length === 6) {
      setTimeout(() => handleVerifyForgotOTP(email, val), 300);
    }
  };

  const handleResetPassword = async (email, role, newPassword, confirmPassword, onSuccess) => {
    setError('');

    if (!VALID_ROLES.includes(role)) {
      setError('Invalid role provided');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email, role, newPassword, confirmPassword });
      if (res.data?.success) {
        setSuccessMsg(res.data.msg);
        setStep('done');
        if (onSuccess) onSuccess();
      } else {
        setError(res.data?.msg || 'Failed to reset password');
      }
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep('email');
    setLoading(false);
    setError('');
    setSuccessMsg('');
    setOtpVerifyStatus(null);
    setOtpVerifyMessage('');
    setOtpVerified(false);
    setOtpSent(false);
  };

  return {
    step,
    loading,
    error,
    successMsg,
    otpSent,
    otpVerified,
    otpVerifyStatus,
    otpVerifyMessage,
    handleSendForgotOTP,
    handleVerifyForgotOTP,
    handleOtpChange,
    handleResetPassword,
    resetState,
  };
};
