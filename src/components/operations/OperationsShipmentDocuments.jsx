import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, File, Upload, Loader2, X } from 'lucide-react';

export default function OperationsShipmentDocuments({ shipment, onUpdate }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of e.target.files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push({
          url: file_url,
          name: file.name,
          type: file.type || 'File',
          uploaded_at: new Date().toISOString()
        });
      }
      
      const existing = Array.isArray(shipment.document_urls) 
        ? shipment.document_urls.filter(d => typeof d === 'object')
        : [];
      
      await base44.entities.Shipment.update(shipment.id, {
        document_urls: [...existing, ...uploaded]
      });
      
      onUpdate?.();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (idx) => {
    const updated = shipment.document_urls.filter((_, i) => i !== idx);
    await base44.entities.Shipment.update(shipment.id, { document_urls: updated });
    onUpdate?.();
  };

  const docs = shipment?.document_urls?.length ? shipment.document_urls : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents {docs.length > 0 && `(${docs.length})`}
        </CardTitle>
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="ops-doc-upload"
          />
          <label htmlFor="ops-doc-upload">
            <Button asChild size="sm" variant="outline" disabled={uploading}>
              <span>
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Add Document</>
                )}
              </span>
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc, idx) => {
              const docUrl = doc.url || doc;
              const docName = doc.name || `Document ${idx + 1}`;
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center gap-3 flex-1">
                    <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{docName}</p>
                      <p className="text-xs text-gray-500">{doc.type || 'File'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a href={docUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                    <button
                      onClick={() => handleDeleteDoc(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}