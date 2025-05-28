import React, { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  User,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuthStore } from '../store/authStore';
import { Deal, DealStage } from '../types/deal';
import { getDeals, updateDealStage } from '../services/dealService';

const STAGE_OPTIONS = [
  { value: 'all', label: 'All Stages' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const getStageBadgeVariant = (stage: DealStage) => {
  switch (stage) {
    case 'qualification':
      return 'default';
    case 'proposal':
      return 'secondary';
    case 'negotiation':
      return 'warning';
    case 'won':
      return 'success';
    case 'lost':
      return 'error';
    default:
      return 'default';
  }
};

export function Deals() {
  const { user } = useAuthStore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<DealStage | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchTerm, stageFilter]);

  const fetchDeals = async () => {
    try {
      const data = await getDeals();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDeals = () => {
    let filtered = [...deals];

    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(deal => deal.stage === stageFilter);
    }

    setFilteredDeals(filtered);
  };

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      const updatedDeal = await updateDealStage(dealId, newStage);
      if (updatedDeal) {
        setDeals(prev =>
          prev.map(deal =>
            deal.id === dealId ? updatedDeal : deal
          )
        );
      }
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            options={STAGE_OPTIONS}
            value={stageFilter}
            onChange={(value) => setStageFilter(value as DealStage | 'all')}
            className="w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading deals...</div>
        ) : filteredDeals.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No deals found matching your criteria.
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <Card key={deal.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{deal.title}</h3>
                    <Badge variant={getStageBadgeVariant(deal.stage)}>
                      {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                    </Badge>
                  </div>
                  <Select
                    value={deal.stage}
                    onChange={(value) => handleStageChange(deal.id, value as DealStage)}
                    options={STAGE_OPTIONS.filter(option => option.value !== 'all')}
                    className="w-32"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{deal.customer.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <div>
                      <span>{deal.contact.name}</span>
                      <span className="text-gray-400 text-sm ml-1">
                        ({deal.contact.role})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">
                      {formatCurrency(deal.value)}
                    </span>
                    {deal.stage === 'won' ? (
                      <ArrowUpRight className="h-4 w-4 text-success-500" />
                    ) : deal.stage === 'lost' ? (
                      <ArrowDownRight className="h-4 w-4 text-error-500" />
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Expected: {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                {deal.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">{deal.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}