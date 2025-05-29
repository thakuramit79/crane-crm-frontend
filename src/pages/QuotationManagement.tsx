import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { QuotationInputs } from '../types/quotation';
import { createQuotation } from '../services/quotationService';
import { showToast } from '../components/common/Toast';

export function QuotationManagement() {
  const { user } = useAuthStore();
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    orderType: '',
    machineType: '',
    workingHours: '',
    dayNight: '',
    shift: '',
    sundayWorking: false,
    foodResources: '',
    accomResources: '',
    usage: '',
    siteDistance: '',
    trailerCost: '',
    mobRelaxation: '',
    workingCost: '',
    elongation: '',
    dealType: '',
    extraCharge: '',
    billing: '',
    riskFactor: '',
    incidentalCharges: '',
    otherFactors: '',
    otherFactorsCharge: '',
  });
  const [calculations, setCalculations] = useState({});

  const handleSubmit = async () => {
    if (!selectedLead || !user) {
      showToast('Please select a lead', 'error');
      return;
    }

    try {
      // Parse numeric values
      const parsedInputs: QuotationInputs = {
        orderType: formData.orderType,
        machineType: formData.machineType,
        workingHours: Number(formData.workingHours),
        dayNight: formData.dayNight,
        shift: formData.shift,
        sundayWorking: formData.sundayWorking,
        foodResources: Number(formData.foodResources),
        accomResources: Number(formData.accomResources),
        usage: formData.usage,
        siteDistance: Number(formData.siteDistance),
        trailerCost: Number(formData.trailerCost),
        mobRelaxation: formData.mobRelaxation,
        workingCost: Number(formData.workingCost),
        elongation: Number(formData.elongation),
        dealType: formData.dealType,
        extraCharge: Number(formData.extraCharge),
        billing: formData.billing,
        riskFactor: formData.riskFactor,
        incidentalCharges: Number(formData.incidentalCharges),
        otherFactors: formData.otherFactors,
        otherFactorsCharge: Number(formData.otherFactorsCharge),
      };

      await createQuotation(
        selectedLead.id,
        parsedInputs,
        calculations,
        user.id
      );

      setIsCreateModalOpen(false);
      showToast('Quotation created successfully', 'success');
    } catch (error) {
      console.error('Error creating quotation:', error);
      showToast('Error creating quotation', 'error');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quotation Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Implement the quotation management interface here</p>
      </div>
    </div>
  );
}