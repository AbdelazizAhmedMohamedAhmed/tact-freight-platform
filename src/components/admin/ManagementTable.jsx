import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagementTable({ 
  title, 
  icon: Icon,
  items = [], 
  isLoading, 
  columns, 
  onAdd, 
  onEdit, 
  onDelete,
  searchKey = 'name'
}) {
  const [search, setSearch] = useState('');
  
  const filtered = items.filter(item =>
    Object.keys(item).some(key =>
      String(item[key]).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5" />}
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder={`Search ${title.toLowerCase()}...`} 
              className="pl-10 h-8 text-sm" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <Button onClick={onAdd} size="sm" className="bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 rounded-lg" />
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map(col => (
                  <TableHead key={col.key} className={col.width || ''}>
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-6 text-gray-500">
                    No {title.toLowerCase()} found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(item => (
                  <TableRow key={item.id}>
                    {columns.map(col => (
                      <TableCell key={`${item.id}-${col.key}`} className={col.className || 'text-sm'}>
                        {col.render ? col.render(item) : item[col.key]}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => onEdit(item)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onDelete(item.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}