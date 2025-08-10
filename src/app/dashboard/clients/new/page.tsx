'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/queries';
import { ClientForm } from '@/features/clients/components/client-form';
import type { ClientFormData } from '@/types/client';

export default function NewClientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: ClientFormData) => {
    try {
      // Convert ClientFormData to Client creation format
      const createData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        address: data.address,
        status: 'active' as const
      };

      const newClient = await createClient(createData);
      
      toast({
        title: 'Client Created',
        description: 'New client has been added successfully',
      });
      
      // Navigate to the new client's detail page
      router.push(`/dashboard/clients/${newClient.id}`);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error; // Let ClientForm handle the error display
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/clients');
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          onClick={() => router.push('/dashboard/clients')}
          variant="ghost"
          size="sm"
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
        <h1 className="text-3xl font-bold">Add New Client</h1>
        <p className="text-muted-foreground">Create a new client profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Enter the client's details. Name and email are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
