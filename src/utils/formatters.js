import { format } from 'date-fns';

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  return `KES ${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy, hh:mm a');
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${parseFloat(value).toFixed(2)}%`;
};

export const calculateSavings = (invoiced, approved) => {
  const inv = parseFloat(invoiced) || 0;
  const app = parseFloat(approved) || 0;
  return inv - app;
};

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
};