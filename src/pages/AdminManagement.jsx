import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Ship, Navigation, Package, Truck, Globe } from 'lucide-react';
import ManagementTable from '../components/admin/ManagementTable';
import ManagementModal from '../components/admin/ManagementModal';
import { format } from 'date-fns';

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState('ports');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // ===== PORTS =====
  const { data: ports = [], isLoading: portsL, refetch: refetchPorts } = useQuery({
    queryKey: ['ports'],
    queryFn: () => base44.entities.Port.list('-created_date', 500),
  });

  const handlePortSave = async (data) => {
    if (editingItem?.id) {
      await base44.entities.Port.update(editingItem.id, data);
    } else {
      await base44.entities.Port.create(data);
    }
    setEditingItem(null);
    refetchPorts();
  };

  const handlePortDelete = async (id) => {
    if (window.confirm('Delete this port?')) {
      await base44.entities.Port.delete(id);
      refetchPorts();
    }
  };

  // ===== CONTAINERS =====
  const { data: containers = [], isLoading: containersL, refetch: refetchContainers } = useQuery({
    queryKey: ['containers'],
    queryFn: () => base44.entities.ContainerType.list('-created_date', 500),
  });

  const handleContainerSave = async (data) => {
    if (editingItem?.id) {
      await base44.entities.ContainerType.update(editingItem.id, data);
    } else {
      await base44.entities.ContainerType.create(data);
    }
    setEditingItem(null);
    refetchContainers();
  };

  const handleContainerDelete = async (id) => {
    if (window.confirm('Delete this container type?')) {
      await base44.entities.ContainerType.delete(id);
      refetchContainers();
    }
  };

  // ===== CARGO TYPES =====
  const { data: cargoTypes = [], isLoading: cargoL, refetch: refetchCargo } = useQuery({
    queryKey: ['cargo-types'],
    queryFn: () => base44.entities.CargoType.list('-created_date', 500),
  });

  const handleCargoSave = async (data) => {
    if (editingItem?.id) {
      await base44.entities.CargoType.update(editingItem.id, data);
    } else {
      await base44.entities.CargoType.create(data);
    }
    setEditingItem(null);
    refetchCargo();
  };

  const handleCargoDelete = async (id) => {
    if (window.confirm('Delete this cargo type?')) {
      await base44.entities.CargoType.delete(id);
      refetchCargo();
    }
  };

  // ===== SHIPPING LINES =====
  const { data: shippingLines = [], isLoading: linesL, refetch: refetchLines } = useQuery({
    queryKey: ['shipping-lines'],
    queryFn: () => base44.entities.ShippingLine.list('-created_date', 500),
  });

  const handleLineSave = async (data) => {
    if (editingItem?.id) {
      await base44.entities.ShippingLine.update(editingItem.id, data);
    } else {
      await base44.entities.ShippingLine.create(data);
    }
    setEditingItem(null);
    refetchLines();
  };

  const handleLineDelete = async (id) => {
    if (window.confirm('Delete this shipping line?')) {
      await base44.entities.ShippingLine.delete(id);
      refetchLines();
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">System Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage ports, containers, cargo types, and shipping lines</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ports">Ports</TabsTrigger>
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="cargo">Cargo Types</TabsTrigger>
          <TabsTrigger value="lines">Shipping Lines</TabsTrigger>
        </TabsList>

        {/* PORTS TAB */}
        <TabsContent value="ports" className="space-y-4">
          <ManagementTable
            title="Ports"
            icon={Navigation}
            items={ports}
            isLoading={portsL}
            columns={[
              { key: 'code', label: 'Code', width: 'w-20' },
              { key: 'name', label: 'Port Name' },
              { key: 'city', label: 'City' },
              { key: 'country', label: 'Country' },
              { 
                key: 'type', 
                label: 'Type',
                render: (item) => <Badge variant="outline" className="capitalize">{item.type}</Badge>
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (item) => item.is_active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="outline">Inactive</Badge>
              },
            ]}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handlePortDelete}
          />
        </TabsContent>

        {/* CONTAINERS TAB */}
        <TabsContent value="containers" className="space-y-4">
          <ManagementTable
            title="Container Types"
            icon={Package}
            items={containers}
            isLoading={containersL}
            columns={[
              { key: 'code', label: 'Code', width: 'w-20' },
              { key: 'name', label: 'Container Type' },
              { key: 'teus', label: 'TEUs', render: (item) => item.teus || '-' },
              { key: 'volume_cbm', label: 'Volume (CBM)', render: (item) => item.volume_cbm || '-' },
              { 
                key: 'is_reefer', 
                label: 'Reefer',
                render: (item) => item.is_reefer ? '✓' : '-'
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (item) => item.is_active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="outline">Inactive</Badge>
              },
            ]}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleContainerDelete}
          />
        </TabsContent>

        {/* CARGO TYPES TAB */}
        <TabsContent value="cargo" className="space-y-4">
          <ManagementTable
            title="Cargo Types"
            icon={Truck}
            items={cargoTypes}
            isLoading={cargoL}
            columns={[
              { key: 'code', label: 'Code', width: 'w-20' },
              { key: 'name', label: 'Cargo Type' },
              { key: 'category', label: 'Category', render: (item) => <Badge variant="outline">{item.category}</Badge> },
              { 
                key: 'is_hazardous', 
                label: 'Hazmat',
                render: (item) => item.is_hazardous ? <Badge className="bg-red-100 text-red-800">Yes</Badge> : '-'
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (item) => item.is_active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="outline">Inactive</Badge>
              },
            ]}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleCargoDelete}
          />
        </TabsContent>

        {/* SHIPPING LINES TAB */}
        <TabsContent value="lines" className="space-y-4">
          <ManagementTable
            title="Shipping Lines & Airlines"
            icon={Ship}
            items={shippingLines}
            isLoading={linesL}
            columns={[
              { key: 'name', label: 'Carrier Name' },
              { key: 'code', label: 'Code', width: 'w-20', render: (item) => item.code || '-' },
              { 
                key: 'type', 
                label: 'Type',
                render: (item) => <Badge variant="outline" className="capitalize">{item.type}</Badge>
              },
              { key: 'contact_email', label: 'Email', render: (item) => item.contact_email ? <a href={`mailto:${item.contact_email}`} className="text-[#D50000] hover:underline text-xs">{item.contact_email}</a> : '-' },
              {
                key: 'is_active',
                label: 'Status',
                render: (item) => item.is_active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="outline">Inactive</Badge>
              },
            ]}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleLineDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Modal for editing/creating items */}
      {activeTab === 'ports' && (
        <ManagementModal
          open={modalOpen}
          onClose={handleModalClose}
          title="Port"
          item={editingItem}
          fields={[
            { name: 'code', label: 'Port Code', placeholder: 'e.g., JPTYO', required: true },
            { name: 'name', label: 'Port Name', placeholder: 'e.g., Tokyo Port', required: true },
            { name: 'city', label: 'City', placeholder: 'e.g., Tokyo' },
            { name: 'country', label: 'Country', placeholder: 'e.g., Japan', required: true },
            { name: 'region', label: 'Region', placeholder: 'e.g., Asia' },
            { name: 'type', label: 'Type', type: 'select', options: [
              { value: 'sea', label: 'Sea Port' },
              { value: 'air', label: 'Airport' },
              { value: 'inland', label: 'Inland' },
            ], required: true },
          ]}
          onSave={handlePortSave}
        />
      )}

      {activeTab === 'containers' && (
        <ManagementModal
          open={modalOpen}
          onClose={handleModalClose}
          title="Container Type"
          item={editingItem}
          fields={[
            { name: 'code', label: 'Code', placeholder: "e.g., 20STD", required: true },
            { name: 'name', label: 'Name', placeholder: "e.g., 20' Standard", required: true },
            { name: 'length_ft', label: 'Length (ft)', type: 'number' },
            { name: 'width_ft', label: 'Width (ft)', type: 'number' },
            { name: 'height_ft', label: 'Height (ft)', type: 'number' },
            { name: 'teus', label: 'TEUs', type: 'number' },
            { name: 'max_weight_kg', label: 'Max Weight (KG)', type: 'number' },
            { name: 'volume_cbm', label: 'Volume (CBM)', type: 'number' },
          ]}
          onSave={handleContainerSave}
        />
      )}

      {activeTab === 'cargo' && (
        <ManagementModal
          open={modalOpen}
          onClose={handleModalClose}
          title="Cargo Type"
          item={editingItem}
          fields={[
            { name: 'code', label: 'Code', placeholder: "e.g., FCL", required: true },
            { name: 'name', label: 'Name', placeholder: "e.g., Full Container Load", required: true },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this cargo type...' },
            { name: 'category', label: 'Category', type: 'select', options: [
              { value: 'FCL', label: 'FCL - Full Container Load' },
              { value: 'LCL', label: 'LCL - Less than Container Load' },
              { value: 'Break Bulk', label: 'Break Bulk' },
              { value: 'RORO', label: 'RORO - Roll On Roll Off' },
              { value: 'Project', label: 'Project Cargo' },
              { value: 'Other', label: 'Other' },
            ], required: true },
          ]}
          onSave={handleCargoSave}
        />
      )}

      {activeTab === 'lines' && (
        <ManagementModal
          open={modalOpen}
          onClose={handleModalClose}
          title="Shipping Line"
          item={editingItem}
          fields={[
            { name: 'name', label: 'Carrier Name', placeholder: "e.g., Maersk", required: true },
            { name: 'code', label: 'Carrier Code', placeholder: "e.g., MAE" },
            { name: 'type', label: 'Type', type: 'select', options: [
              { value: 'sea', label: 'Shipping Line' },
              { value: 'air', label: 'Airline' },
            ], required: true },
            { name: 'website', label: 'Website', placeholder: "https://example.com" },
            { name: 'contact_email', label: 'Contact Email', type: 'email', placeholder: "contact@example.com" },
            { name: 'phone', label: 'Phone', placeholder: "+1-234-567-8900" },
          ]}
          onSave={handleLineSave}
        />
      )}
    </div>
  );
}