import { describe, test, expect } from '@jest/globals';
import {
  ingredientsReducer,
  fetchIngredients,
  initialState,
} from '@slices/ingredientsSlice';

import { mockItems, mockBun } from './test-data';

// __________________________________________________________
describe('Проверка редьюсера: ingredients', () => {
  test('возвращает initialState при неизвестном экшене', () => {
    // state = undefined — начальное состояние при инициализации.
    // UNKNOWN-экшен не меняет state — редьюсер вернёт initialState.
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  // _______________________
  describe('fetchIngredients', () => {
    test('pending: включает isLoading и сбрасывает error', () => {
      const stateBefore = { ...initialState, error: { message: 'Старая ошибка' } }; // до: в состоянии осталась ошибка от прошлого запроса
      const action = fetchIngredients.pending('test-id', undefined); // запрос начался
      const stateAfter = ingredientsReducer(stateBefore, action);

      // после: идёт загрузка, старая ошибка стёрта
      expect(stateAfter.isLoading).toBe(true);
      expect(stateAfter.error).toBeNull();
    });

    test('fulfilled: выключает isLoading и сохраняет ингредиенты', () => {
      const stateBefore = { ...initialState, isLoading: true }; // до: идёт загрузка
      const action = fetchIngredients.fulfilled(mockItems, 'test-id', undefined); // данные пришли
      const stateAfter = ingredientsReducer(stateBefore, action);

      // после: ингредиенты сохранены, загрузка выключена, ошибки нет
      expect(stateAfter).toEqual({
        items: mockItems,
        isLoading: false,
        error: null,
      });
      // вход не мутирован — редьюсер вернул новое состояние, а не изменил старое
      expect(stateBefore.items).toEqual([]);
    });

    test('rejected: сохраняет error, выключает isLoading, не трогает items', () => {
      const stateBefore = { ...initialState, items: [mockBun], isLoading: true }; // до: один ингредиент уже загружен, идёт загрузка
      const error = new Error('Произошла ошибка загрузки данных');
      const action = fetchIngredients.rejected(error, 'test-id', undefined); // запрос упал
      const stateAfter = ingredientsReducer(stateBefore, action);

      // после: items не тронут, загрузка выключена, ошибка сохранена
      expect(stateAfter).toEqual({
        items: [mockBun],
        isLoading: false,
        error: action.error,
      });
      // проверяем, что текст ошибки совпадает с переданным
      expect(action.error.message).toBe('Произошла ошибка загрузки данных');
    });
  });
});
