import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';

export default function ShipmentQuote({ rfq }) {
  if (!rfq?.quotation_amount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Quote not yet available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Quote
          </span>
          <Badge className="bg-green-600">Quotation Ready</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Quote Amount</p>
          <p className="text-4xl font-black text-green-700">
            {rfq.quotation_currency || 'USD'} {Number(rfq.quotation_amount).toLocaleString()}
          </p>
        </div>

        {rfq.pricing_notes && (
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium mb-1">Terms & Notes</p>
            <p className="text-sm text-gray-700">{rfq.pricing_notes}</p>
          </div>
        )}

        {rfq.quotation_url && (
          <a href={rfq.quotation_url} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download Full Quote
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}