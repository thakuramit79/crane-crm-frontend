import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Search, 
  Filter,
  Download,
  Send
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { QuotationForm } from '../components/quotation/QuotationForm';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { Lead } from '../types/lead';
import { getLeads } from '../services/firestore/leadService';
import { createQuotation, getQuotations } from '../services/firestore/quotationService';

export function QuotationManagement() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning';
  }>({ show: false, title: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsData, quotationsData] = await Promise.all([
        getLeads(),
        getQuotations()
      ]);
      
      setLeads(leadsData);
      setQuotations(quotationsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error fetching data', 'error');
    }
  };

  const handleCreateQuotation = async (values: any) => {
    if (!selectedLead) {
      showToast('Please select a lead first', 'error');
      return;
    }

    try {
      const quotation = await createQuotation({
        leadId: selectedLead.id,
        customerName: selectedLead.customerName,
        ...values,
        createdBy: user?.id || '',
      });

      setQuotations(prev => [...prev, quotation]);
      setIsCreateModalOpen(false);
      showToast('Quotation created successfully', 'success');
    } catch (error) {
      console.error('Error creating quotation:', error);
      showToast('Error creating quotation', 'error');
    }
  };

  const showToast = (
    title: string,
    variant: 'success' | 'error' | 'warning' = 'success'
  ) => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user || (user.role !== 'sales_agent' && user.role !== 'admin')) {
    return (
      <div className="p-4 text-center text-gray-500">
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Select
            label="Select Lead"
            options={leads.map(lead => ({
              value: lead.id,
              label: `${lead.customerName} - ${lead.serviceNeeded}`,
            }))}
            value={selectedLead?.id || ''}
            onChange={(value) => {
              const lead = leads.find(l => l.id === value);
              setSelectedLead(lead || null);
            }}
          />
        </div>
        
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedLead}
          leftIcon={<Calculator size={16} />}
        >
          New Quotation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading quotations...</div>
          ) : quotations.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No quotations found. Create a new quotation to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {quotations.map((quotation) => (
                <Card key={quotation.id} variant="bordered">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {quotation.customerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created on {new Date(quotation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {formatCurrency(quotation.total)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Order Type</p>
                        <p className="font-medium">{quotation.orderType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Machine Type</p>
                        <p className="font-medium">{quotation.machineType}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download size={16} />}
                        onClick={() => showToast('PDF downloaded', 'success')}
                      >
                        Export PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Send size={16} />}
                        onClick={() => showToast('Quote sent to customer', 'success')}
                      >
                        Send to Customer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Quotation"
        size="xl"
      >
        <QuotationForm onCalculate={handleCreateQuotation} />
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