import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial state for claims slice
 */
const initialState = {
  selectedClaim: null,
  assignmentStatus: null,
};

/**
 * Claims slice
 */
const claimsSlice = createSlice({
  name: 'claims',
  initialState,
  reducers: {
    setSelectedClaim: (state, action) => {
      state.selectedClaim = action.payload;
      state.assignmentStatus = action.payload?.assignment_status || null;
    },
    clearSelectedClaim: (state) => {
      state.selectedClaim = null;
      state.assignmentStatus = null;
    },
    updateAssignmentStatus: (state, action) => {
      state.assignmentStatus = action.payload;
      if (state.selectedClaim) {
        state.selectedClaim.assignment_status = action.payload;
      }
    },
  },
});

// Export actions
export const { setSelectedClaim, clearSelectedClaim, updateAssignmentStatus } = claimsSlice.actions;

// Selectors
export const selectSelectedClaim = (state) => state.claims.selectedClaim;
export const selectAssignmentStatus = (state) => state.claims.assignmentStatus;

// Export reducer
export default claimsSlice.reducer;
