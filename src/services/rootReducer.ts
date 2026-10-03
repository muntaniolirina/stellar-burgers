import { combineReducers } from '@reduxjs/toolkit';
import { constructorReducer } from '@slices/constructorSlice'; // ← добавить
import { feedReducer } from '@slices/feedSlice';
import { ingredientsReducer } from '@slices/ingredientsSlice';
import { orderReducer } from '@slices/orderSlice';
import { userReducer } from '@slices/userSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  user: userReducer,
  burgerConstructor: constructorReducer,
  order: orderReducer,
  feed: feedReducer,
});
