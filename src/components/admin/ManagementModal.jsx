import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

export default function ManagementModal({ 
  open, 
  onClose, 
  title, 
  item, 
  fields,
  onSave,
  isLoading
}) {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setData(item);
    } else {
      const initial = {};
      fields.forEach(f => {
        initial[f.name] = f.defaultValue ?? '';
      });
      setData(initial);
    }
  }, [item, fields, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name, value) => {
    setData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label className="text-sm">{field.label}</Label>
              {field.type === 'select' ? (
                <Select value={data[field.name] || ''} onValueChange={(v) => handleChange(field.name, v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  value={data[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={2}
                  className="text-sm h-16"
                />
              ) : field.type === 'number' ? (
                <Input
                  type="number"
                  value={data[field.name] ?? ''}
                  onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || '')}
                  placeholder={field.placeholder}
                  className="h-8 text-sm"
                />
              ) : (
                <Input
                  type={field.type || 'text'}
                  value={data[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-8 text-sm"
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} size="sm" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || isLoading}
              className="flex-1 bg-[#D50000] hover:bg-[#B00000]"
              size="sm"
            >
              {saving ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</> : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}