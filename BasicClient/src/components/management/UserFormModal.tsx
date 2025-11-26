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
import { User } from '@/types/auth';

const userSchema = z.object({
  username: z.string().min(3, 'Username phải có ít nhất 3 ký tự'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  role: z.enum(['Staff', 'Cashier', 'Manager'], {
    required_error: 'Vui lòng chọn vai trò',
  }),
  password: z.string().optional(),
}).refine((data) => {
  // Nếu đang tạo user mới, password là bắt buộc
  return data.password && data.password.length >= 6;
}, {
  message: 'Mật khẩu phải có ít nhất 6 ký tự',
  path: ['password'],
});

type UserForm = z.infer<typeof userSchema>;

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserForm) => void;
  user?: User | null;
  isLoading?: boolean;
}

export function UserFormModal({
  open,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}: UserFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        password: '', // Để trống khi edit
      });
    } else {
      reset({
        username: '',
        fullName: '',
        role: 'Staff',
        password: '',
      });
    }
  }, [user, reset]);

  const handleFormSubmit = (data: UserForm) => {
    const submitData = { ...data };
    
    // Nếu đang edit và password trống, xóa password khỏi data
    if (user && !data.password) {
      delete submitData.password;
    }
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register('username')}
              placeholder="Nhập username"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="fullName">Họ tên</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Nhập họ tên"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Vai trò</Label>
            <select
              id="role"
              {...register('role')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="Staff">Nhân viên</option>
              <option value="Cashier">Thu ngân</option>
              <option value="Manager">Quản lý</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">
                {errors.role.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">
              Mật khẩu {user && <span className="text-muted-foreground">(để trống nếu không đổi)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder={user ? "Nhập mật khẩu mới (tùy chọn)" : "Nhập mật khẩu"}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
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
              {isLoading ? 'Đang xử lý...' : (user ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}