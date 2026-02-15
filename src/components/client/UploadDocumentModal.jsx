import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { Upload, FileText, X } from 'lucide-react';
import { logFileAction } from '@/components/utils/activityLogger';

export default function UploadDocumentModal({ entity, entityType, open, onClose, onUpdate }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
      
      await logFileAction(
        'file_uploaded',
        file.name,
        entityType,
        entity.id,
        `Client uploaded ${file.name} to ${entityType === 'rfq' ? entity.reference_number : entity.tracking_number}`
      );
    }

    // Update entity with new documents
    const existingDocs = entity.document_urls || [];
    const updateData = {
      document_urls: [...existingDocs, ...uploadedUrls]
    };

    if (entityType === 'rfq') {
      await base44.entities.RFQ.update(entity.id, updateData);
    } else {
      await base44.entities.Shipment.update(entity.id, updateData);
    }

    setUploading(false);
    setFiles([]);
    onUpdate?.();
    onClose();
  };

  if (!entity) return null;

  const reference = entityType === 'rfq' ? entity.reference_number : entity.tracking_number;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Documents
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">
            Upload additional documents for <strong className="font-mono">{reference}</strong>
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Upload invoices, packing lists, photos, or other documents
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="doc-upload"
            />
            <label htmlFor="doc-upload">
              <Button variant="outline" asChild>
                <span>Choose Files</span>
              </Button>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <FileText className="w-4 h-4 text-[#D50000]" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleUpload} 
              disabled={files.length === 0 || uploading}
              className="bg-[#D50000] hover:bg-[#B00000]"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}