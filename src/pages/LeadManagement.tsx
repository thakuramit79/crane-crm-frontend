import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';

export function LeadManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Lead
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4 p-4">
          <div className="flex-1">
            <Input
              placeholder="Search leads..."
              icon={<Search className="w-4 h-4 text-gray-400" />}
              className="w-full"
            />
          </div>
          <Select
            placeholder="Status"
            options={[
              { value: 'new', label: 'New' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'unqualified', label: 'Unqualified' },
            ]}
            className="w-48"
          />
          <Button variant="secondary" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </Card>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Example row - you would map through your leads data here */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">John Smith</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Acme Corp</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">john@acme.com</div>
                  <div className="text-sm text-gray-500">+1 234 567 8900</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status="active" text="New" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Website</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">2024-01-15</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeadManagement;