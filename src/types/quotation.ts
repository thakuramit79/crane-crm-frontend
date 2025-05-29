export interface QuotationInputs {
  orderType: string;
  machineType: string;
  workingHours: number; // Changed
  dayNight: string;
  shift: string;
  sundayWorking: string;
  foodResources: number; // Changed
  accomResources: number; // Changed
  usage: string;
  siteDistance: number; // Changed
  trailerCost: number; // Changed
  mobRelaxation: string;
  workingCost: number; // Changed
  elongation: number; // Changed
  dealType: string;
  extraCharge: number; // Changed
  billing: string;
  riskFactor: string;
  incidentalCharges: number; // Changed
  otherFactors: string;
  otherFactorsCharge: number; // Changed
}

export interface QuotationCalculations {
  baseRate: number;
  totalHours: number;
  workingCost: number;
  elongationCost: number;
  trailerCost: number;
  foodAccomCost: number;
  usageLoadFactor: number;
  extraCharges: number;
  riskAdjustment: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Quotation extends QuotationInputs {
  id: string;
  leadId: string;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  calculations: QuotationCalculations;
}