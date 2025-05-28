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
import { Customer, Contact } from '../../types/lead';
import { customersCollection } from './collections';

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const snapshot = await getDocs(customersCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Customer));
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  try {
    const docRef = await addDoc(customersCollection, {
      ...customer,
      createdAt: serverTimestamp(),
    });

    return {
      ...customer,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const snapshot = await getDocs(query(collection(db, 'customers'), where('id', '==', id)));
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

export const createContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...contact,
      createdAt: serverTimestamp(),
    });

    return {
      ...contact,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
};

export const getContactsByCustomer = async (customerId: string): Promise<Contact[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'contacts'), where('customerId', '==', customerId))
    );
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Contact));
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};