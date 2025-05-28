import React from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DollarSign, Users, Calendar, ArrowRight } from 'lucide-react';

export function Deals() {
  const deals = [
    {
      id: 1,
      title: "Commercial Construction Project",
      client: "ABC Corporation",
      value: 250000,
      status: "In Progress",
      dueDate: "2024-03-15",
      team: ["John Doe", "Jane Smith", "Bob Wilson"]
    },
    {
      id: 2,
      title: "Residential Development",
      client: "XYZ Developers",
      value: 180000,
      status: "Pending",
      dueDate: "2024-04-01",
      team: ["Alice Johnson", "Mike Brown"]
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deals Overview</h1>
        <Button variant="primary">
          Create New Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                <Badge variant={deal.status === "In Progress" ? "success" : "warning"}>
                  {deal.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>${deal.value.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{deal.client}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{new Date(deal.dueDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex -space-x-2">
                  {deal.team.map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center"
                      title={member}
                    >
                      <span className="text-xs font-medium">
                        {member.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button variant="text" className="w-full justify-between">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Deals;