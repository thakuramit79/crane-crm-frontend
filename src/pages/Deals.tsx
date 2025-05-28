import React from 'react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function Deals() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Deals</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Deals management interface will be implemented here.</p>
      </div>
    </div>
  );
}