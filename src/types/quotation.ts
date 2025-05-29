export interface QuotationInputs {
  orderType: string;
  machineType: string;
  workingHours: number;
  dayNight: string;
  shift: string;
  sundayWorking: string;
  foodResources: number;
  accomResources: number;
  usage: string;
  siteDistance: number;
  trailerCost: number;
  mobRelaxation: string;
  workingCost: number;
  elongation: number;
  dealType: string;
  extraCharge: number;
  billing: string;
  riskFactor: string;
  incidentalCharges: number;
  otherFactors: string;
  otherFactorsCharge: number;
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