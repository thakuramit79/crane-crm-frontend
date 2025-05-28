import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';
import { Lead } from '../../types/lead';
import { getCustomers, getContactsByCustomer } from '../../services/firestore/customerService';
import { createDeal } from '../../services/firestore/dealService';

interface ConvertToDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess: () => void;
}

export function ConvertToDealModal({ isOpen, onClose, lead, onSuccess }: ConvertToDealModalProps) {
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean | null>(null);
  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: lead.customerName || '',
    email: '',
    phone: '',
    address: '',
  });

  const [newContactForm, setNewContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  const [dealForm, setDealForm] = useState({
    title: `${lead.customerName} - ${lead.serviceNeeded}`,
    stage: 'qualification',
    value: '',
    expectedCloseDate: '',
    notes: lead.notes || '',
  });

  useEffect(() => {
    if (isExistingCustomer) {
      fetchCustomers();
    }
  }, [isExistingCustomer]);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchContacts(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchContacts = async (customerId: string) => {
    try {
      const data = await getContactsByCustomer(customerId);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleCreateDeal = async () => {
    try {
      setIsLoading(true);

      let customerId = selectedCustomerId;
      let contactId = selectedContactId;
      let customerData = null;
      let contactData = null;

      if (!isExistingCustomer) {
        // Create new customer
        const newCustomer = await createCustomer(newCustomerForm);
        customerId = newCustomer.id;
        customerData = newCustomer;

        // Create new contact
        const newContact = await createContact({
          ...newContactForm,
          customerId: newCustomer.id,
        });
        contactId = newContact.id;
        contactData = newContact;
      } else {
        customerData = customers.find(c => c.id === customerId);
        contactData = contacts.find(c => c.id === contactId);
      }

      // Create deal
      await createDeal({
        title: dealForm.title,
        leadId: lead.id,
        customerId,
        contactId,
        stage: dealForm.stage,
        value: parseFloat(dealForm.value),
        expectedCloseDate: dealForm.expectedCloseDate,
        notes: dealForm.notes,
        customer: {
          name: customerData.name,
          email: customerData.email,
        },
        contact: {
          name: contactData.name,
          email: contactData.email,
          role: contactData.role,
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating deal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExistingCustomer && isExistingCustomer !== null) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Customer & Deal"
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Customer Information</h3>
            <Input
              label="Company Name"
              value={newCustomerForm.name}
              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Company Email"
              type="email"
              value={newCustomerForm.email}
              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              label="Company Phone"
              value={newCustomerForm.phone}
              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
            <Input
              label="Address"
              value={newCustomerForm.address}
              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Primary Contact</h3>
            <Input
              label="Contact Name"
              value={newContactForm.name}
              onChange={(e) => setNewContactForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Contact Email"
              type="email"
              value={newContactForm.email}
              onChange={(e) => setNewContactForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              label="Contact Phone"
              value={newContactForm.phone}
              onChange={(e) => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
            <Input
              label="Role"
              value={newContactForm.role}
              onChange={(e) => setNewContactForm(prev => ({ ...prev, role: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Deal Information</h3>
            <Input
              label="Deal Title"
              value={dealForm.title}
              onChange={(e) => setDealForm(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Input
              label="Deal Value"
              type="number"
              value={dealForm.value}
              onChange={(e) => setDealForm(prev => ({ ...prev, value: e.target.value }))}
              required
            />
            <Input
              label="Expected Close Date"
              type="date"
              value={dealForm.expectedCloseDate}
              onChange={(e) => setDealForm(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
              required
            />
            <TextArea
              label="Notes"
              value={dealForm.notes}
              onChange={(e) => setDealForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDeal}
              isLoading={isLoading}
            >
              Create Deal
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (isExistingCustomer) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Convert to Deal"
        size="lg"
      >
        <div className="space-y-6">
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

          {selectedCustomerId && (
            <Select
              label="Select Contact"
              options={contacts.map(contact => ({
                value: contact.id,
                label: `${contact.name} (${contact.role})`,
              }))}
              value={selectedContactId}
              onChange={setSelectedContactId}
              required
            />
          )}

          {selectedCustomerId && selectedContactId && (
            <div className="space-y-4">
              <Input
                label="Deal Title"
                value={dealForm.title}
                onChange={(e) => setDealForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Input
                label="Deal Value"
                type="number"
                value={dealForm.value}
                onChange={(e) => setDealForm(prev => ({ ...prev, value: e.target.value }))}
                required
              />
              <Input
                label="Expected Close Date"
                type="date"
                value={dealForm.expectedCloseDate}
                onChange={(e) => setDealForm(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                required
              />
              <TextArea
                label="Notes"
                value={dealForm.notes}
                onChange={(e) => setDealForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDeal}
              isLoading={isLoading}
              disabled={!selectedCustomerId || !selectedContactId}
            >
              Create Deal
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Lead to Deal"
      size="sm"
    >
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
    </Modal>
  );
}