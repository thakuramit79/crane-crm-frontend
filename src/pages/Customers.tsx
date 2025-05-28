import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { Customer, Contact } from '../types/lead';

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Acme Construction',
    email: 'info@acme.com',
    phone: '555-0123',
    address: '123 Builder St, New York',
  },
  {
    id: '2',
    name: 'Metro Developers',
    email: 'contact@metro.com',
    phone: '555-0456',
    address: '456 Developer Ave, Chicago',
  },
];

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    customerId: '1',
    name: 'John Smith',
    email: 'john@acme.com',
    phone: '555-0124',
    role: 'Project Manager',
  },
  {
    id: '2',
    customerId: '2',
    name: 'Sarah Johnson',
    email: 'sarah@metro.com',
    phone: '555-0457',
    role: 'Operations Director',
  },
];

export function Customers() {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning';
  }>({ show: false, title: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newCustomer: Customer = {
        id: selectedCustomer?.id || Math.random().toString(36).substring(2, 9),
        ...formData,
      };

      if (selectedCustomer) {
        setCustomers(prev =>
          prev.map(customer =>
            customer.id === selectedCustomer.id ? newCustomer : customer
          )
        );
        showToast('Customer updated successfully', 'success');
      } else {
        setCustomers(prev => [...prev, newCustomer]);
        showToast('Customer added successfully', 'success');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error saving customer', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setSelectedCustomer(null);
  };

  const showToast = (
    title: string,
    variant: 'success' | 'error' | 'warning' = 'success'
  ) => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={16} />}
        >
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const customerContacts = contacts.filter(
            contact => contact.customerId === customer.id
          );

          return (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{customer.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setFormData({
                          name: customer.name,
                          email: customer.email,
                          phone: customer.phone,
                          address: customer.address,
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCustomers(prev =>
                          prev.filter(c => c.id !== customer.id)
                        );
                        showToast('Customer deleted successfully', 'success');
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {customerContacts.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Contacts
                    </h4>
                    <div className="space-y-3">
                      {customerContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="bg-gray-50 rounded-lg p-3"
                        >
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {contact.role}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Company Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />

          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedCustomer ? 'Update' : 'Add'} Customer
            </Button>
          </div>
        </form>
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