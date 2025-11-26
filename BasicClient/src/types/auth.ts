export interface User {
    id: number;
    username: string;
    fullName: string;
    role: 'Staff' | 'Cashier' | 'Manager';
    createdAt: string;
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
  }