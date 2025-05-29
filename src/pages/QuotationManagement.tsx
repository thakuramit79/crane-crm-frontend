// Update the handleSubmit function in QuotationManagement.tsx
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