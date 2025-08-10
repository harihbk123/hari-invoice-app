// src/features/invoices/components/line-items-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Define LineItem interface directly in this file to avoid import issues
interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface LineItemsFormProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  taxRate: number;
}

export function LineItemsForm({ items, onChange, taxRate }: LineItemsFormProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(items);

  useEffect(() => {
    setLineItems(items);
  }, [items]);

  const handleAddItem = () => {
    const newItem: LineItem = {
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    const updatedItems = [...lineItems, newItem];
    setLineItems(updatedItems);
    onChange(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    onChange(updatedItems);
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(updatedItems[index].quantity.toString()) || 0;
      const rate = parseFloat(updatedItems[index].rate.toString()) || 0;
      updatedItems[index].amount = quantity * rate;
    }

    setLineItems(updatedItems);
    onChange(updatedItems);
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Line Items</Label>
        <Button type="button" onClick={handleAddItem} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {lineItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No items added yet</p>
          <Button type="button" onClick={handleAddItem} variant="outline" className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 p-3 border rounded-lg">
              <div className="col-span-5">
                <Label className="text-xs">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Item description"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label className="text-xs">Rate</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label className="text-xs">Amount</Label>
                <Input
                  value={formatCurrency(item.amount)}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              
              <div className="col-span-1 flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals Summary */}
      {lineItems.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({taxRate}%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
