'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Client } from '@/types/client';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export function ClientForm({ client, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState<ClientFormData>({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    address: client?.address || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ClientFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: client ? 'Client updated successfully' : 'Client created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save client. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{client ? 'Edit Client' : 'Create New Client'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <Input
                placeholder="Enter client name"
                disabled={isLoading}
                value={formData.name}
                onChange={handleInputChange('name')}
              />
              <FormMessage>{errors.name}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Email *</FormLabel>
              <Input
                type="email"
                placeholder="Enter email address"
                disabled={isLoading}
                value={formData.email}
                onChange={handleInputChange('email')}
              />
              <FormMessage>{errors.email}</FormMessage>
            </FormItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <Input
                type="tel"
                placeholder="Enter phone number"
                disabled={isLoading}
                value={formData.phone}
                onChange={handleInputChange('phone')}
              />
              <FormMessage>{errors.phone}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Company</FormLabel>
              <Input
                placeholder="Enter company name"
                disabled={isLoading}
                value={formData.company}
                onChange={handleInputChange('company')}
              />
              <FormMessage>{errors.company}</FormMessage>
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>Address</FormLabel>
            <Input
              placeholder="Enter full address"
              disabled={isLoading}
              value={formData.address}
              onChange={handleInputChange('address')}
            />
            <FormMessage>{errors.address}</FormMessage>
          </FormItem>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
