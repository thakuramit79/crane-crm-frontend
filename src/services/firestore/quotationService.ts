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

export const createQuotation = async (
  leadId: string,
  inputs: QuotationInputs,
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
  },
  createdBy: string
): Promise<Quotation> => {
  try {
    // Get existing quotations for this lead to determine version
    const existingQuotations = await getDocs(
      query(quotationsCollection, where('leadId', '==', leadId))
    );
    const version = existingQuotations.size + 1;

    const quotationData = {
      leadId,
      ...inputs,
      ...calculations,
      version,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(quotationsCollection, quotationData);

    return {
      id: docRef.id,
      ...quotationData,
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