import { describe, test, expect } from '@jest/globals';
import {
  ingredientsReducer,
  fetchIngredients,
  initialState,
} from '@slices/ingredientsSlice';

import { mockItems, mockBun } from './test-data';

describe('Проверка редьюсера: ingredients', () => {
  test('возвращает initialState при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  // ───────────────────────────────────────────
  describe('fetchIngredients', () => {
    test('pending: включает isLoading и сбрасывает error', () => {
      const stateBefore = { ...initialState, error: { message: 'Старая ошибка' } };
      const action = fetchIngredients.pending('test-id', undefined);
      const stateAfter = ingredientsReducer(stateBefore, action);

      expect(stateAfter.isLoading).toBe(true);
      expect(stateAfter.error).toBeNull();
    });

    test('fulfilled: выключает isLoading и сохраняет ингредиенты', () => {
      const stateBefore = { ...initialState, isLoading: true };
      const action = fetchIngredients.fulfilled(mockItems, 'test-id', undefined);
      const stateAfter = ingredientsReducer(stateBefore, action);

      expect(stateAfter).toEqual({
        items: mockItems,
        isLoading: false,
        error: null,
      });
      expect(stateBefore.items).toEqual([]); // вход не мутирован
    });

    test('rejected: сохраняет error, выключает isLoading, не трогает items', () => {
      const stateBefore = { ...initialState, items: [mockBun], isLoading: true };
      const error = new Error('Произошла ошибка загрузки данных');
      const action = fetchIngredients.rejected(error, 'test-id', undefined);
      const stateAfter = ingredientsReducer(stateBefore, action);

      expect(stateAfter).toEqual({
        items: [mockBun],
        isLoading: false,
        error: action.error,
      });
      expect(action.error.message).toBe('Произошла ошибка загрузки данных');
    });
  });
});
