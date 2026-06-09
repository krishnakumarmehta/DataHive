// Utility helper functions

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    delivered: 'success',
    shipped: 'primary',
    processing: 'warning',
    pending: 'warning',
    cancelled: 'danger',
    out_of_stock: 'danger',
    inactive: 'danger',
  };
  return colors[status] || 'primary';
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const truncate = (str, length = 50) => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};
