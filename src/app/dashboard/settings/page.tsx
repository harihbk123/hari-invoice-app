'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Building, 
  Save
} from 'lucide-react';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

interface CompanyInfo {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  taxId: string;
}

interface InvoiceSettings {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultDueDays: number;
  currency: string;
  taxRate: number;
  defaultPaymentTerms: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    taxId: '',
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1,
    defaultDueDays: 30,
    currency: 'USD',
    taxRate: 0,
    defaultPaymentTerms: '',
  });

  const handlePersonalInfoChange = (field: keyof PersonalInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleCompanyInfoChange = (field: keyof CompanyInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleInvoiceSettingsChange = (field: keyof InvoiceSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'nextInvoiceNumber' || field === 'defaultDueDays' || field === 'taxRate' 
      ? parseFloat(e.target.value) || 0 
      : e.target.value;
    
    setInvoiceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePersonalInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Here you would save to your database
      // await savePersonalInfo(personalInfo);
      
      toast({
        title: 'Personal Information Updated',
        description: 'Your personal information has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update personal information.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompanyInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Here you would save to your database
      // await saveCompanyInfo(companyInfo);
      
      toast({
        title: 'Company Information Updated',
        description: 'Your company information has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company information.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvoiceSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Here you would save to your database
      // await saveInvoiceSettings(invoiceSettings);
      
      toast({
        title: 'Invoice Settings Updated',
        description: 'Your invoice settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalInfoSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange('name')}
                      placeholder="Enter your full name"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      type="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange('email')}
                      placeholder="Enter your email"
                    />
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={handlePersonalInfoChange('phone')}
                    placeholder="Enter your phone number"
                  />
                </FormItem>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details for invoices and business documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanyInfoSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      value={companyInfo.companyName}
                      onChange={handleCompanyInfoChange('companyName')}
                      placeholder="Enter company name"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Company Email</FormLabel>
                    <Input
                      type="email"
                      value={companyInfo.companyEmail}
                      onChange={handleCompanyInfoChange('companyEmail')}
                      placeholder="Enter company email"
                    />
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Company Address</FormLabel>
                  <Input
                    value={companyInfo.companyAddress}
                    onChange={handleCompanyInfoChange('companyAddress')}
                    placeholder="Enter full address"
                  />
                </FormItem>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormItem>
                    <FormLabel>Company Phone</FormLabel>
                    <Input
                      type="tel"
                      value={companyInfo.companyPhone}
                      onChange={handleCompanyInfoChange('companyPhone')}
                      placeholder="Enter company phone"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <Input
                      type="url"
                      value={companyInfo.companyWebsite}
                      onChange={handleCompanyInfoChange('companyWebsite')}
                      placeholder="https://example.com"
                    />
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <Input
                    value={companyInfo.taxId}
                    onChange={handleCompanyInfoChange('taxId')}
                    placeholder="Enter tax identification number"
                  />
                </FormItem>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>
                Configure default settings for your invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvoiceSettingsSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormItem>
                    <FormLabel>Invoice Prefix</FormLabel>
                    <Input
                      value={invoiceSettings.invoicePrefix}
                      onChange={handleInvoiceSettingsChange('invoicePrefix')}
                      placeholder="INV"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Next Invoice Number</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={invoiceSettings.nextInvoiceNumber}
                      onChange={handleInvoiceSettingsChange('nextInvoiceNumber')}
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Default Due Days</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      value={invoiceSettings.defaultDueDays}
                      onChange={handleInvoiceSettingsChange('defaultDueDays')}
                    />
                  </FormItem>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <select
                      value={invoiceSettings.currency}
                      onChange={(e) => setInvoiceSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={invoiceSettings.taxRate}
                      onChange={handleInvoiceSettingsChange('taxRate')}
                    />
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Default Payment Terms</FormLabel>
                  <Input
                    value={invoiceSettings.defaultPaymentTerms}
                    onChange={handleInvoiceSettingsChange('defaultPaymentTerms')}
                    placeholder="Net 30"
                  />
                </FormItem>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
