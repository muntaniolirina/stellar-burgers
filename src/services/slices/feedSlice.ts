import { getFeedsApi, getOrdersApi } from '@api';
import { createAsyncThunk, createSlice, type SerializedError } from '@reduxjs/toolkit';
import { createOrder } from '@slices/orderSlice';

import type { TOrder } from '@utils-types';

type TFeedState = {
  orders: TOrder[]; // заказы ленты (для /feed)
  total: number;
  totalToday: number;
  isLoading: boolean; // идёт ли загрузка ленты
  error: SerializedError | null;
  profileOrders: TOrder[]; // заказы пользователя (для /profile/orders)
  profileOrdersLoading: boolean; // идёт ли загрузка истории
  profileOrdersError: SerializedError | null;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: true, // при старте лента грузится, чтобы показать прелоадер
  error: null,
  profileOrders: [],
  profileOrdersLoading: true,
  profileOrdersError: null,
};

// --- Thunk: загрузка ленты всех заказов ---
// getFeedsApi() возвращает { orders, total, totalToday }
export const getFeeds = createAsyncThunk('feed/getFeeds', async () => getFeedsApi());

// --- Thunk: загрузка истории заказов пользователя ---
// getOrdersApi() возвращает просто TOrder[] (массив)
export const getProfileOrders = createAsyncThunk('feed/getProfileOrders', async () =>
  getOrdersApi()
);

// --- Slice ---
export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {}, // нет "локальных" редюсеров — только реакции на thunk'и
  selectors: {
    selectFeedOrders: (state) => state.orders,
    selectFeedTotal: (state) => state.total,
    selectFeedTotalToday: (state) => state.totalToday,
    selectFeedLoading: (state) => state.isLoading,
    selectFeedError: (state) => state.error,
    selectProfileOrders: (state) => state.profileOrders,
    selectProfileOrdersLoading: (state) => state.profileOrdersLoading,
    selectProfileOrdersError: (state) => state.profileOrdersError,
  },
  extraReducers: (builder) => {
    builder
      // ===== ЛЕНТА (getFeeds) =====
      .addCase(getFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      })
      // ===== ИСТОРИЯ (getProfileOrders) =====
      .addCase(getProfileOrders.pending, (state) => {
        state.profileOrdersLoading = true;
        state.profileOrdersError = null;
      })
      .addCase(getProfileOrders.fulfilled, (state, action) => {
        state.profileOrdersLoading = false;
        // getOrdersApi вернёт сразу массив TOrder[] (не объект!)
        state.profileOrders = action.payload;
      })
      .addCase(getProfileOrders.rejected, (state, action) => {
        state.profileOrdersLoading = false;
        state.profileOrdersError = action.error;
      })
      // ===== "РЕАЛТАЙМ" =====
      // Как только заказ успешно создан — кладём его в начало ленты и истории
      // и увеличиваем счётчики. Это имитирует обновление в реальном времени
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders = [action.payload, ...state.orders]; // action.payload = TOrder (сам заказ, без обёртки!)
        state.profileOrders = [action.payload, ...state.profileOrders];
        state.total += 1;
        state.totalToday += 1;
      });
  },
});

export const {
  selectFeedOrders,
  selectFeedTotal,
  selectFeedTotalToday,
  selectFeedLoading,
  selectFeedError,
  selectProfileOrders,
  selectProfileOrdersLoading,
  selectProfileOrdersError,
} = feedSlice.selectors;
export const feedReducer = feedSlice.reducer;
