export interface QuotationInputs {
  orderType: string;
  machineType: string;
  workingHours: string;
  dayNight: string;
  shift: string;
  sundayWorking: string;
  foodResources: string;
  accomResources: string;
  usage: string;
  siteDistance: string;
  trailerCost: string;
  mobRelaxation: string;
  workingCost: string;
  elongation: string;
  dealType: string;
  extraCharge: string;
  billing: string;
  riskFactor: string;
  incidentalCharges: string;
  otherFactors: string;
  otherFactorsCharge: string;
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

export interface Quotation extends QuotationInputs, QuotationCalculations {
  id: string;
  leadId: string;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}