import {
  getUserApi,
  loginUserApi,
  refreshToken,
  registerUserApi,
  updateUserApi,
  logoutApi,
  type TLoginData,
  type TRegisterData,
} from '@api';
import { createSlice, createAsyncThunk, type SerializedError } from '@reduxjs/toolkit';

import { setCookie, getCookie, deleteCookie } from '@utils/cookie';

import type { TUser } from '@utils-types';

// --- Состояние ---
type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean; // выполнена проверка токена?
  error: SerializedError | null; // ← для checkUserAuth
  loginUserRequest: boolean; // ← отдельно для login
  loginUserError: SerializedError | null; // ← ошибка логина
  registerUserRequest: boolean;
  registerUserError: SerializedError | null;
  updateUserError: SerializedError | null;
};

// --- Начальное состояние ---
const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  error: null,
  loginUserRequest: false,
  loginUserError: null,
  registerUserRequest: false,
  registerUserError: null,
  updateUserError: null,
};

// функция помощник, сохраняет токены
const saveTokens = (accessToken: string, refreshTokenValue: string): void => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshTokenValue);
};

// --- Thunk: проверка авторизации ---
export const checkUserAuth = createAsyncThunk<TUser | null, void>(
  'user/checkAuth',
  async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');

    // если токенов нет -> гость, возвращаем null
    if (!getCookie('accessToken') && !refreshTokenValue) {
      return null;
    }

    try {
      // accessToken протух, но refreshToken есть -> обновляем
      if (!getCookie('accessToken') && refreshTokenValue) {
        await refreshToken();
      }
      const response = await getUserApi();
      return response.user;
    } catch (error) {
      deleteCookie('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  }
);

// --- Thunk: вход ---
export const loginUser = createAsyncThunk<TUser, TLoginData>(
  'user/login',
  async (data) => {
    const res = await loginUserApi(data);
    // сохраняем токены
    saveTokens(res.accessToken, res.refreshToken);
    return res.user;
  }
);

// --- Thunk: региcтрация ---
export const registerUser = createAsyncThunk<TUser, TRegisterData>(
  'user/register',
  async (data) => {
    const res = await registerUserApi(data);
    // сохраняем токены
    saveTokens(res.accessToken, res.refreshToken);
    return res.user;
  }
);

// --- Thunk: обновление профиля
export const updateUser = createAsyncThunk<TUser, Partial<TRegisterData>>(
  'user/update',
  async (data) => {
    const res = await updateUserApi(data);
    return res.user;
  }
);

// --- Thunk: выход ---
export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
});

// --- Slice ---
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
      state.loginUserError = null;
      state.registerUserError = null;
      state.updateUserError = null;
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectUserError: (state) => state.error,
    selectLoginUserRequest: (state) => state.loginUserRequest,
    selectLoginUserError: (state) => state.loginUserError,
    selectRegisterUserRequest: (state) => state.registerUserRequest,
    selectRegisterUserError: (state) => state.registerUserError,
    selectUpdateUserError: (state) => state.updateUserError,
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.pending, (state) => {
        state.error = null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true; // проверили — залогинен
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginUserRequest = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.error;
      })
      .addCase(registerUser.pending, (state) => {
        state.registerUserRequest = true;
        state.registerUserError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerUserRequest = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerUserRequest = false;
        state.registerUserError = action.error;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload; // ← обновлённый user
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserError = action.error;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.error;
      });
  },
});

export const {
  selectUser,
  selectIsAuthChecked,
  selectUserError,
  selectLoginUserRequest,
  selectLoginUserError,
  selectRegisterUserRequest,
  selectRegisterUserError,
  selectUpdateUserError,
} = userSlice.selectors;

export const userReducer = userSlice.reducer;
export const { clearUserError } = userSlice.actions;
