// client/src/features/ui/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedSpecialtyId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    specialtySelected(state, action) {
      state.selectedSpecialtyId = action.payload;
    },
  },
});

export const { specialtySelected } = uiSlice.actions;

export default uiSlice.reducer;