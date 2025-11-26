'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TableFormModal } from '@/components/management/TableFormModal';
import { DeleteConfirmDialog } from '@/components/management/DeleteConfirmDialog';
import { apiClient } from '@/lib/api';
import { Table as TableType } from '@/types/pos';
import { Plus, Search, Edit, Trash2, Users, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TablesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const [deletingTable, setDeletingTable] = useState<TableType | null>(null);
  
  const queryClient = useQueryClient();

  // Queries
  const { data: tables = [], isLoading } = useQuery<TableType[]>({
    queryKey: ['tables'],
    queryFn: () => apiClient.getTables(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
  });

  // Mutations
  const createTableMutation = useMutation({
    mutationFn: (tableData: any) => apiClient.createTable(tableData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Tạo bàn thành công!');
      setShowFormModal(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo bàn');
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.updateTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Cập nhật bàn thành công!');
      setShowFormModal(false);
      setEditingTable(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật bàn');
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Xóa bàn thành công!');
      setDeletingTable(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa bàn');
    },
  });

  // Filtered tables
  const filteredTables = tables.filter(table =>
    table?.tableName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false
  );

  // Check if table has active order
  const getTableStatus = (tableId: number) => {
    return orders.some((order: any) => 
      order.tableId === tableId && order.status === 'Ordering'
    );
  };

  // Handlers
  const handleCreateTable = (tableData: any) => {
    createTableMutation.mutate(tableData);
  };

  const handleUpdateTable = (tableData: any) => {
    if (editingTable) {
      updateTableMutation.mutate({ id: editingTable.id, data: tableData });
    }
  };

  const handleDeleteTable = () => {
    if (deletingTable) {
      deleteTableMutation.mutate(deletingTable.id);
    }
  };

  const handleEdit = (table: TableType) => {
    setEditingTable(table);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingTable(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Quản lý bàn</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các bàn trong quán
          </p>
        </div>
        
        <Button onClick={() => setShowFormModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm bàn
        </Button>
      </div>

      {/* Table Grid View */}
      <Card>
        <CardHeader>
          <CardTitle>Sơ đồ bàn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table) => {
              const hasActiveOrder = getTableStatus(table.id);
              return (
                <Card
                  key={table.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    hasActiveOrder 
                      ? 'border-orange-400 bg-orange-50' 
                      : 'border-green-400 bg-green-50'
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold">{table.tableName}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                      <Users className="h-4 w-4" />
                      <span>{table.seatingCapacity}</span>
                    </div>
                    <Badge 
                      variant={hasActiveOrder ? "warning" : "success"}
                      className="mt-2"
                    >
                      {hasActiveOrder ? 'Đang phục vụ' : 'Trống'}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Table List View */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bàn</CardTitle>
          
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
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
                    <TableHead>Tên bàn</TableHead>
                    <TableHead>Số chỗ ngồi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables.map((table) => {
                    const hasActiveOrder = getTableStatus(table.id);
                    return (
                      <TableRow key={table.id}>
                        <TableCell className="font-medium">
                          {table.tableName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {table.seatingCapacity} người
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={hasActiveOrder ? "warning" : "success"}>
                            {hasActiveOrder ? 'Đang phục vụ' : 'Trống'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {table.description || 'Không có mô tả'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(table)}
                              className="gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeletingTable(table)}
                              className="gap-1"
                              disabled={hasActiveOrder}
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredTables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm 
                    ? 'Không tìm thấy bàn nào phù hợp' 
                    : 'Chưa có bàn nào'
                  }
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Form Modal */}
      <TableFormModal
        open={showFormModal}
        onClose={handleCloseModal}
        onSubmit={editingTable ? handleUpdateTable : handleCreateTable}
        table={editingTable}
        isLoading={createTableMutation.isPending || updateTableMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingTable}
        onClose={() => setDeletingTable(null)}
        onConfirm={handleDeleteTable}
        isLoading={deleteTableMutation.isPending}
        title="Xóa bàn"
        description={`Bạn có chắc chắn muốn xóa bàn "${deletingTable?.tableName}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}