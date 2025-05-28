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
import { Lead, LeadStatus } from '../../types/lead';
import { leadsCollection } from './collections';

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const snapshot = await getDocs(leadsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
    } as Lead));
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

export const createLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
  try {
    const docRef = await addDoc(leadsCollection, {
      ...lead,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...lead,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
};

export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<Lead | null> => {
  try {
    const leadRef = doc(db, 'leads', id);
    await updateDoc(leadRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    const updatedLead = await getLeadById(id);
    return updatedLead;
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
};

export const getLeadById = async (id: string): Promise<Lead | null> => {
  try {
    const leadRef = doc(db, 'leads', id);
    const snapshot = await getDocs(query(collection(db, 'leads'), where('id', '==', id)));
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
    } as Lead;
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }
};