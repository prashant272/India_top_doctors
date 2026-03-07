import { useState } from "react";
import { sendOTP, verifyOTP } from "../services/otp.service";

export const useOtp = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpVerifyStatus, setOtpVerifyStatus] = useState(null);
  const [otpVerifyMessage, setOtpVerifyMessage] = useState("");
  const [otpError, setOtpError] = useState("");

const handleSendOtp = async (email, fullName = '', role = '') => {
  if (!email) {
    setOtpError('Please enter your email first');
    return;
  }
  setOtpError('');
  setOtpLoading(true);
  setOtpVerifyStatus(null);
  setOtpVerified(false);
  try {
    const res = await sendOTP({ email, fullName, role });
    if (res.data?.success) {
      setOtpSent(true);
    } else {
      setOtpError(res.data?.msg || 'Failed to send OTP');
    }
  } catch (err) {
    setOtpError(err?.response?.data?.msg || 'Failed to send OTP. Please try again.');
  } finally {
    setOtpLoading(false);
  }
};


  const handleVerifyOtp = async (email, otp) => {
    if (!otp || otp.length < 6) return;
    setVerifyLoading(true);
    setOtpVerifyStatus("loading");
    setOtpVerifyMessage("Verifying OTP...");
    try {
      const res = await verifyOTP({ email, otp });
      if (res.data?.success) {
        setOtpVerifyStatus("success");
        setOtpVerifyMessage("Email verified successfully!");
        setOtpVerified(true);
      } else {
        setOtpVerifyStatus("error");
        setOtpVerifyMessage(res.data?.msg || "Invalid OTP");
        setOtpVerified(false);
      }
    } catch (err) {
      setOtpVerifyStatus("error");
      setOtpVerifyMessage(err?.response?.data?.msg || "Verification failed. Please try again.");
      setOtpVerified(false);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleOtpChange = (val, email, setOtp) => {
    setOtp(val);
    setOtpVerifyStatus(null);
    setOtpVerified(false);
    if (val.length === 6) {
      setTimeout(() => handleVerifyOtp(email, val), 300);
    }
  };

  const resetOtp = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpLoading(false);
    setVerifyLoading(false);
    setOtpVerifyStatus(null);
    setOtpVerifyMessage("");
    setOtpError("");
  };

  return {
    otpSent,
    otpVerified,
    otpLoading,
    verifyLoading,
    otpVerifyStatus,
    otpVerifyMessage,
    otpError,
    handleSendOtp,
    handleVerifyOtp,
    handleOtpChange,
    resetOtp,
  };
};
