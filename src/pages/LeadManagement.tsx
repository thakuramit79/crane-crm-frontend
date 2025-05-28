// Update the handleStatusChange function in LeadManagement.tsx
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

// Add state for convert to deal modal
const [isConvertToDealModalOpen, setIsConvertToDealModalOpen] = useState(false);

// Add the ConvertToDealModal component to the JSX
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