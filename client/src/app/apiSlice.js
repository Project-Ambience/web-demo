import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Model', 'ClinicianType', 'Conversation', 'Message'],
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
      invalidatesTags: (result, error, arg) => [
        { type: 'Model', id: arg.ai_model_id },
        'ClinicianType',
      ],
    }),
    getConversations: builder.query({
      query: () => '/conversations',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Conversation', id })),
        { type: 'Conversation', id: 'LIST' },
      ],
    }),
    getConversation: builder.query({
      query: id => `/conversations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Conversation', id }],
    }),
    createConversation: builder.mutation({
      query: (conversation) => ({
        url: '/conversations',
        method: 'POST',
        body: conversation,
      }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),
    updateConversation: builder.mutation({
      query: ({ id, conversation }) => ({
        url: `/conversations/${id}`,
        method: 'PATCH',
        body: { conversation },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Conversation', id: 'LIST' },
        { type: 'Conversation', id }
      ],
    }),
    deleteConversation: builder.mutation({
      query: (id) => ({
        url: `/conversations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),
    addMessage: builder.mutation({
      query: ({ conversation_id, message }) => {
        const formData = new FormData();
        formData.append('message[content]', message.content);
        
        if (message.file) {
          formData.append('message[file]', message.file);
        }
    
        return {
          url: `/conversations/${conversation_id}/messages`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: 'Conversation', id: arg.conversation_id }
      ],
    }),
    createFineTuneRequest: builder.mutation({
      query: (formData) => ({
        url: '/model_fine_tune_requests',
        method: 'POST',
        body: formData,
      }),
    }),
    acceptFeedback: builder.mutation({
      query: (id) => ({
        url: `/conversations/${id}/accept_feedback`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Conversation', id }]
    }),
    rejectFeedback: builder.mutation({
      query: (id) => ({
        url: `/conversations/${id}/reject_feedback`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Conversation', id }]
    }),
    getRabbitMQTraffic: builder.query({
      query: () => '/rabbitmq/traffic',
    }),
  }),
});

export const {
  useGetClinicianTypesQuery,
  useGetAiModelByIdQuery,
  useAddRatingMutation,
  useAddCommentMutation,
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
  useAddMessageMutation,
  useCreateFineTuneRequestMutation,
  useAcceptFeedbackMutation,
  useRejectFeedbackMutation,
  useGetRabbitMQTrafficQuery,
} = apiSlice;
