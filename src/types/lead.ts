export type LeadStatus = 'new' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  customerName: string;
  serviceNeeded: string;
  siteLocation: string;
  status: LeadStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  files?: string[];
  notes?: string;
}