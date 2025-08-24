export const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `₹${amount.toFixed(2)}`;
  }
};


