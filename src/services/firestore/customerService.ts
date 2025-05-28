import { db } from '../../lib/firebase';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { Customer, Contact } from '../../types/lead';

const CUSTOMERS_COLLECTION = 'customers';
const CONTACTS_COLLECTION = 'contacts';

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, CUSTOMERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const createCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
  try {
    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...customerData,
      createdAt: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...customerData
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (
  customerId: string,
  customerData: Partial<Customer>
): Promise<Customer> => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await updateDoc(customerRef, {
      ...customerData,
      updatedAt: new Date().toISOString()
    });
    
    return {
      id: customerId,
      ...customerData
    } as Customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

export const getContactsByCustomer = async (customerId: string): Promise<Contact[]> => {
  try {
    const contactsQuery = query(
      collection(db, CONTACTS_COLLECTION),
      where('customerId', '==', customerId)
    );
    
    const querySnapshot = await getDocs(contactsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Contact[];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const createContact = async (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
  try {
    const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
      ...contactData,
      createdAt: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...contactData
    };
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
};

export const updateContact = async (
  contactId: string,
  contactData: Partial<Contact>
): Promise<Contact> => {
  try {
    const contactRef = doc(db, CONTACTS_COLLECTION, contactId);
    await updateDoc(contactRef, {
      ...contactData,
      updatedAt: new Date().toISOString()
    });
    
    return {
      id: contactId,
      ...contactData
    } as Contact;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CONTACTS_COLLECTION, contactId));
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};