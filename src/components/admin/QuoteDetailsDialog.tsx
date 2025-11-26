"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuoteProduct {
  productName: string;
  quantity: number;
  category?: string;
}

interface QuoteRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: QuoteProduct[];
  message?: string;
  status: "pending" | "sent" | "rejected";
  createdAt: string;
  businessName?: string;
  gstin?: string;
  userId?: string | null;
}

interface QuoteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: QuoteRequest | null;
  onQuoteSent?: (quoteId: string) => void;
}

const QuoteDetailsDialog = ({
  open,
  onOpenChange,
  quote,
  onQuoteSent,
}: QuoteDetailsDialogProps) => {
  const [showSendQuote, setShowSendQuote] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!quote) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (pdfFiles.length > 1) {
      toast.error("Please upload only one PDF file");
      return;
    }

    setPdfFile(pdfFiles[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSendQuote = async () => {
    if (!pdfFile) {
      toast.error("Please upload a quote PDF");
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call to send quote
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Quote sent to ${quote.customerEmail}!`);
      onQuoteSent?.(quote.id);
      setShowSendQuote(false);
      setPdfFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send quote");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Quote Details Dialog */}
      <Dialog open={open && !showSendQuote} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Request Details</DialogTitle>
            <DialogDescription>
              Review customer information and requested products
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">
                  Customer Information
                </h3>
                {!quote.userId && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    New User
                  </Badge>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium w-24">Name:</span>
                  <span>{quote.customerName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium w-24">Email:</span>
                  <span>{quote.customerEmail}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium w-24">Phone:</span>
                  <span>{quote.customerPhone || "Not provided"}</span>
                </div>
                {(quote.businessName || quote.gstin) && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <h4 className="font-semibold mb-2">Company Details</h4>
                    {quote.businessName && (
                      <div className="flex gap-2">
                        <span className="font-medium w-24">Company Name:</span>
                        <span>{quote.businessName}</span>
                      </div>
                    )}
                    {quote.gstin && (
                      <div className="flex gap-2">
                        <span className="font-medium w-24">GST Number:</span>
                        <span>{quote.gstin}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-medium w-24">Requested:</span>
                  <span>{new Date(quote.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium w-24">Status:</span>
                  <Badge
                    variant={
                      quote.status === "pending"
                        ? "default"
                        : quote.status === "sent"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {quote.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Customer Message */}
            {quote.message && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Customer Message</h3>
                <p className="text-sm text-gray-700 italic">
                  "{quote.message}"
                </p>
              </div>
            )}

            {/* Requested Products Table */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Requested Products</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.products.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {product.productName}
                        </TableCell>
                        <TableCell>
                          {product.category || (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {quote.status === "pending" && (
                <Button onClick={() => setShowSendQuote(true)}>
                  Send Quote
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Quote Dialog (PDF Upload) */}
      <Dialog open={showSendQuote} onOpenChange={setShowSendQuote}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Quote to {quote.customerName}</DialogTitle>
            <DialogDescription>
              Upload the quote PDF to send to {quote.customerEmail}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* PDF Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-black bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {pdfFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-sm font-medium text-green-600">
                      {pdfFile.name}
                    </p>
                    <button
                      onClick={() => setPdfFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(pdfFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your quote PDF here
                  </p>
                  <p className="text-xs text-gray-500 mb-4">or</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("pdf-upload")?.click()
                    }
                  >
                    Select PDF File
                  </Button>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSendQuote(false);
                  setPdfFile(null);
                }}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendQuote}
                disabled={!pdfFile || isSending}
              >
                {isSending ? "Sending..." : "Send Quote"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuoteDetailsDialog;


