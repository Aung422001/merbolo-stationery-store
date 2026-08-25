export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'MMK 0';
  }
  return 'MMK ' + new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(amount);
};

