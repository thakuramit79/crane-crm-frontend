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
import { getCustomers, createCustomer, createContact, getContactsByCustomer } from '../services/firestore/customerService';
import { createDeal } from '../services/firestore/dealService';

const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_process', label: 'In Process' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const DEAL_STATUS_OPTIONS = [
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal/Quotation' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Acme Construction',
    email: 'info@acme.com',
    phone: '555-0123',
    address: '123 Builder St, New York',
  },
  {
    id: '2',
    name: 'Metro Developers',
    email: 'contact@metro.com',
    phone: '555-0456',
    address: '456 Developer Ave, Chicago',
  },
];

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    customerId: '1',
    name: 'John Smith',
    email: 'john@acme.com',
    phone: '555-0124',
    role: 'Project Manager',
  },
  {
    id: '2',
    customerId: '2',
    name: 'Sarah Johnson',
    email: 'sarah@metro.com',
    phone: '555-0457',
    role: 'Operations Director',
  },
];

const ITEMS_PER_PAGE = 10;

export function LeadManagement() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contacts, setContacts] = useState<Record<string, Contact[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error';
  }>({ show: false, title: '' });

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    serviceNeeded: '',
    siteLocation: '',
    notes: '',
    files: [] as File[],
  });

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
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
    status: 'qualification' as DealStatus,
    value: '',
    expectedCloseDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchLeads();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerContacts(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter]);

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('Error fetching leads', 'error');
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('Error fetching customers', 'error');
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

  const filterLeads = () => {
    let filtered = [...leads];
    
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.siteLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    setFilteredLeads(filtered);
    setCurrentPage(1);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newLead = await createLead({
        customerName: formData.customerName,
        serviceNeeded: formData.serviceNeeded,
        siteLocation: formData.siteLocation,
        status: 'new',
        assignedTo: '1',
        notes: formData.notes,
      });
      
      setLeads(prev => [...prev, newLead]);
      setIsCreateModalOpen(false);
      resetForm();
      showToast('Lead created successfully', 'success');
    } catch (error) {
      console.error('Error creating lead:', error);
      showToast('Error creating lead', 'error');
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const updatedLead = await updateLeadStatus(leadId, newStatus);
      if (updatedLead) {
        setLeads(prev => 
          prev.map(lead => 
            lead.id === leadId ? updatedLead : lead
          )
        );
        
        if (newStatus === 'won') {
          setSelectedLead(updatedLead);
          setIsConvertModalOpen(true);
        }
        
        showToast('Lead status updated', 'success');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      showToast('Error updating lead status', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      serviceNeeded: '',
      siteLocation: '',
      notes: '',
      files: [],
    });
  };

  const handleConvertToDeal = async () => {
    if (!selectedLead) return;

    try {
      let customerId = selectedCustomerId;
      let contactId: string;
      let customerData;

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
        customerData = customers.find(c => c.id === customerId);
      }

      if (!customerData) {
        throw new Error('Customer data not found');
      }

      const contact = isExistingCustomer 
        ? contacts[customerId]?.find(c => c.id === contactId)
        : {
            name: newContactForm.name,
            email: newContactForm.email,
            role: newContactForm.role,
          };

      if (!contact) {
        throw new Error('Contact data not found');
      }

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
          name: contact.name,
          email: contact.email,
          role: contact.role,
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

  const isCreateDealEnabled = () => {
    if (isExistingCustomer) {
      return selectedCustomerId && selectedContactId && dealForm.value && dealForm.expectedCloseDate;
    } else {
      return (
        newCustomerForm.name &&
        newCustomerForm.email &&
        newContactForm.name &&
        newContactForm.email &&
        dealForm.value &&
        dealForm.expectedCloseDate
      );
    }
  };

  const resetConversionForms = () => {
    setIsExistingCustomer(null);
    setSelectedCustomerId('');
    setSelectedContactId('');
    setNewCustomerForm({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setNewContactForm({
      name: '',
      email: '',
      phone: '',
      role: '',
    });
    setDealForm({
      status: 'qualification',
      value: '',
      expectedCloseDate: '',
      notes: '',
    });
  };

  const showToast = (title: string, variant: 'success' | 'error' = 'success') => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              ...LEAD_STATUS_OPTIONS
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as LeadStatus | 'all')}
            className="w-full sm:w-40"
          />
        </div>
        
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus size={16} />}
        >
          New Lead
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading leads...</div>
          ) : paginatedLeads.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No leads found. Create a new lead to get started.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {lead.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {lead.serviceNeeded}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {lead.siteLocation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select
                            options={LEAD_STATUS_OPTIONS}
                            value={lead.status}
                            onChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}
                            className="w-40"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsViewModalOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)} of{' '}
                    {filteredLeads.length} leads
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Lead"
        size="lg"
      >
        <form onSubmit={handleCreateLead} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
            
            <Select
              label="Service Needed"
              options={[
                { value: 'tower_crane', label: 'Tower Crane' },
                { value: 'mobile_crane', label: 'Mobile Crane' },
                { value: 'crawler_crane', label: 'Crawler Crane' },
              ]}
              value={formData.serviceNeeded}
              onChange={(value) => setFormData(prev => ({ ...prev, serviceNeeded: value }))}
              required
            />
            
            <div className="md:col-span-2">
              <Input
                label="Site Location"
                value={formData.siteLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, siteLocation: e.target.value }))}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <TextArea
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB each
                  </p>
                </div>
              </div>
              
              {formData.files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {formData.files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm text-gray-500">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Lead</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedLead(null);
        }}
        title="Lead Details"
        size="lg"
      >
        {selectedLead && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedLead.customerName}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Service Needed</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedLead.serviceNeeded}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedLead.siteLocation}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <div className="mt-1">
                  <Select
                    options={LEAD_STATUS_OPTIONS}
                    value={selectedLead.status}
                    onChange={(value) => handleStatusChange(selectedLead.id, value as LeadStatus)}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedLead.notes || 'No notes'}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedLead(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
                    label: `${contact.name} (${contact.role})`,
                  }))}
                  value={selectedContactId}
                  onChange={setSelectedContactId}
                  required
                />
              )}
            </div>
          ) : (
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
            </div>
          )}

          {(isExistingCustomer ? (selectedCustomerId && selectedContactId) : 
            (newCustomerForm.name && newContactForm.name)) && (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700">Deal Information</h3>
              <Select
                label="Deal Status"
                options={DEAL_STATUS_OPTIONS}
                value={dealForm.status}
                onChange={(value) => setDealForm(prev => ({ ...prev, status: value as DealStatus }))}
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

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsConvertModalOpen(false);
                resetConversionForms();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvertToDeal}
              disabled={!isCreateDealEnabled()}
            >
              Create Deal
            </Button>
          </div>
        </div>
      </Modal>

      {toast.show && (
        <Toast
          title={toast.title}
          variant={toast.variant}
          isVisible={toast.show}
          onClose={() => setToast({ show: false, title: '' })}
        />
      )}
    </div>
  );
}