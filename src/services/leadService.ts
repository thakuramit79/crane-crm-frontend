import { Lead, LeadStatus } from '../types/lead';

// Mock data
const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    customerName: 'Acme Construction',
    serviceNeeded: 'Tower Crane - 50m',
    siteLocation: '123 Construction Ave, New York',
    status: 'new',
    assignedTo: '1', // John Sales
    createdAt: '2023-10-01T10:00:00Z',
    updatedAt: '2023-10-01T10:00:00Z',
    notes: 'Client needs crane for a 3-month project starting in November.',
  },
  {
    id: '2',
    customerName: 'BuildRight Inc',
    serviceNeeded: 'Mobile Crane - 30 ton',
    siteLocation: '456 Builder St, Chicago',
    status: 'negotiation',
    assignedTo: '1', // John Sales
    createdAt: '2023-09-25T14:30:00Z',
    updatedAt: '2023-09-28T11:45:00Z',
    notes: 'Client comparing prices with competitors.',
  },
  {
    id: '3',
    customerName: 'Skyrise Developers',
    serviceNeeded: 'Tower Crane - 80m',
    siteLocation: '789 Highrise Blvd, Miami',
    status: 'won',
    assignedTo: '1', // John Sales
    createdAt: '2023-09-15T09:20:00Z',
    updatedAt: '2023-09-22T16:10:00Z',
    notes: 'Contract signed. Ready for scheduling.',
  },
  {
    id: '4',
    customerName: 'MetroBuilders LLC',
    serviceNeeded: 'Crawler Crane - 100 ton',
    siteLocation: '101 Metro Lane, Seattle',
    status: 'lost',
    assignedTo: '1', // John Sales
    createdAt: '2023-09-10T13:15:00Z',
    updatedAt: '2023-09-18T10:30:00Z',
    notes: 'Client went with competitor due to lower pricing.',
  },
  {
    id: '5',
    customerName: 'Harbor Construction',
    serviceNeeded: 'Mobile Crane - 50 ton',
    siteLocation: '202 Harbor Drive, San Francisco',
    status: 'new',
    assignedTo: '1', // John Sales
    createdAt: '2023-10-02T15:45:00Z',
    updatedAt: '2023-10-02T15:45:00Z',
    notes: 'New inquiry for port development project.',
  },
];

// Get all leads
export const getLeads = async (): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_LEADS];
};

// Get lead by ID
export const getLeadById = async (id: string): Promise<Lead | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const lead = MOCK_LEADS.find(l => l.id === id);
  return lead ? { ...lead } : null;
};

// Create lead
export const createLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newLead: Lead = {
    ...lead,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  MOCK_LEADS.push(newLead);
  return { ...newLead };
};

// Update lead
export const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const index = MOCK_LEADS.findIndex(l => l.id === id);
  if (index === -1) return null;
  
  MOCK_LEADS[index] = {
    ...MOCK_LEADS[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return { ...MOCK_LEADS[index] };
};

// Update lead status
export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<Lead | null> => {
  return updateLead(id, { status });
};

// Get leads by status
export const getLeadsByStatus = async (status: LeadStatus): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_LEADS.filter(l => l.status === status).map(lead => ({ ...lead }));
};