// src/app/dashboard/invoices/new/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceForm } from '@/features/invoices/components/invoice-form';

export default function CreateInvoicePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for your client</p>
        </div>
      </div>
      
      {/* Form Component */}
      <div className="max-w-4xl">
        <InvoiceForm mode="create" />
      </div>
    </div>
  );
}
