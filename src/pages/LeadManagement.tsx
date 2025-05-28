import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  MapPin,
  Phone,
  Mail,
  Upload,
  Trash2,
  Building2,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { TextArea } from '../components/common/TextArea';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Toast } from '../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { Lead, LeadStatus, Customer, Contact, Deal, DealStatus } from '../types/lead';
import { getLeads, createLead, updateLeadStatus } from '../services/firestore/leadService';
import { getCustomers, getContactsByCustomer, createCustomer, createContact } from '../services/firestore/customerService';
import { createDeal } from '../services/firestore/dealService';

// ... (keep all the existing constants)

export function LeadManagement() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contacts, setContacts] = useState<Record<string, Contact[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ... (keep all the existing form states)

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerContacts(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const fetchData = async () => {
    try {
      const [leadsData, customersData] = await Promise.all([
        getLeads(),
        getCustomers()
      ]);
      setLeads(leadsData);
      setCustomers(customersData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error fetching data', 'error');
    }
  };

  const fetchCustomerContacts = async (customerId: string) => {
    try {
      const customerContacts = await getContactsByCustomer(customerId);
      setContacts(prev => ({
        ...prev,
        [customerId]: customerContacts
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showToast('Error fetching contacts', 'error');
    }
  };

  // ... (keep all the existing filter and pagination functions)

  const handleConvertToDeal = async () => {
    if (!selectedLead) return;

    try {
      let customerId = selectedCustomerId;
      let contactId: string;
      let customerData: Customer;

      if (!isExistingCustomer) {
        // Create new customer
        customerData = await createCustomer({
          name: newCustomerForm.name,
          email: newCustomerForm.email,
          phone: newCustomerForm.phone,
          address: newCustomerForm.address,
        });
        customerId = customerData.id;

        // Create new contact
        const contactData = await createContact({
          customerId: customerData.id,
          name: newContactForm.name,
          email: newContactForm.email,
          phone: newContactForm.phone,
          role: newContactForm.role,
        });
        contactId = contactData.id;
      } else {
        contactId = selectedContactId;
        customerData = customers.find(c => c.id === customerId)!;
      }

      const contact = isExistingCustomer 
        ? contacts[customerId]?.find(c => c.id === contactId)
        : {
            name: newContactForm.name,
            email: newContactForm.email,
            role: newContactForm.role,
          };

      // Create deal
      const dealData = {
        title: `${customerData.name} - ${selectedLead.serviceNeeded}`,
        leadId: selectedLead.id,
        customerId,
        contactId,
        stage: dealForm.status,
        value: parseFloat(dealForm.value),
        expectedCloseDate: dealForm.expectedCloseDate,
        notes: dealForm.notes,
        customer: {
          name: customerData.name,
          email: customerData.email,
        },
        contact: {
          name: contact!.name,
          email: contact!.email,
          role: contact!.role,
        },
      };

      await createDeal(dealData);
      
      // Update lead status if not already won
      if (selectedLead.status !== 'won') {
        await updateLeadStatus(selectedLead.id, 'won');
        setLeads(prev => 
          prev.map(lead => 
            lead.id === selectedLead.id 
              ? { ...lead, status: 'won' } 
              : lead
          )
        );
      }

      setIsConvertModalOpen(false);
      resetConversionForms();
      showToast('Deal created successfully', 'success');
      navigate('/deals');
    } catch (error) {
      console.error('Error creating deal:', error);
      showToast('Error creating deal', 'error');
    }
  };

  // ... (keep all the existing helper functions)

  return (
    // ... (keep the existing JSX structure, but update the customer selection part in the convert modal)
    <Modal
      isOpen={isConvertModalOpen}
      onClose={() => {
        setIsConvertModalOpen(false);
        resetConversionForms();
      }}
      title="Convert Lead to Deal"
      size="lg"
    >
      <div className="space-y-6">
        {isExistingCustomer === null ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Is this for an existing customer?</h3>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setIsExistingCustomer(true)}
              >
                Yes, Existing Customer
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsExistingCustomer(false)}
              >
                No, New Customer
              </Button>
            </div>
          </div>
        ) : isExistingCustomer ? (
          <div className="space-y-4">
            <Select
              label="Select Customer"
              options={customers.map(customer => ({
                value: customer.id,
                label: customer.name,
              }))}
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              required
            />

            {selectedCustomerId && contacts[selectedCustomerId] && (
              <Select
                label="Select Contact"
                options={contacts[selectedCustomerId].map(contact => ({
                  value: contact.id,
                  label: contact.name,
                }))}
                value={selectedContactId}
                onChange={setSelectedContactId}
                required
              />
            )}
          </div>
        ) : (
          // ... (keep the rest of the modal content)
        )}
      </div>
    </Modal>
    // ... (keep the rest of the component JSX)
  );
}