import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { motion } from 'framer-motion';

interface QuotationFormProps {
  onCalculate: (values: QuotationValues) => void;
}

interface QuotationValues {
  orderType: string;
  machineType: string;
  workingHours: number;
  shiftType: string;
  shift: string;
  sundayWorking: boolean;
  foodResources: number;
  accomResources: number;
  usage: string;
  siteDistance: number;
  trailerCost: number;
  mobRelaxation: number;
  workingCost: number;
  elongation: number;
  dealType: string;
  extraCharge: number;
  billing: string;
  riskFactor: string;
  incidentalCharges: number;
  otherFactors: string[];
  otherCharges: number;
}

const ORDER_TYPES = [
  { value: 'micro', label: 'Micro' },
  { value: 'small', label: 'Small' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const MACHINE_TYPES = [
  { value: 'mobile_crane_30t', label: 'Mobile Crane 30T', baseRate: 1500 },
  { value: 'mobile_crane_50t', label: 'Mobile Crane 50T', baseRate: 2500 },
  { value: 'tower_crane_50m', label: 'Tower Crane 50m', baseRate: 5000 },
  { value: 'tower_crane_80m', label: 'Tower Crane 80m', baseRate: 7500 },
];

const SHIFT_TYPES = [
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
];

const SHIFT_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
];

const USAGE_TYPES = [
  { value: 'heavy', label: 'Heavy', percentage: 90 },
  { value: 'light', label: 'Light', percentage: 70 },
];

const DEAL_TYPES = [
  { value: 'no_advance', label: 'No Advance' },
  { value: 'credit', label: 'Credit' },
  { value: 'long_credit', label: 'Long Credit' },
];

const BILLING_TYPES = [
  { value: 'gst', label: 'GST' },
  { value: 'no_gst', label: 'No GST' },
];

const RISK_FACTORS = [
  { value: 'high', label: 'High', percentage: 15 },
  { value: 'medium', label: 'Medium', percentage: 10 },
  { value: 'low', label: 'Low', percentage: 5 },
];

const OTHER_FACTORS = [
  { value: 'area', label: 'Area' },
  { value: 'condition', label: 'Condition' },
  { value: 'customer_reputation', label: 'Customer Reputation' },
  { value: 'rigger', label: 'Rigger' },
  { value: 'helper', label: 'Helper' },
];

export function QuotationForm({ onCalculate }: QuotationFormProps) {
  const [values, setValues] = useState<QuotationValues>({
    orderType: 'micro',
    machineType: '',
    workingHours: 8,
    shiftType: 'day',
    shift: 'single',
    sundayWorking: false,
    foodResources: 0,
    accomResources: 0,
    usage: 'light',
    siteDistance: 0,
    trailerCost: 0,
    mobRelaxation: 0,
    workingCost: 0,
    elongation: 0,
    dealType: 'no_advance',
    extraCharge: 0,
    billing: 'gst',
    riskFactor: 'low',
    incidentalCharges: 0,
    otherFactors: [],
    otherCharges: 0,
  });

  const [rentComponents, setRentComponents] = useState<{
    workingCost: number;
    elongation: number;
    trailerCost: number;
    foodAccom: number;
    usageLoad: number;
    extraCharges: number;
    riskAdjustment: number;
    gst: number;
    total: number;
  }>({
    workingCost: 0,
    elongation: 0,
    trailerCost: 0,
    foodAccom: 0,
    usageLoad: 0,
    extraCharges: 0,
    riskAdjustment: 0,
    gst: 0,
    total: 0,
  });

  useEffect(() => {
    calculateRent();
  }, [values]);

  const calculateRent = () => {
    const selectedMachine = MACHINE_TYPES.find(m => m.value === values.machineType);
    const baseRate = selectedMachine?.baseRate || 0;
    
    // Calculate working hours
    let totalHours = values.workingHours;
    if (values.orderType === 'monthly') {
      totalHours = values.workingHours * 26;
    } else if (values.orderType === 'yearly') {
      totalHours = values.workingHours * 26 * 12;
    }
    
    // Basic working cost
    const workingCost = baseRate * totalHours;
    
    // Usage load factor
    const usagePercentage = USAGE_TYPES.find(u => u.value === values.usage)?.percentage || 70;
    const usageLoad = workingCost * (usagePercentage / 100);
    
    // Elongation
    const elongation = workingCost * 0.15; // 15% of working cost
    
    // Food & Accommodation
    const foodAccom = (values.foodResources * 500 + values.accomResources * 1000);
    
    // Trailer cost based on distance
    const trailerCost = values.siteDistance * 100; // Example: ₹100 per km
    
    // Risk adjustment
    const riskPercentage = RISK_FACTORS.find(r => r.value === values.riskFactor)?.percentage || 5;
    const riskAdjustment = workingCost * (riskPercentage / 100);
    
    // Extra charges
    const extraCharges = values.extraCharge + values.incidentalCharges + values.otherCharges;
    
    // Calculate subtotal
    const subtotal = workingCost + elongation + trailerCost + foodAccom + usageLoad + extraCharges + riskAdjustment;
    
    // GST (18%)
    const gst = values.billing === 'gst' ? subtotal * 0.18 : 0;
    
    // Total
    const total = subtotal + gst;
    
    setRentComponents({
      workingCost,
      elongation,
      trailerCost,
      foodAccom,
      usageLoad,
      extraCharges,
      riskAdjustment,
      gst,
      total,
    });
    
    onCalculate(values);
  };

  const handleInputChange = (name: keyof QuotationValues, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* H1 - Order Type */}
      <Card>
        <CardHeader>
          <CardTitle>Order Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            label="Order Type (P1)"
            options={ORDER_TYPES}
            value={values.orderType}
            onChange={(value) => handleInputChange('orderType', value)}
          />
        </CardContent>
      </Card>

      {/* H2 - Type of Machine */}
      <Card>
        <CardHeader>
          <CardTitle>Type of Machine</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            label="Machine Type (P2)"
            options={MACHINE_TYPES}
            value={values.machineType}
            onChange={(value) => handleInputChange('machineType', value)}
          />
        </CardContent>
      </Card>

      {/* H3 - Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            label="No. of Hours Working (P3)"
            value={values.workingHours}
            onChange={(e) => handleInputChange('workingHours', parseInt(e.target.value))}
            min={1}
          />
          
          <Select
            label="Day/Night (P4)"
            options={SHIFT_TYPES}
            value={values.shiftType}
            onChange={(value) => handleInputChange('shiftType', value)}
          />
          
          <Select
            label="Shift (P5)"
            options={SHIFT_OPTIONS}
            value={values.shift}
            onChange={(value) => handleInputChange('shift', value)}
          />
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sundayWorking"
              checked={values.sundayWorking}
              onChange={(e) => handleInputChange('sundayWorking', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="sundayWorking" className="text-sm">
              Sunday Working (P6)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* H4 - Accommodation */}
      <Card>
        <CardHeader>
          <CardTitle>Accommodation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            label="Food Resources (P7)"
            value={values.foodResources}
            onChange={(e) => handleInputChange('foodResources', parseInt(e.target.value))}
            min={0}
          />
          
          <Input
            type="number"
            label="Accommodation Resources (P10)"
            value={values.accomResources}
            onChange={(e) => handleInputChange('accomResources', parseInt(e.target.value))}
            min={0}
          />
        </CardContent>
      </Card>

      {/* H5 - Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            label="Usage (P11)"
            options={USAGE_TYPES}
            value={values.usage}
            onChange={(value) => handleInputChange('usage', value)}
          />
        </CardContent>
      </Card>

      {/* H6 - Mob - Demob */}
      <Card>
        <CardHeader>
          <CardTitle>Mob - Demob</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            label="Distance of Site (P12) in km"
            value={values.siteDistance}
            onChange={(e) => handleInputChange('siteDistance', parseInt(e.target.value))}
            min={0}
          />
          
          <Input
            type="number"
            label="Mob Relaxation Given (P14)"
            value={values.mobRelaxation}
            onChange={(e) => handleInputChange('mobRelaxation', parseInt(e.target.value))}
            min={0}
          />
        </CardContent>
      </Card>

      {/* H7 - Fuel */}
      <Card>
        <CardHeader>
          <CardTitle>Fuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500">
            Working Cost (P15): {formatCurrency(rentComponents.workingCost)}
          </div>
          <div className="text-sm text-gray-500">
            Elongation (P16): {formatCurrency(rentComponents.elongation)}
          </div>
        </CardContent>
      </Card>

      {/* H8 - Commercial */}
      <Card>
        <CardHeader>
          <CardTitle>Commercial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Type of Deal (P17)"
            options={DEAL_TYPES}
            value={values.dealType}
            onChange={(value) => handleInputChange('dealType', value)}
          />
          
          <Input
            type="number"
            label="Extra Charge for P17 (P18)"
            value={values.extraCharge}
            onChange={(e) => handleInputChange('extraCharge', parseInt(e.target.value))}
            min={0}
          />
          
          <Select
            label="Billing"
            options={BILLING_TYPES}
            value={values.billing}
            onChange={(value) => handleInputChange('billing', value)}
          />
        </CardContent>
      </Card>

      {/* H9 - Risk Factor */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            label="Risk Factor (P19)"
            options={RISK_FACTORS}
            value={values.riskFactor}
            onChange={(value) => handleInputChange('riskFactor', value)}
          />
        </CardContent>
      </Card>

      {/* H10 - Incidental Charge */}
      <Card>
        <CardHeader>
          <CardTitle>Incidental Charge</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            label="Incidental Charges (P20)"
            value={values.incidentalCharges}
            onChange={(e) => handleInputChange('incidentalCharges', parseInt(e.target.value))}
            min={0}
          />
        </CardContent>
      </Card>

      {/* H11 - Other Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Other Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {OTHER_FACTORS.map((factor) => (
              <div key={factor.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={factor.value}
                  checked={values.otherFactors.includes(factor.value)}
                  onChange={(e) => {
                    const newFactors = e.target.checked
                      ? [...values.otherFactors, factor.value]
                      : values.otherFactors.filter(f => f !== factor.value);
                    handleInputChange('otherFactors', newFactors);
                  }}
                  className="rounded border-gray-300"
                />
                <label htmlFor={factor.value} className="text-sm">
                  {factor.label}
                </label>
              </div>
            ))}
          </div>
          
          <Input
            type="number"
            label="Charges for Other Factors (P22)"
            value={values.otherCharges}
            onChange={(e) => handleInputChange('otherCharges', parseInt(e.target.value))}
            min={0}
          />
        </CardContent>
      </Card>

      {/* Rent Output Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rent Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(rentComponents).map(([key, value]) => (
            key !== 'total' && (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-medium">{formatCurrency(value)}</span>
                </div>
                <motion.div
                  className="h-2 bg-primary-100 rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / rentComponents.total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="h-full bg-primary-500 rounded-full" />
                </motion.div>
              </div>
            )
          ))}
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Rent</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(rentComponents.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}