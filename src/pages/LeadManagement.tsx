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
import { Lead, LeadStatus, Customer, Contact } from '../types/lead';
import { getLeads, createLead, updateLeadStatus } from '../services/firestore/leadService';
import { getCustomers, getContactsByCustomer } from '../services/firestore/customerService';
import { useAuthStore } from '../store/authStore';

const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_process', label: 'In Process' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const ITEMS_PER_PAGE = 10;

export function LeadManagement() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning';
  }>({ show: false, title: '' });

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    serviceNeeded: '',
    siteLocation: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter]);

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
      if (!user) throw new Error('User not authenticated');

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
        showToast('Lead status updated', 'success');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      showToast('Error updating lead status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      serviceNeeded: '',
      siteLocation: '',
      notes: '',
    });
  };

  const showToast = (title: string, variant: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

      {/* View Lead Modal */}
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