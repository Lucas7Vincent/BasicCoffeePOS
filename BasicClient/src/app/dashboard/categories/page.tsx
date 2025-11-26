'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CategoryFormModal } from '@/components/management/CategoryFormModal';
import { DeleteConfirmDialog } from '@/components/management/DeleteConfirmDialog';
import { apiClient } from '@/lib/api';
import { Category } from '@/types/pos';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  
  const queryClient = useQueryClient();

  // Queries
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Get products count for each category
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(),
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: any) => apiClient.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Tạo danh mục thành công!');
      setShowFormModal(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục';
      toast.error(message);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Cập nhật danh mục thành công!');
      setShowFormModal(false);
      setEditingCategory(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật danh mục';
      toast.error(message);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Xóa danh mục thành công!');
      setDeletingCategory(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục';
      toast.error(message);
    },
  });

  // Filtered categories with null safety
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category?.categoryName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
    return matchesSearch;
  });

  // Get product count for a category
  const getProductCount = (categoryId: number) => {
    return products.filter((product: any) => product.categoryId === categoryId).length;
  };

  // Handlers
  const handleCreateCategory = (categoryData: any) => {
    createCategoryMutation.mutate(categoryData);
  };

  const handleUpdateCategory = (categoryData: any) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryData });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = () => {
    if (deletingCategory) {
      deleteCategoryMutation.mutate(deletingCategory.id);
    }
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <Button onClick={() => setShowFormModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm danh mục mới
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead>Số sản phẩm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.categoryName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getProductCount(category.id)} sản phẩm
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">
                          Hoạt động
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(category)}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(category)}
                            className="gap-1"
                            disabled={getProductCount(category.id) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredCategories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Form Modal */}
      <CategoryFormModal
        open={showFormModal}
        onClose={handleCloseModal}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        category={editingCategory}
        isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deletingCategory?.categoryName}"? Hành động này không thể hoàn tác.`}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
