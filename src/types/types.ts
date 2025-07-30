// src/types/types.ts

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}
