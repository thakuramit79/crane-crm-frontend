import { Deal, DealStage } from '../types/deal';
import { MOCK_CUSTOMERS } from './leadService';

const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    title: 'Tower Crane Project',
    leadId: '3',
    customerId: '1',
    contactId: '1',
    stage: 'negotiation',
    value: 250000,
    expectedCloseDate: '2024-03-15',
    notes: 'Client interested in long-term contract',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    customer: {
      name: 'Acme Construction',
      email: 'info@acme.com',
    },
    contact: {
      name: 'John Smith',
      email: 'john@acme.com',
      role: 'Project Manager',
    },
  },
  {
    id: '2',
    title: 'Mobile Crane Services',
    leadId: '2',
    customerId: '2',
    contactId: '2',
    stage: 'proposal',
    value: 150000,
    expectedCloseDate: '2024-02-28',
    notes: 'Pending final quote approval',
    createdAt: '2024-01-05T11:20:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    customer: {
      name: 'Metro Developers',
      email: 'contact@metro.com',
    },
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah@metro.com',
      role: 'Operations Director',
    },
  },
];

export const getDeals = async (): Promise<Deal[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_DEALS];
};

export const getDealById = async (id: string): Promise<Deal | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const deal = MOCK_DEALS.find(d => d.id === id);
  return deal ? { ...deal } : null;
};

export const createDeal = async (
  dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Deal> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newDeal: Deal = {
    ...dealData,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  MOCK_DEALS.push(newDeal);
  return { ...newDeal };
};

export const updateDealStage = async (
  id: string,
  stage: DealStage
): Promise<Deal | null> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const index = MOCK_DEALS.findIndex(d => d.id === id);
  if (index === -1) return null;
  
  MOCK_DEALS[index] = {
    ...MOCK_DEALS[index],
    stage,
    updatedAt: new Date().toISOString(),
  };
  
  return { ...MOCK_DEALS[index] };
};