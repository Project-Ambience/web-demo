import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define our API using RTK Query
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }), 
  tagTypes: ['Model'], 
  endpoints: builder => ({
    // Endpoint for GET /api/clinician_types
    getClinicianTypes: builder.query({
      query: () => '/clinician_types',
      providesTags: ['Model'],
    }),
    // Endpoint for GET /api/ai_models/:id
    getAiModelById: builder.query({
      query: id => `/ai_models/${id}`,
      providesTags: (result, error, id) => [{ type: 'Model', id }],
    }),
    // Endpoint for POST /api/ai_models/:ai_model_id/ratings
    addRating: builder.mutation({
      query: ({ ai_model_id, rating }) => ({
        url: `/ai_models/${ai_model_id}/ratings`,
        method: 'POST',
        body: { rating },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Model', id: arg.ai_model_id }],
    }),
  }),
});

// Export the auto-generated hooks for use in components
export const { 
  useGetClinicianTypesQuery, 
  useGetAiModelByIdQuery,
  useAddRatingMutation,
} = apiSlice;