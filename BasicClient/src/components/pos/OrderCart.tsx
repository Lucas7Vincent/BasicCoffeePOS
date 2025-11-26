'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { OrderItem } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, Trash2, StickyNote, Printer, ChefHat, Receipt } from 'lucide-react';
import { usePrint } from '@/hooks/usePrint';

interface OrderCartProps {
  items: OrderItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onUpdateNotes: (productId: number, notes: string) => void;
  total: number;
  currentOrder?: any; // Order object if available
  tableName?: string;
  cashierName?: string;
}

export function OrderCart({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onUpdateNotes, 
  total,
  currentOrder,
  tableName,
  cashierName = 'Thu ngân'
}: OrderCartProps) {
  const [editingNotes, setEditingNotes] = useState<{ productId: number; notes: string } | null>(null);
  const { printKitchenOrder, printTemporaryReceipt, isLoading } = usePrint();

  // Tạo order object từ items để in
  const createOrderForPrint = () => {
    if (currentOrder) return currentOrder;
    
    return {
      id: Date.now(), // Temporary ID
      tableId: 0, // Temporary
      items: items.map(item => ({
        ...item,
        price: item.unitPrice, // ✅ FIX: Add price field for compatibility
        notes: item.notes || ''
      })),
      totalAmount: total,
      tableName: tableName || 'Không xác định',
      status: 'Ordering' as const
    };
  };

  // Xử lý in đơn hàng chuẩn bị (cho bếp)
  const handlePrintKitchenOrder = () => {
    const order = createOrderForPrint();
    printKitchenOrder(order, cashierName);
  };

  // Xử lý in hóa đơn tạm tính (cho khách)
  const handlePrintTemporaryReceipt = () => {
    const order = createOrderForPrint();
    printTemporaryReceipt(order, cashierName);
  };
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Giỏ hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chưa có sản phẩm nào trong giỏ hàng
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giỏ hàng ({items.length} món)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="border rounded-lg p-3 space-y-2">
                {/* ✅ Main item info row */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    {/* ✅ ADD: Notes button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className={`h-8 w-8 ${item.notes ? 'text-amber-600 bg-amber-50' : 'text-gray-400'}`}
                          onClick={() => setEditingNotes({ productId: item.productId, notes: item.notes || '' })}
                        >
                          <StickyNote className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Ghi chú cho {item.productName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="VD: Ít đường, không đá, thêm kem..."
                            value={editingNotes?.productId === item.productId ? editingNotes.notes : item.notes || ''}
                            onChange={(e) => {
                              if (editingNotes?.productId === item.productId) {
                                setEditingNotes({ ...editingNotes, notes: e.target.value });
                              }
                            }}
                            maxLength={500}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingNotes(null)}
                            >
                              Hủy
                            </Button>
                            <Button
                              onClick={() => {
                                if (editingNotes) {
                                  onUpdateNotes(editingNotes.productId, editingNotes.notes);
                                  setEditingNotes(null);
                                }
                              }}
                            >
                              Lưu
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => onRemoveItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>

                {/* ✅ ADD: Notes display row */}
                {item.notes && (
                  <div className="flex items-center gap-2 text-sm">
                    <StickyNote className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs">
                      {item.notes}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>

            {/* ✅ ADD: Print buttons */}
            {items.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintKitchenOrder}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <ChefHat className="h-4 w-4" />
                  <span className="text-xs">🍽️ In chuẩn bị</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintTemporaryReceipt}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Receipt className="h-4 w-4" />
                  <span className="text-xs">🧾 In tạm tính</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}