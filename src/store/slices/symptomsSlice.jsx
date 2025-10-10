import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import claimsService from '../../services/claimsService'

/**
 * Initial state for symptoms slice
 */
const initialState = {
  results: [],
  loading: false,
  error: null,
  query: '',
  // selectedSymptoms: [
  //   'Severe abdominal pain',
  //   'Nausea and vomiting'
  // ],
    selectedSymptoms: [],
}

/**
 * Async thunk for searching symptoms
 */
export const searchSymptoms = createAsyncThunk(
  'symptoms/searchSymptoms',
  async ({ query, page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      console.log('Searching symptoms:', query)
      const response = await claimsService.searchSymptoms(query, page, pageSize)
      return {
        results: response.results || response || [],
        query,
      }
    } catch (error) {
      console.error('Symptoms search error:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search symptoms'
      )
    }
  }
)

/**
 * Symptoms slice
 */
const symptomsSlice = createSlice({
  name: 'symptoms',
  initialState,
  reducers: {
    // Clear search results
    clearResults: (state) => {
      state.results = []
      state.query = ''
      state.error = null
    },

    // Set search query
    setQuery: (state, action) => {
      state.query = action.payload
    },

    // Add selected symptom
    addSelectedSymptom: (state, action) => {
      const symptomText = typeof action.payload === 'string'
        ? action.payload
        : action.payload.text || action.payload.name

      if (!state.selectedSymptoms.includes(symptomText)) {
        state.selectedSymptoms.push(symptomText)
      }
    },

    // Remove selected symptom
    removeSelectedSymptom: (state, action) => {
      state.selectedSymptoms = state.selectedSymptoms.filter(
        (s) => s !== action.payload
      )
    },

    // Clear all selected symptoms
    clearSelectedSymptoms: (state) => {
      state.selectedSymptoms = []
    },

    // Set selected symptoms (replace all)
    setSelectedSymptoms: (state, action) => {
      state.selectedSymptoms = action.payload
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Search symptoms
    builder
      .addCase(searchSymptoms.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchSymptoms.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload.results
        state.query = action.payload.query
        state.error = null
      })
      .addCase(searchSymptoms.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.results = []
      })
  },
})

// Export actions
export const {
  clearResults,
  setQuery,
  addSelectedSymptom,
  removeSelectedSymptom,
  clearSelectedSymptoms,
  setSelectedSymptoms,
  clearError,
} = symptomsSlice.actions

// Selectors
export const selectSymptomsResults = (state) => state.symptoms.results
export const selectSymptomsLoading = (state) => state.symptoms.loading
export const selectSymptomsError = (state) => state.symptoms.error
export const selectSymptomsQuery = (state) => state.symptoms.query
export const selectSelectedSymptoms = (state) => state.symptoms.selectedSymptoms

// Export reducer
export default symptomsSlice.reducer
