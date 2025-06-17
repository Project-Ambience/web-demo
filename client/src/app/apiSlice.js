import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Model', 'ClinicianType'],
  endpoints: builder => ({
    getClinicianTypes: builder.query({
      query: () => '/clinician_types',
      providesTags: ['ClinicianType'],
    }),
    getAiModelById: builder.query({
      query: id => `/ai_models/${id}`,
      providesTags: (result, error, id) => [{ type: 'Model', id }],
    }),
    addRating: builder.mutation({
      query: ({ ai_model_id, rating }) => ({
        url: `/ai_models/${ai_model_id}/ratings`,
        method: 'POST',
        body: { rating },
      }),
      // --- FIX IS HERE ---
      // Invalidate both the specific Model and the list of ClinicianTypes
      invalidatesTags: (result, error, arg) => [
        { type: 'Model', id: arg.ai_model_id },
        'ClinicianType',
      ],
    }),
    addComment: builder.mutation({
      query: ({ ai_model_id, comment }) => ({
        url: `/ai_models/${ai_model_id}/comments`,
        method: 'POST',
        body: { comment },
      }),
      // --- AND HERE ---
      // Also apply the same logic to comments for consistency
      invalidatesTags: (result, error, arg) => [
        { type: 'Model', id: arg.ai_model_id },
        'ClinicianType',
      ],
    }),
  }),
});

export const {
  useGetClinicianTypesQuery,
  useGetAiModelByIdQuery,
  useAddRatingMutation,
  useAddCommentMutation,
} = apiSlice;