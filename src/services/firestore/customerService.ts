import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
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

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  try {
    const customerRef = doc(db, 'customers', id);
    await updateDoc(customerRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return {
      id,
      ...updates,
    } as Customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const customerRef = doc(db, 'customers', id);
    await deleteDoc(customerRef);
  } catch (error) {
    console.error('Error deleting customer:', error);
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

export const updateContact = async (id: string, updates: Partial<Contact>): Promise<Contact> => {
  try {
    const contactRef = doc(db, 'contacts', id);
    await updateDoc(contactRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return {
      id,
      ...updates,
    } as Contact;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  try {
    const contactRef = doc(db, 'contacts', id);
    await deleteDoc(contactRef);
  } catch (error) {
    console.error('Error deleting contact:', error);
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