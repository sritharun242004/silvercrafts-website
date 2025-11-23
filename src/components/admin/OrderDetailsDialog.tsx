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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Order Details - {order.orderNumber || order.id.substring(0, 6).toUpperCase()}</DialogTitle>
          <DialogDescription>
            Complete order information and management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Order Status:</span>
              <Badge variant={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Payment:</span>
              <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-medium w-32">Name:</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-32">Email:</span>
                <span>{order.customerEmail}</span>
              </div>
              {(order.businessName || order.gstin) && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h4 className="font-semibold mb-2">Company Details</h4>
                  {order.businessName && (
                    <div className="flex gap-2">
                      <span className="font-medium w-32">Company Name:</span>
                      <span>{order.businessName}</span>
                    </div>
                  )}
                  {order.gstin && (
                    <div className="flex gap-2">
                      <span className="font-medium w-32">GST Number:</span>
                      <span>{order.gstin}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <span className="font-medium w-32">User ID:</span>
                <span className="font-mono text-xs">{order.userId}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-32">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[200px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-center">Width</TableHead>
                      <TableHead className="text-center">Height</TableHead>
                      <TableHead className="text-center">Diameter</TableHead>
                      <TableHead className="text-center">Purity</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.products.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {product.productName}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.width || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.height || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.diameter || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.purity ? `${product.purity}%` : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {order.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("processing")}
                >
                  Mark as Processing
                </Button>
              )}
              {order.status === "processing" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("completed")}
                >
                  Mark as Completed
                </Button>
              )}
              {order.status === "completed" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("delivered")}
                >
                  Mark as Delivered
                </Button>
              )}
              {order.paymentStatus === "pending" && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handlePaymentStatusChange("paid")}
                >
                  Mark as Paid
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
