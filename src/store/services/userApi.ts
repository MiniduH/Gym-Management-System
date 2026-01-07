import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '..';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Main User interface - matching API spec
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  role: string; // Now returns string values: 'user', 'admin', 'trainer'
  status: string;
  department?: string;
  address?: {
    line1: string;
    line2?: string;
    district: string;
    province: string;
  };
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Request/Response interfaces
export interface GetUsersParams {
  limit?: number;
  offset?: number;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface GetUserResponse {
  success: boolean;
  data: User;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  username: string;
  email?: string; // Made optional
  password: string;
  phone: string; // Made required
  type: 'user' | 'admin' | 'trainer';
  department?: string;
  address?: {
    line1: string;
    line2: string;
    district: string;
    province: string;
  };
}

export interface CreateUserResponse {
  success: boolean;
  data: User;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  type?: 'user' | 'admin' | 'trainer'; // Changed from role to type
  status?: 'active' | 'inactive' | 'suspended';
  department?: string;
  address?: {
    line1: string;
    line2?: string;
    district: string;
    province: string;
  };
}

export interface UpdateUserResponse {
  success: boolean;
  data: User;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface GetUserCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface GetUserBarcodeResponse {
  success: boolean;
  data: {
    userId: number;
    barcodeValue: string;
    user: User;
  };
}

export interface Province {
  id: number;
  province_name: string;
  province_code: string;
  districts: District[];
}

export interface District {
  id: number;
  district_name: string;
  district_code: string;
}

export interface GetProvincesResponse {
  success: boolean;
  message: string;
  data: Province[];
  count: number;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const tokens = (getState() as RootState).auth.tokens;
      if (tokens?.accessToken) {
        headers.set('authorization', `Bearer ${tokens.accessToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get all users with pagination
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: ({ limit = 10, offset = 0 }) => {
        return `/users?limit=${limit}&offset=${offset}`;
      },
      providesTags: ['User'],
    }),

    // Get user count
    getUserCount: builder.query<GetUserCountResponse, void>({
      query: () => '/users/count',
    }),

    // Get user by ID
    getUserById: builder.query<GetUserResponse, number>({
      query: (userId) => `/users/id/${userId}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Get user by username
    getUserByUsername: builder.query<GetUserResponse, string>({
      query: (username) => `/users/username/${username}`,
    }),

    // Get user by email
    getUserByEmail: builder.query<GetUserResponse, string>({
      query: (email) => `/users/email/${email}`,
    }),

    // Get users by role
    getUsersByRole: builder.query<
      { success: boolean; data: User[] },
      'user' | 'admin' | 'trainer'
    >({
      query: (role) => `/users/role/${role}`,
      providesTags: ['User'],
    }),

    // Get users by status
    getUsersByStatus: builder.query<
      { success: boolean; data: User[] },
      'active' | 'inactive' | 'suspended'
    >({
      query: (status) => `/users/status/${status}`,
      providesTags: ['User'],
    }),

    // Create new user
    createUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Update user information
    updateUser: builder.mutation<
      UpdateUserResponse,
      { userId: number; data: UpdateUserRequest }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<DeleteUserResponse, number>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Get user barcode data
    getUserBarcode: builder.query<GetUserBarcodeResponse, number>({
      query: (userId) => `/users/${userId}/barcode`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Get provinces with districts
    getProvinces: builder.query<GetProvincesResponse, {}>({
      query: () => '/provinces',
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserCountQuery,
  useGetUserByIdQuery,
  useGetUserByUsernameQuery,
  useGetUserByEmailQuery,
  useGetUsersByRoleQuery,
  useGetUsersByStatusQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserBarcodeQuery,
  useGetProvincesQuery,
} = userApi;
