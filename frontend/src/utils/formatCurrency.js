export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'K 0';
  }
  return 'K ' + new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(amount);
};
