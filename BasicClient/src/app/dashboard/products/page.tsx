'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProductFormModal } from '@/components/management/ProductFormModal';
import { DeleteConfirmDialog } from '@/components/management/DeleteConfirmDialog';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Product, Category } from '@/types/pos';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  
  const queryClient = useQueryClient();

  // Queries
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiClient.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Tạo sản phẩm thành công!');
      setShowFormModal(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo sản phẩm');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Cập nhật sản phẩm thành công!');
      setShowFormModal(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật sản phẩm');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Xóa sản phẩm thành công!');
      setDeletingProduct(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    },
  });

  // Filtered products with null safety
  const filteredProducts = products.filter(product => {
    const matchesSearch = product?.productName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Handlers
  const handleCreateProduct = (productData: any) => {
    createProductMutation.mutate(productData);
  };

  const handleUpdateProduct = (productData: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    }
  };

  const handleDeleteProduct = () => {
    if (deletingProduct) {
      deleteProductMutation.mutate(deletingProduct.id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách sản phẩm của quán
          </p>
        </div>
        
        <Button onClick={() => setShowFormModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="gap-1"
              >
                <Filter className="h-4 w-4" />
                Tất cả
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.categoryName}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Ảnh sản phẩm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.categoryName}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(product.unitPrice)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {product.description ? (
                          // Check if description is a URL (starts with http)
                          product.description.startsWith('http') ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={product.description} 
                                alt={product.productName}
                                className="w-12 h-12 object-cover rounded-md border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling.style.display = 'block';
                                }}
                              />
                              <span 
                                className="text-xs text-gray-500 truncate hidden"
                                style={{maxWidth: '120px'}}
                              >
                                {product.description}
                              </span>
                            </div>
                          ) : (
                            <span className="truncate">{product.description}</span>
                          )
                        ) : (
                          <span className="text-gray-400 italic">Không có ảnh</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingProduct(product)}
                            className="gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedCategory 
                    ? 'Không tìm thấy sản phẩm nào phù hợp' 
                    : 'Chưa có sản phẩm nào'
                  }
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      <ProductFormModal
        open={showFormModal}
        onClose={handleCloseModal}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        categories={categories}
        product={editingProduct}
        isLoading={createProductMutation.isPending || updateProductMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        isLoading={deleteProductMutation.isPending}
        title="Xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${deletingProduct?.productName}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}