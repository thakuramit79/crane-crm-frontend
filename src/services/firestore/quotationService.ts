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
import { Quotation } from '../../types/quotation';

export const createQuotation = async (quotationData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Quotation> => {
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
      ...quotationData,
      id: docRef.id,
      version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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