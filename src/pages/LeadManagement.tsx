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
  Users,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { TextArea } from '../components/common/TextArea';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Toast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { Lead, LeadStatus } from '../types/lead';
import { getLeads, createLead, updateLeadStatus } from '../services/firestore/leadService';
import { createCustomer } from '../services/firestore/customerService';
import { createDeal } from '../services/firestore/dealService';

const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_process', label: 'In Process' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export function LeadManagement() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning';
  }>({ show: false, title: '' });

  const [formData, setFormData] = useState({
    customerName: '',
    serviceNeeded: '',
    siteLocation: '',
    notes: '',
  });

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [dealForm, setDealForm] = useState({
    title: '',
    value: '',
    expectedCloseDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

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

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) throw new Error('No user found');

      const newLead = await createLead({
        customerName: formData.customerName,
        serviceNeeded: formData.serviceNeeded,
        siteLocation: formData.siteLocation,
        status: 'new',
        assignedTo: user.id,
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

  const handleConvertToDeal = async () => {
    if (!selectedLead || !user) return;

    try {
      let customerId: string;
      
      if (!isExistingCustomer) {
        // Create new customer
        const newCustomer = await createCustomer(newCustomerForm);
        customerId = newCustomer.id;
      } else {
        // Use existing customer ID
        customerId = 'existing-customer-id'; // Replace with actual selection
      }

      // Create deal
      const deal = await createDeal({
        title: dealForm.title,
        leadId: selectedLead.id,
        customerId,
        contactId: 'primary-contact-id', // Replace with actual contact selection or creation
        stage: 'qualification',
        value: parseFloat(dealForm.value),
        expectedCloseDate: dealForm.expectedCloseDate,
        notes: dealForm.notes,
        customer: {
          name: isExistingCustomer ? 'Existing Customer' : newCustomerForm.name,
          email: isExistingCustomer ? 'existing@email.com' : newCustomerForm.email,
        },
        contact: {
          name: 'Primary Contact',
          email: 'contact@email.com',
          role: 'Primary',
        },
      });

      setIsConvertModalOpen(false);
      showToast('Lead converted to deal successfully', 'success');
    } catch (error) {
      console.error('Error converting lead to deal:', error);
      showToast('Error converting lead to deal', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      serviceNeeded: '',
      siteLocation: '',
      notes: '',
    });
    setNewCustomerForm({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setDealForm({
      title: '',
      value: '',
      expectedCloseDate: '',
      notes: '',
    });
    setSelectedLead(null);
    setIsExistingCustomer(null);
  };

  const showToast = (
    title: string,
    variant: 'success' | 'error' | 'warning' = 'success'
  ) => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.siteLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user || (user.role !== 'sales_agent' && user.role !== 'admin')) {
    return (
      <div className="p-4 text-center text-gray-500">
        You don't have permission to access this page.
      </div>
    );
  }

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
            className="w-40"
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
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No leads found. Create a new lead to get started.
            </div>
          ) : (
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
                  {filteredLeads.map((lead) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsConvertModalOpen(true);
                          }}
                        >
                          <ArrowRight size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Lead Modal */}
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
          <Input
            label="Customer Name"
            value={formData.customerName}
            onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
            required
          />
          
          <Input
            label="Service Needed"
            value={formData.serviceNeeded}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceNeeded: e.target.value }))}
            required
          />
          
          <Input
            label="Site Location"
            value={formData.siteLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, siteLocation: e.target.value }))}
            required
          />
          
          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
          />
          
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

      {/* Convert to Deal Modal */}
      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          resetForm();
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
                options={[
                  { value: '1', label: 'Sample Customer 1' },
                  { value: '2', label: 'Sample Customer 2' },
                ]}
                value=""
                onChange={() => {}}
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={newCustomerForm.name}
                onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={newCustomerForm.email}
                onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <Input
                label="Phone"
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
          )}

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-medium">Deal Information</h3>
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
              onClick={() => {
                setIsConvertModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConvertToDeal}>
              Create Deal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
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

export default LeadManagement;