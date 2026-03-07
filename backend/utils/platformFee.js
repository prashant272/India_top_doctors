exports.calculatePlatformFee = (totalAmount, platformFee) => {
  const { percentage = 0, maxFeePerTransaction = null } = platformFee;

  let fee = (percentage / 100) * totalAmount;

  if (maxFeePerTransaction !== null) {
    fee = Math.min(fee, maxFeePerTransaction);
  }

  return {
    totalAmount,
    platformFeePercentage: percentage,
    platformFeeAmount: parseFloat(fee.toFixed(2)),
    doctorEarning: parseFloat((totalAmount - fee).toFixed(2)),
  };
};
