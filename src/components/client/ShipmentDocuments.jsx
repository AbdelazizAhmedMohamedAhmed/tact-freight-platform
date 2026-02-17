import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, File } from 'lucide-react';

export default function ShipmentDocuments({ shipment }) {
  if (!shipment?.document_urls?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents ({shipment.document_urls.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {shipment.document_urls.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{doc.name || `Document ${idx + 1}`}</p>
                <p className="text-xs text-gray-500">{doc.type || 'File'}</p>
              </div>
            </div>
            <a href={doc.url || doc} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4" />
              </Button>
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}