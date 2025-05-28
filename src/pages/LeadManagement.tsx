import React, { useState } from 'react';
import { updateLeadStatus } from '../services/leadService';
import { Toast, showToast } from '../components/common/Toast';
import { ConvertToDealModal } from '../components/leads/ConvertToDealModal';
import { LeadStatus } from '../types/lead';

export function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isConvertToDealModalOpen, setIsConvertToDealModalOpen] = useState(false);

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
          setIsConvertToDealModalOpen(true);
        }
        
        showToast('Lead status updated', 'success');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      showToast('Error updating lead status', 'error');
    }
  };

  return (
    <div>
      {/* Your existing JSX content here */}
      
      {selectedLead && (
        <ConvertToDealModal
          isOpen={isConvertToDealModalOpen}
          onClose={() => {
            setIsConvertToDealModalOpen(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          onSuccess={() => {
            showToast('Deal created successfully', 'success');
            setIsConvertToDealModalOpen(false);
            setSelectedLead(null);
          }}
        />
      )}

      <Toast title="" variant="default" />
    </div>
  );
}