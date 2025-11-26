'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Product, Category } from '@/types/pos';

const productSchema = z.object({
  productName: z.string().min(1, 'Tên sản phẩm không được để trống'),
  categoryId: z.number().min(1, 'Vui lòng chọn danh mục'),
  unitPrice: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductForm) => void;
  categories: Category[];
  product?: Product | null;
  isLoading?: boolean;
}

export function ProductFormModal({
  open,
  onClose,
  onSubmit,
  categories,
  product,
  isLoading = false,
}: ProductFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const [imagePreviewError, setImagePreviewError] = useState(false);
  const imageUrl = useWatch({ control, name: 'imageUrl' });

  useEffect(() => {
    if (product) {
      reset({
        productName: product.productName,
        categoryId: product.categoryId,
        unitPrice: product.unitPrice,
        description: '', // Keep description separate from imageUrl
        imageUrl: product.description || '', // Use description as imageUrl for backward compatibility
      });
    } else {
      reset({
        productName: '',
        categoryId: categories[0]?.id || 0,
        unitPrice: 0,
        description: '',
        imageUrl: '',
      });
    }
  }, [product, categories, reset]);

  const handleFormSubmit = (data: ProductForm) => {
    // Transform frontend data to match backend expectations
    const submitData = {
      name: data.productName,           // Backend expects 'name'
      categoryId: data.categoryId,      // Same field name
      price: data.unitPrice,            // Backend expects 'price'
      imageUrl: data.imageUrl,          // Backend expects 'imageUrl'
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="productName">Tên sản phẩm</Label>
            <Input
              id="productName"
              {...register('productName')}
              placeholder="Nhập tên sản phẩm"
              disabled={isLoading}
            />
            {errors.productName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.productName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="categoryId">Danh mục</Label>
            <select
              id="categoryId"
              {...register('categoryId', { valueAsNumber: true })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="unitPrice">Giá (VNĐ)</Label>
            <Input
              id="unitPrice"
              type="number"
              step="1000"
              {...register('unitPrice', { valueAsNumber: true })}
              placeholder="Nhập giá sản phẩm"
              disabled={isLoading}
            />
            {errors.unitPrice && (
              <p className="text-red-500 text-sm mt-1">
                {errors.unitPrice.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="imageUrl">Ảnh sản phẩm (URL)</Label>
            <Input
              id="imageUrl"
              type="url"
              {...register('imageUrl')}
              placeholder="https://example.com/image.jpg"
              disabled={isLoading}
              onChange={() => setImagePreviewError(false)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nhập URL của ảnh sản phẩm (tùy chọn)
            </p>
            
            {/* Image Preview */}
            {imageUrl && imageUrl.startsWith('http') && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-2">Xem trước:</p>
                {!imagePreviewError ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-md border"
                    onError={() => setImagePreviewError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-md border flex items-center justify-center">
                    <span className="text-xs text-gray-400">Lỗi tải ảnh</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Nhập mô tả sản phẩm (tùy chọn)"
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
              {isLoading ? 'Đang xử lý...' : (product ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}