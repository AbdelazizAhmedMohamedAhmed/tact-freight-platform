import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, AlertCircle, Info } from 'lucide-react';

const PACKAGE_TYPES = ['Carton', 'Pallet', 'Crate', 'Drum', 'Bag', 'Roll', 'Bundle', 'Spool', 'Pipe', 'Machinery', 'Other'];

const emptyLine = () => ({
  id: Date.now(),
  description: '',
  package_type: '',
  quantity: '',
  length_cm: '',
  width_cm: '',
  height_cm: '',
  weight_per_unit_kg: '',
  stackable: true,
});

function calcLine(line) {
  const qty = parseFloat(line.quantity) || 0;
  const l = parseFloat(line.length_cm) || 0;
  const w = parseFloat(line.width_cm) || 0;
  const h = parseFloat(line.height_cm) || 0;
  const wpu = parseFloat(line.weight_per_unit_kg) || 0;
  const vol = qty > 0 && l > 0 && w > 0 && h > 0 ? ((l * w * h) / 1_000_000) * qty : 0;
  const wgt = qty * wpu;
  return { vol: vol.toFixed(4), wgt: wgt.toFixed(2) };
}

export default function CargoLinesEditor({ lines, onChange, mode }) {
  const addLine = () => onChange([...lines, emptyLine()]);

  const updateLine = (id, field, value) => {
    onChange(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLine = (id) => onChange(lines.filter(l => l.id !== id));

  const totals = lines.reduce((acc, l) => {
    const c = calcLine(l);
    return { vol: acc.vol + parseFloat(c.vol), wgt: acc.wgt + parseFloat(c.wgt) };
  }, { vol: 0, wgt: 0 });

  // Air: chargeable weight = max(actual, volumetric)
  const volumetricWeightAir = totals.vol * 167; // 1 CBM = 167 kg for air
  const chargeableWeight = mode === 'air' ? Math.max(totals.wgt, volumetricWeightAir) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold">Cargo Lines</Label>
          <span className="text-xs text-[#D50000] font-medium bg-red-50 px-2 py-0.5 rounded-full">
            {mode === 'air' ? 'Required for accurate air rate' : 'Required for accurate LCL rate'}
          </span>
        </div>
        <Button type="button" size="sm" onClick={addLine} variant="outline" className="border-[#D50000] text-[#D50000] hover:bg-red-50">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Line
        </Button>
      </div>

      {lines.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Add at least one cargo line with package dimensions.</p>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'air' ? 'Dimensions determine volumetric / chargeable weight for air freight.' : 'Each line helps calculate exact CBM for LCL pricing.'}
          </p>
          <Button type="button" size="sm" onClick={addLine} className="mt-3 bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add First Line
          </Button>
        </div>
      )}

      {lines.map((line, idx) => {
        const { vol, wgt } = calcLine(line);
        return (
          <div key={line.id} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Line {idx + 1}</span>
              <button type="button" onClick={() => removeLine(line.id)} className="text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Description / Contents</Label>
                <Input
                  placeholder="e.g. Electronic components"
                  value={line.description}
                  onChange={e => updateLine(line.id, 'description', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Package Type</Label>
                <Select value={line.package_type} onValueChange={v => updateLine(line.id, 'package_type', v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PACKAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Qty (pcs)</Label>
                <Input type="number" min="1" placeholder="0" value={line.quantity} onChange={e => updateLine(line.id, 'quantity', e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Wt/unit (kg)</Label>
                <Input type="number" min="0" step="0.01" placeholder="0" value={line.weight_per_unit_kg} onChange={e => updateLine(line.id, 'weight_per_unit_kg', e.target.value)} className="h-9 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Length (cm)</Label>
                <Input type="number" min="0" step="0.1" placeholder="L" value={line.length_cm} onChange={e => updateLine(line.id, 'length_cm', e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Width (cm)</Label>
                <Input type="number" min="0" step="0.1" placeholder="W" value={line.width_cm} onChange={e => updateLine(line.id, 'width_cm', e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height (cm)</Label>
                <Input type="number" min="0" step="0.1" placeholder="H" value={line.height_cm} onChange={e => updateLine(line.id, 'height_cm', e.target.value)} className="h-9 text-sm" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={line.stackable} onChange={e => updateLine(line.id, 'stackable', e.target.checked)} className="accent-[#D50000] w-3.5 h-3.5" />
                Stackable
              </label>
              {(parseFloat(vol) > 0 || parseFloat(wgt) > 0) && (
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Vol: <strong className="text-[#1A1A1A]">{vol} CBM</strong></span>
                  <span>Wt: <strong className="text-[#1A1A1A]">{wgt} kg</strong></span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {lines.length > 0 && (
        <div className="bg-[#1A1A1A] text-white rounded-xl p-4 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-white/60 text-xs">Total Volume</span>
            <p className="font-bold text-lg">{totals.vol.toFixed(4)} CBM</p>
          </div>
          <div>
            <span className="text-white/60 text-xs">Total Weight</span>
            <p className="font-bold text-lg">{totals.wgt.toFixed(2)} kg</p>
          </div>
          {mode === 'air' && (
            <>
              <div>
                <span className="text-white/60 text-xs">Volumetric Weight (÷6000)</span>
                <p className="font-bold text-lg">{volumetricWeightAir.toFixed(2)} kg</p>
              </div>
              <div className="border-l border-white/20 pl-6">
                <span className="text-[#D50000] text-xs font-semibold">Chargeable Weight</span>
                <p className="font-black text-xl text-[#D50000]">{chargeableWeight.toFixed(2)} kg</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}