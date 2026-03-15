export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  phone: string;
  status: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface AuthResponse {
  code: number;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface UserResponse {
  code: number;
  data: User;
}
