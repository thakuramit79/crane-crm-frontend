import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { quotationsCollection } from './collections';
import { Quotation, QuotationInputs } from '../../types/quotation';

export const createQuotation = async (quotationData: {
  leadId: string;
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
  calculations: {
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
  };
  createdBy: string;
}): Promise<Quotation> => {
  try {
    // Get existing quotations for this lead to determine version
    const existingQuotations = await getDocs(
      query(quotationsCollection, where('leadId', '==', quotationData.leadId))
    );
    const version = existingQuotations.size + 1;

    const docRef = await addDoc(quotationsCollection, {
      ...quotationData,
      version,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newDocSnapshot = await getDoc(docRef);
    const newDocData = newDocSnapshot.data();

    if (!newDocData) {
      throw new Error("Failed to fetch newly created quotation document.");
    }

    return {
      id: docRef.id,
      leadId: quotationData.leadId,
      orderType: quotationData.orderType,
      machineType: quotationData.machineType,
      workingHours: quotationData.workingHours,
      dayNight: quotationData.dayNight,
      shift: quotationData.shift,
      sundayWorking: quotationData.sundayWorking,
      foodResources: quotationData.foodResources,
      accomResources: quotationData.accomResources,
      usage: quotationData.usage,
      siteDistance: quotationData.siteDistance,
      trailerCost: quotationData.trailerCost,
      mobRelaxation: quotationData.mobRelaxation,
      workingCost: quotationData.workingCost,
      elongation: quotationData.elongation,
      dealType: quotationData.dealType,
      extraCharge: quotationData.extraCharge,
      billing: quotationData.billing,
      riskFactor: quotationData.riskFactor,
      incidentalCharges: quotationData.incidentalCharges,
      otherFactors: quotationData.otherFactors,
      otherFactorsCharge: quotationData.otherFactorsCharge,
      calculations: quotationData.calculations,
      createdBy: quotationData.createdBy,
      version,
      createdAt: (newDocData.createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (newDocData.updatedAt as Timestamp).toDate().toISOString(),
    } as Quotation;
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }
};

export const getQuotationsForLead = async (leadId: string): Promise<Quotation[]> => {
  try {
    const snapshot = await getDocs(
      query(quotationsCollection, where('leadId', '==', leadId))
    );

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
    } as Quotation));
  } catch (error) {
    console.error('Error fetching quotations:', error);
    throw error;
  }
};