// src/app/models/auth-response.ts
export interface AuthResponse {
    access_token: {
      accessToken: string;
      refreshToken: string;
    };
    user: {
      id: number;
      role_id: number;
      [key: string]: any; // Allow additional user properties (e.g., name, email)
    };
  }