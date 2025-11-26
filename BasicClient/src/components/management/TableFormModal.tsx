'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table } from '@/types/pos';

const tableSchema = z.object({
  tableName: z.string().min(1, 'Tên bàn không được để trống'),
  seatingCapacity: z.number().min(1, 'Số chỗ ngồi phải lớn hơn 0'),
  description: z.string().optional(),
});

type TableForm = z.infer<typeof tableSchema>;

interface TableFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TableForm) => void;
  table?: Table | null;
  isLoading?: boolean;
}

export function TableFormModal({
  open,
  onClose,
  onSubmit,
  table,
  isLoading = false,
}: TableFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
  });

  useEffect(() => {
    if (table) {
      reset({
        tableName: table.tableName,
        seatingCapacity: table.seatingCapacity,
        description: table.description || '',
      });
    } else {
      reset({
        tableName: '',
        seatingCapacity: 2,
        description: '',
      });
    }
  }, [table, reset]);

  const handleFormSubmit = (data: TableForm) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {table ? 'Cập nhật bàn' : 'Thêm bàn mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="tableName">Tên bàn</Label>
            <Input
              id="tableName"
              {...register('tableName')}
              placeholder="Nhập tên bàn"
              disabled={isLoading}
            />
            {errors.tableName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tableName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="seatingCapacity">Số chỗ ngồi</Label>
            <Input
              id="seatingCapacity"
              type="number"
              min="1"
              {...register('seatingCapacity', { valueAsNumber: true })}
              placeholder="Nhập số chỗ ngồi"
              disabled={isLoading}
            />
            {errors.seatingCapacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.seatingCapacity.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Nhập mô tả bàn (tùy chọn)"
              disabled={isLoading}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : (table ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}