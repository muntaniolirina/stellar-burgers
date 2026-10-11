import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import { createOrder } from '@slices/orderSlice';

import type {
  TIngredient,
  TConstructorIngredient,
  TConstructorState,
} from '@utils-types';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

// --- Slice ---
export const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload; // булка заменит старую
        } else {
          state.ingredients.push(action.payload); // начинка в конец
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() }, // добавляем уникальный id
      }),
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((i) => i.id !== action.payload);
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const [ingredient] = state.ingredients.splice(fromIndex, 1); // вырезали
      if (ingredient) {
        state.ingredients.splice(toIndex, 0, ingredient); // вставили на новое место
      }
    },
    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    },
  },
  selectors: {
    selectConstructorItems: (state) => state,
  },
  extraReducers: (builder) => {
    // после успешного заказа — очищаем конструктор
    builder.addCase(createOrder.fulfilled, () => ({ ...initialState }));
  },
});

export const { addIngredient, removeIngredient, moveIngredient, clearConstructor } =
  constructorSlice.actions;
export const { selectConstructorItems } = constructorSlice.selectors;
export const constructorReducer = constructorSlice.reducer;
