// src/app/models/auth-response.ts
export interface AuthResponse {
  access_token: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: number;
    role_id: number;
    profileCompleted?: boolean; // ✅ Add this line
    name?: string;
    email?: string;
    // Add other known fields here if needed
    [key: string]: any; // still keep this if user might have dynamic fields
  };
}
