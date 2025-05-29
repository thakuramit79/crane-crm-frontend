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
import { db } from '../lib/firebase';
import { Deal, DealStage } from '../types/deal';
import { dealsCollection } from './firestore/collections';

const convertTimestampToISOString = (timestamp: Timestamp | string | null | undefined): string => {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
};

export const getDeals = async (): Promise<Deal[]> => {
  try {
    const snapshot = await getDocs(dealsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToISOString(doc.data().createdAt as Timestamp),
      updatedAt: convertTimestampToISOString(doc.data().updatedAt as Timestamp),
      expectedCloseDate: convertTimestampToISOString(doc.data().expectedCloseDate as Timestamp),
    } as Deal));
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};

const createDeal = async (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> => {
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

    const docData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...docData,
      createdAt: convertTimestampToISOString(docData.createdAt as Timestamp),
      updatedAt: convertTimestampToISOString(docData.updatedAt as Timestamp),
      expectedCloseDate: convertTimestampToISOString(docData.expectedCloseDate as Timestamp),
    } as Deal;
  } catch (error) {
    console.error('Error updating deal stage:', error);
    throw error;
  }
};

const getDealById = async (id: string): Promise<Deal | null> => {
  try {
    const snapshot = await getDocs(query(collection(db, 'deals'), where('id', '==', id)));
    if (snapshot.empty) {
      return null;
    }

    const docData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...docData,
      createdAt: convertTimestampToISOString(docData.createdAt as Timestamp),
      updatedAt: convertTimestampToISOString(docData.updatedAt as Timestamp),
      expectedCloseDate: convertTimestampToISOString(docData.expectedCloseDate as Timestamp),
    } as Deal;
  } catch (error) {
    console.error('Error fetching deal:', error);
    throw error;
  }
};