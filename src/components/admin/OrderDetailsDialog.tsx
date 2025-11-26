"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderProduct {
  productName: string;
  quantity: number;
  price: number;
  width?: string;
  height?: string;
  diameter?: string;
  purity?: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  products: OrderProduct[];
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "delivered";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  shippingAddress: string;
  businessName?: string;
  gstin?: string;
}

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onStatusUpdate?: (orderId: string, newStatus: Order["status"]) => void;
  onPaymentStatusUpdate?: (
    orderId: string,
    newPaymentStatus: Order["paymentStatus"]
  ) => void;
}

const OrderDetailsDialog = ({
  open,
  onOpenChange,
  order,
  onStatusUpdate,
  onPaymentStatusUpdate,
}: OrderDetailsDialogProps) => {
  if (!order) return null;

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "secondary";
      case "completed":
        return "default";
      case "processing":
        return "default";
      default:
        return "outline";
    }
  };

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return "default";
      case "refunded":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleStatusChange = (newStatus: Order["status"]) => {
    onStatusUpdate?.(order.id, newStatus);
  };

  const handlePaymentStatusChange = (
    newPaymentStatus: Order["paymentStatus"]
  ) => {
    onPaymentStatusUpdate?.(order.id, newPaymentStatus);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl">
            Order Details - {order.orderNumber || order.id.substring(0, 6).toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Complete order information and management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 overflow-y-auto flex-1 pr-1">
          {/* Order Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium">Order Status:</span>
              <Badge variant={getStatusColor(order.status)} className="text-xs">
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium">Payment:</span>
              <Badge variant={getPaymentStatusColor(order.paymentStatus)} className="text-xs">
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
            <h3 className="font-semibold text-base sm:text-lg mb-3">Customer Information</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-medium sm:w-32 min-w-[80px]">Name:</span>
                <span className="break-words">{order.customerName}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-medium sm:w-32 min-w-[80px]">Email:</span>
                <span className="break-words break-all">{order.customerEmail}</span>
              </div>
              {(order.businessName || order.gstin) && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-300">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Company Details</h4>
                  {order.businessName && (
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <span className="font-medium sm:w-32 min-w-[80px]">Company Name:</span>
                      <span className="break-words">{order.businessName}</span>
                    </div>
                  )}
                  {order.gstin && (
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <span className="font-medium sm:w-32 min-w-[80px]">GST Number:</span>
                      <span className="break-words">{order.gstin}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-medium sm:w-32 min-w-[80px]">User ID:</span>
                <span className="font-mono text-xs break-all">{order.userId}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-medium sm:w-32 min-w-[80px]">Order Date:</span>
                <span className="break-words">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[200px] sm:max-h-[300px] overflow-y-auto">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="min-w-[150px] sm:min-w-[200px]">Product Name</TableHead>
                        <TableHead className="text-center min-w-[70px]">Width</TableHead>
                        <TableHead className="text-center min-w-[70px]">Height</TableHead>
                        <TableHead className="text-center min-w-[80px]">Diameter</TableHead>
                        <TableHead className="text-center min-w-[70px]">Purity</TableHead>
                        <TableHead className="text-center min-w-[70px]">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.products.map((product, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            {product.productName}
                          </TableCell>
                          <TableCell className="text-center text-xs sm:text-sm">
                            {product.width || "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs sm:text-sm">
                            {product.height || "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs sm:text-sm">
                            {product.diameter || "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs sm:text-sm">
                            {product.purity ? `${product.purity}%` : "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs sm:text-sm font-medium">
                            {product.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-2 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {/* Forward Status Buttons */}
              {order.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("processing")}
                  className="text-xs sm:text-sm"
                >
                  Mark as Processing
                </Button>
              )}
              {order.status === "processing" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange("pending")}
                    className="text-xs sm:text-sm"
                  >
                    Back to Pending
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("completed")}
                    className="text-xs sm:text-sm"
                  >
                    Mark as Completed
                  </Button>
                </>
              )}
              {order.status === "completed" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange("processing")}
                    className="text-xs sm:text-sm"
                  >
                    Back to Processing
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("delivered")}
                    className="text-xs sm:text-sm"
                  >
                    Mark as Delivered
                  </Button>
                </>
              )}
              {order.status === "delivered" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("completed")}
                  className="text-xs sm:text-sm"
                >
                  Back to Completed
                </Button>
              )}
              {/* Payment Status Buttons */}
              {order.paymentStatus === "pending" && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handlePaymentStatusChange("paid")}
                  className="text-xs sm:text-sm"
                >
                  Mark as Paid
                </Button>
              )}
              {order.paymentStatus === "paid" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePaymentStatusChange("pending")}
                  className="text-xs sm:text-sm"
                >
                  Back to Pending Payment
                </Button>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
