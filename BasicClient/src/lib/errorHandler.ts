/**
 * Centralized Error Handling
 * Handle all application errors consistently
 */

import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Không thể kết nối tới server') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message = 'Phiên đăng nhập đã hết hạn') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dữ liệu không hợp lệ', public errors?: any) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy dữ liệu') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện thao tác này') {
    super(message, 'PERMISSION_ERROR', 403);
    this.name = 'PermissionError';
  }
}

// Error handler utility
export class ErrorHandler {
  // Convert Axios error to AppError
  static fromAxiosError(error: AxiosError): AppError {
    if (error.code === 'ERR_NETWORK') {
      return new NetworkError();
    }

    const status = error.response?.status;
    const message = (error.response?.data as any)?.message || error.message;

    switch (status) {
      case 401:
        return new AuthError(message);
      case 403:
        return new PermissionError(message);
      case 404:
        return new NotFoundError(message);
      case 400:
        return new ValidationError(message, (error.response?.data as any)?.errors);
      default:
        return new AppError(message, 'SERVER_ERROR', status);
    }
  }

  // Handle error and show appropriate toast
  static handle(error: unknown, options?: {
    silent?: boolean;
    customMessage?: string;
    showDetails?: boolean;
  }): AppError {
    let appError: AppError;

    // Convert to AppError
    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error && 'isAxiosError' in error) {
      appError = this.fromAxiosError(error as AxiosError);
    } else if (error instanceof Error) {
      appError = new AppError(error.message);
    } else {
      appError = new AppError('Unknown error');
    }

    // Log to console
    console.error(`[${appError.name}]:`, appError.message, appError);

    // Show toast (unless silent)
    if (!options?.silent) {
      const message = options?.customMessage || appError.message;
      
      switch (appError.name) {
        case 'NetworkError':
          toast.error(message, { icon: '📡' });
          break;
        case 'AuthError':
          toast.error(message, { icon: '🔒' });
          break;
        case 'PermissionError':
          toast.error(message, { icon: '⛔' });
          break;
        case 'ValidationError':
          toast.error(message, { icon: '⚠️' });
          break;
        case 'NotFoundError':
          toast.error(message, { icon: '🔍' });
          break;
        default:
          toast.error(message, { icon: '❌' });
      }
    }

    // TODO: Send to error tracking service
    // this.logToService(appError);

    return appError;
  }

  // Handle error silently (log only, no toast)
  static handleSilent(error: unknown): AppError {
    return this.handle(error, { silent: true });
  }

  // Handle with custom message
  static handleWithMessage(error: unknown, message: string): AppError {
    return this.handle(error, { customMessage: message });
  }

  // Log to external service (Sentry, LogRocket, etc.)
  private static logToService(error: AppError): void {
    // TODO: Implement when ready
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry.captureException(error);
    }
  }

  // Get user-friendly message
  static getUserMessage(error: unknown): string {
    if (error instanceof AppError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Đã xảy ra lỗi không xác định';
  }
}

// Helper functions for common patterns
export const handleError = ErrorHandler.handle;
export const handleSilentError = ErrorHandler.handleSilent;
export const getUserErrorMessage = ErrorHandler.getUserMessage;

