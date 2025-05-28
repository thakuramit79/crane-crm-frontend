export type LeadStatus = 'new' | 'in_process' | 'qualified' | 'unqualified' | 'won' | 'lost';

export type DealStatus = 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Contact {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Deal {
  id: string;
  leadId: string;
  customerId: string;
  contactId: string;
  status: DealStatus;
  value: number;
  expectedCloseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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