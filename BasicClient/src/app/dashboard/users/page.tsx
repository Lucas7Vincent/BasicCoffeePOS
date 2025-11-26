'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserFormModal } from '@/components/management/UserFormModal';
import { DeleteConfirmDialog } from '@/components/management/DeleteConfirmDialog';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { User } from '@/types/auth';
import { Plus, Search, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // Queries
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => apiClient.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Tạo người dùng thành công!');
      setShowFormModal(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo người dùng');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Cập nhật người dùng thành công!');
      setShowFormModal(false);
      setEditingUser(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật người dùng');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Xóa người dùng thành công!');
      setDeletingUser(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa người dùng');
    },
  });

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user?.fullName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      user?.username?.toLowerCase()?.includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Role options
  const roleOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Manager', label: 'Quản lý' },
    { value: 'Cashier', label: 'Thu ngân' },
    { value: 'Staff', label: 'Nhân viên' },
  ];

  // Handlers
  const handleCreateUser = (userData: any) => {
    createUserMutation.mutate(userData);
  };

  const handleUpdateUser = (userData: any) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: userData });
    }
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingUser(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Manager':
        return 'default';
      case 'Cashier':
        return 'secondary';
      case 'Staff':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'Manager':
        return 'Quản lý';
      case 'Cashier':
        return 'Thu ngân';
      case 'Staff':
        return 'Nhân viên';
      default:
        return role;
    }
  };

  const canDeleteUser = (user: User) => {
    return currentUser?.id !== user.id; // Không thể xóa chính mình
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản nhân viên và phân quyền
          </p>
        </div>
        
        <Button onClick={() => setShowFormModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              {roleOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={roleFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter(option.value)}
                  className="gap-1"
                >
                  <Shield className="h-4 w-4" />
                  {option.label}
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
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.fullName}</span>
                          {currentUser?.id === user.id && (
                            <Badge variant="outline" className="text-xs">
                              Bạn
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {user.username}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleText(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingUser(user)}
                            className="gap-1"
                            disabled={!canDeleteUser(user)}
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
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || roleFilter !== 'all'
                    ? 'Không tìm thấy người dùng nào phù hợp' 
                    : 'Chưa có người dùng nào'
                  }
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
      <UserFormModal
        open={showFormModal}
        onClose={handleCloseModal}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        isLoading={deleteUserMutation.isPending}
        title="Xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa người dùng "${deletingUser?.fullName}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}