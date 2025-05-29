import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { quotationsCollection } from './collections';
import { Quotation, QuotationInputs } from '../../types/quotation';

export const createQuotation = async (quotationData: {
  leadId: string;
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

    return {
      id: docRef.id,
      ...quotationData,
      version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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