import React from 'react';
import { DollarSign, Truck } from 'lucide-react';

export function EquipmentManagement() {
  const item = {
    baseRate: 1000,
    runningCostPerKm: 50
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-gray-600">
        <DollarSign className="h-4 w-4" />
        <span>₹{item.baseRate}/hr base rate</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Truck className="h-4 w-4" />
        <span>₹{item.runningCostPerKm}/km running cost</span>
      </div>
    </div>
  );
}