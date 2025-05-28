import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Deal, DealStage } from '../../types/deal';
import { dealsCollection } from './collections';

export const getDeals = async (): Promise<Deal[]> => {
  try {
    const snapshot = await getDocs(dealsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
      expectedCloseDate: (doc.data().expectedCloseDate as Timestamp).toDate().toISOString(),
    } as Deal));
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};

export const createDeal = async (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> => {
  try {
    const docRef = await addDoc(dealsCollection, {
      ...dealData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expectedCloseDate: Timestamp.fromDate(new Date(dealData.expectedCloseDate))
    });

    return {
      ...dealData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
};

export const updateDealStage = async (id: string, stage: DealStage): Promise<Deal | null> => {
  try {
    const dealRef = doc(db, 'deals', id);
    await updateDoc(dealRef, {
      stage,
      updatedAt: serverTimestamp(),
    });

    const snapshot = await getDocs(query(collection(db, 'deals'), where('id', '==', id)));
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
      expectedCloseDate: (doc.data().expectedCloseDate as Timestamp).toDate().toISOString(),
    } as Deal;
  } catch (error) {
    console.error('Error updating deal stage:', error);
    throw error;
  }
};

export const getDealById = async (id: string): Promise<Deal | null> => {
  try {
    const snapshot = await getDocs(query(collection(db, 'deals'), where('id', '==', id)));
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
      expectedCloseDate: (doc.data().expectedCloseDate as Timestamp).toDate().toISOString(),
    } as Deal;
  } catch (error) {
    console.error('Error fetching deal:', error);
    throw error;
  }
};