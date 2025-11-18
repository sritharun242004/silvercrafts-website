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
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  products: OrderProduct[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  shippingAddress: string;
}

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onStatusUpdate?: (orderId: string, newStatus: Order["status"]) => void;
}

const OrderDetailsDialog = ({
  open,
  onOpenChange,
  order,
  onStatusUpdate,
}: OrderDetailsDialogProps) => {
  if (!order) return null;

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "secondary";
      case "shipped":
        return "default";
      case "cancelled":
        return "destructive";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {order.id}</DialogTitle>
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

          {/* Shipping Address */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-700">{order.shippingAddress}</p>
          </div>

          {/* Order Items Table */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.products.map((product, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {product.price.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹
                        {(product.price * product.quantity).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={3} className="text-right font-bold">
                      Total Amount:
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      ₹
                      {order.totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
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
                <Button size="sm" onClick={() => handleStatusChange("shipped")}>
                  Mark as Shipped
                </Button>
              )}
              {order.status === "shipped" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("delivered")}
                >
                  Mark as Delivered
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


