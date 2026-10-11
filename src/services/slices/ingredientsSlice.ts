import { getIngredientsApi } from '@api';
import { createSlice, createAsyncThunk, type SerializedError } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';

// --- Состояние ---
type TIngredientsState = {
  items: TIngredient[]; // список ингредиентов
  isLoading: boolean; // крутится ли лоадер (UX!)
  error: SerializedError | null; // текст ошибки, если упало
};

// --- Начальное состояние ---
const initialState: TIngredientsState = {
  items: [],
  isLoading: false,
  error: null,
};

// --- асинхронный экшен Thunk ---
export const fetchIngredients = createAsyncThunk('ingredients/fetchAll', async () =>
  getIngredientsApi()
);

// --- Slice ---
export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {}, // нет локальных экшенов, изменения через thunk
  selectors: {
    selectIngredients: (state) => state.items,
    selectIsLoading: (state) => state.isLoading,
    selectError: (state) => state.error,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      });
  },
});

export const { selectIngredients, selectIsLoading, selectError } =
  ingredientsSlice.selectors;
export const ingredientsReducer = ingredientsSlice.reducer; // для rootReducer
