import { orderBurgerApi, getOrderByNumberApi } from '@api';
import { createSlice, createAsyncThunk, type SerializedError } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TOrderState = {
  orderRequest: boolean; // идёт ли запрос на создание заказа (для прелоадера в модалке)
  orderModalData: TOrder | null; // данные созданного заказа (для показа номера в модалке)
  currentOrder: TOrder | null; // для модалки/страницы заказа
  currentOrderLoading: boolean; // лоадер
  error: SerializedError | null; // ошибка создания заказа
};

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  currentOrder: null,
  currentOrderLoading: false,
  error: null,
};

// --- Thunk: создание заказа ---
// <TOrder, string[]>: payload = TOrder (сам заказ), аргумент = string[] (_id ингредиентов)
export const createOrder = createAsyncThunk<TOrder, string[]>(
  'order/createOrder',
  async (ingredientIds) => {
    const res = await orderBurgerApi(ingredientIds);
    return res.order; // отдаём наружу ТОЛЬКО заказ (TOrder)
  }
);

// ── Thunk: получить заказ по номеру ──
export const getOrderByNumber = createAsyncThunk<TOrder | null, number>(
  'order/getByNumber',
  async (number) => {
    const res = await getOrderByNumberApi(number);
    return res.orders[0] ?? null; // API отдаёт массив — берём первый
  }
);

// --- Slice ---
export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Закрытие модалки: чистим данные заказа, чтобы модалка не открылась снова
    clearOrderModal: (state) => {
      state.orderModalData = null;
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  selectors: {
    selectOrderRequest: (state) => state.orderRequest,
    selectOrderModalData: (state) => state.orderModalData,
    selectOrderError: (state) => state.error,
    selectCurrentOrder: (state) => state.currentOrder,
    selectCurrentOrderLoading: (state) => state.currentOrderLoading,
  },
  extraReducers: (builder) => {
    builder
      // Запрос начался: показываем прелоадер, чистим прошлую ошибку
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderModalData = null;
        state.error = null;
      })
      // Успех: сохраняем заказ и открываем модалку с номером
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload; // thunk вернул TOrder
      })
      // Ошибка: запрос завершён, сохраняем ошибку
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error;
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.currentOrderLoading = true;
        state.error = null;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.currentOrderLoading = false;
        state.error = action.error;
      });
  },
});

export const { clearOrderModal, clearCurrentOrder } = orderSlice.actions;
export const {
  selectOrderRequest,
  selectOrderModalData,
  selectOrderError,
  selectCurrentOrder,
  selectCurrentOrderLoading,
} = orderSlice.selectors;
export const orderReducer = orderSlice.reducer;
