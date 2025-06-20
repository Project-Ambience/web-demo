import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedSpecialtyId: null,
  activeConversationId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    specialtySelected(state, action) {
      state.selectedSpecialtyId = action.payload;
    },
    conversationSelected(state, action) {
      state.activeConversationId = action.payload;
    },
  },
});

export const { specialtySelected, conversationSelected } = uiSlice.actions;

export default uiSlice.reducer;