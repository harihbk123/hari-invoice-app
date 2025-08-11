// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSettings, useUpdateSettings } from '@/features/settings/hooks/use-settings';
import { Settings, User, CreditCard, Bell } from 'lucide-react';

interface SettingsFormData {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  default_currency: string;
  tax_rate: number;
  invoice_terms: string;
  profile_name: string;
  profile_email: string;
  profile_phone: string;
  profile_address: string;
  profile_gstin: string;
  bank_account_name: string;
  bank_name: string;
  bank_account: string;
  bank_branch: string;
  bank_ifsc: string;
  bank_swift: string;
  account_type: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState<SettingsFormData>({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    default_currency: 'USD',
    tax_rate: 0,
    invoice_terms: '',
    profile_name: '',
    profile_email: '',
    profile_phone: '',
    profile_address: '',
    profile_gstin: '',
    bank_account_name: '',
    bank_name: '',
    bank_account: '',
    bank_branch: '',
    bank_ifsc: '',
    bank_swift: '',
    account_type: 'Current Account',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fix: Use useEffect instead of useState for updating form data
  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        default_currency: settings.default_currency || 'USD',
        tax_rate: settings.tax_rate || 0,
        invoice_terms: settings.invoice_terms || '',
        profile_name: settings.profile_name || '',
        profile_email: settings.profile_email || '',
        profile_phone: settings.profile_phone || '',
        profile_address: settings.profile_address || '',
        profile_gstin: settings.profile_gstin || '',
        bank_account_name: settings.bank_account_name || '',
        bank_name: settings.bank_name || '',
        bank_account: settings.bank_account || '',
        bank_branch: settings.bank_branch || '',
        bank_ifsc: settings.bank_ifsc || '',
        bank_swift: settings.bank_swift || '',
        account_type: settings.account_type || 'Current Account',
      });
    }
  }, [settings]);

  const handleInputChange = (field: keyof SettingsFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'tax_rate' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (!formData.company_email.trim()) {
      newErrors.company_email = 'Company email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.company_email)) {
      newErrors.company_email = 'Invalid email address';
    }

    if (formData.tax_rate < 0 || formData.tax_rate > 100) {
      newErrors.tax_rate = 'Tax rate must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await updateSettings.mutateAsync(formData);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">
            <Settings className="mr-2 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="banking">
            <CreditCard className="mr-2 h-4 w-4" />
            Banking
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <Input
                      value={formData.company_name}
                      onChange={handleInputChange('company_name')}
                      placeholder="Your Company Name"
                    />
                    <FormMessage>{errors.company_name}</FormMessage>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Company Email *</FormLabel>
                    <Input
                      type="email"
                      value={formData.company_email}
                      onChange={handleInputChange('company_email')}
                      placeholder="company@example.com"
                    />
                    <FormMessage>{errors.company_email}</FormMessage>
                  </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      value={formData.company_phone}
                      onChange={handleInputChange('company_phone')}
                      placeholder="+1 (555) 123-4567"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <select
                      value={formData.default_currency}
                      onChange={(e) => setFormData(prev => ({...prev, default_currency: e.target.value}))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </select>
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Company Address</FormLabel>
                  <textarea
                    value={formData.company_address}
                    onChange={handleInputChange('company_address')}
                    placeholder="Full company address"
                    className="w-full p-2 border rounded-md min-h-[80px]"
                  />
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.tax_rate}
                      onChange={handleInputChange('tax_rate')}
                      placeholder="0.00"
                    />
                    <FormMessage>{errors.tax_rate}</FormMessage>
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Invoice Terms</FormLabel>
                  <textarea
                    value={formData.invoice_terms}
                    onChange={handleInputChange('invoice_terms')}
                    placeholder="Payment terms and conditions"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                  />
                </FormItem>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      value={formData.profile_name}
                      onChange={handleInputChange('profile_name')}
                      placeholder="Your full name"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={formData.profile_email}
                      onChange={handleInputChange('profile_email')}
                      placeholder="your@email.com"
                    />
                  </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={formData.profile_phone}
                      onChange={handleInputChange('profile_phone')}
                      placeholder="+1 (555) 123-4567"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <Input
                      value={formData.profile_gstin}
                      onChange={handleInputChange('profile_gstin')}
                      placeholder="GST Identification Number"
                    />
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <textarea
                    value={formData.profile_address}
                    onChange={handleInputChange('profile_address')}
                    placeholder="Your full address"
                    className="w-full p-2 border rounded-md min-h-[80px]"
                  />
                </FormItem>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <Input
                      value={formData.bank_account_name}
                      onChange={handleInputChange('bank_account_name')}
                      placeholder="Account holder name"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <Input
                      value={formData.bank_name}
                      onChange={handleInputChange('bank_name')}
                      placeholder="Name of your bank"
                    />
                  </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <Input
                      value={formData.bank_account}
                      onChange={handleInputChange('bank_account')}
                      placeholder="Your account number"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <select
                      value={formData.account_type}
                      onChange={(e) => setFormData(prev => ({...prev, account_type: e.target.value}))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Current Account">Current Account</option>
                      <option value="Savings Account">Savings Account</option>
                      <option value="Business Account">Business Account</option>
                    </select>
                  </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <Input
                      value={formData.bank_branch}
                      onChange={handleInputChange('bank_branch')}
                      placeholder="Bank branch name"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <Input
                      value={formData.bank_ifsc}
                      onChange={handleInputChange('bank_ifsc')}
                      placeholder="IFSC code"
                    />
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>SWIFT Code</FormLabel>
                  <Input
                    value={formData.bank_swift}
                    onChange={handleInputChange('bank_swift')}
                    placeholder="SWIFT/BIC code (for international)"
                  />
                </FormItem>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateSettings.isPending}
              className="min-w-[100px]"
            >
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
