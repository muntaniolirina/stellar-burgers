import { describe, test, expect } from '@jest/globals';
import {
  constructorReducer,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  initialState as constructorState,
} from '@slices/constructorSlice';
import { createOrder } from '@slices/orderSlice';

import {
  completedConstructor,
  mockBun,
  mockMain,
  mockSauce,
  constructorBun,
  constructorMain,
  constructorSauce,
  mockOrder,
} from './test-data';

describe('Проверка редьюсера: burgerConstructor', () => {
  test('возвращает initialState при неизвестном экшене', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(constructorState);
  });

  // ───────────────────────────────────────────
  describe('addIngredient', () => {
    test('сохраняет булку в state.bun', () => {
      const stateBefore = constructorState;
      const action = addIngredient(mockBun);
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter.bun).toEqual({
        ...mockBun,
        id: expect.any(String),
      });
    });

    test('заменяет старую булку на новую', () => {
      const stateBefore = { ...constructorState, bun: constructorBun };
      const action = addIngredient(mockBun);
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter.bun).toEqual({
        ...mockBun,
        id: expect.any(String),
      });
      expect(stateAfter.bun?.id).not.toBe(constructorBun.id);
    });

    test('добавляет начинку в конец списка', () => {
      const stateBefore = constructorState;
      const action = addIngredient(mockMain);
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter.ingredients).toHaveLength(1);
      expect(stateAfter.ingredients[0]).toEqual({
        ...mockMain,
        id: expect.any(String),
      });
      expect(stateAfter.bun).toBeNull();
    });

    test('добавляет несколько начинок в порядке добавления', () => {
      const stateBefore = constructorState;
      const afterFirst = constructorReducer(stateBefore, addIngredient(mockMain));
      const afterSecond = constructorReducer(afterFirst, addIngredient(mockSauce));

      expect(afterSecond.ingredients).toHaveLength(2);
      expect(afterSecond.ingredients[0]).toEqual({
        ...mockMain,
        id: expect.any(String),
      });
      expect(afterSecond.ingredients[1]).toEqual({
        ...mockSauce,
        id: expect.any(String),
      });
    });

    test('даёт разные id двум одинаковым ингредиентам', () => {
      const afterFirst = constructorReducer(constructorState, addIngredient(mockMain));
      const afterSecond = constructorReducer(afterFirst, addIngredient(mockMain));

      expect(afterSecond.ingredients).toHaveLength(2);
      expect(afterSecond.ingredients[0]._id).toBe(mockMain._id);
      expect(afterSecond.ingredients[1]._id).toBe(mockMain._id);
      expect(afterSecond.ingredients[0].id).not.toBe(afterSecond.ingredients[1].id);
    });
  });

  // ───────────────────────────────────────────
  describe('removeIngredient', () => {
    test('удаляет начинку по id', () => {
      const stateBefore = completedConstructor;
      const action = removeIngredient(constructorMain.id);
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter.ingredients).toHaveLength(1);
      expect(stateAfter.ingredients[0]).toEqual(constructorSauce);
      expect(stateAfter.ingredients).not.toContainEqual(constructorMain);
    });

    test('не меняет состояние при неизвестном id', () => {
      const stateBefore = completedConstructor;
      const action = removeIngredient('несуществующий-id');
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter).toEqual(stateBefore);
      expect(stateAfter.ingredients).toHaveLength(2);
    });
  });

  // ───────────────────────────────────────────
  describe('moveIngredient', () => {
    test('меняет порядок начинок местами (0 -> 1)', () => {
      const stateBefore = completedConstructor;
      const action = moveIngredient({ fromIndex: 0, toIndex: 1 });
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter.ingredients).toHaveLength(2);
      expect(stateAfter.ingredients[0]).toEqual(constructorSauce);
      expect(stateAfter.ingredients[1]).toEqual(constructorMain);
    });

    test('меняет порядок начинок наоборот (1 -> 0)', () => {
      const stateBefore = completedConstructor;
      const action = moveIngredient({ fromIndex: 1, toIndex: 0 });
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter.ingredients[0]).toEqual(constructorSauce);
      expect(stateAfter.ingredients[1]).toEqual(constructorMain);
    });
  });

  // ───────────────────────────────────────────
  describe('clearConstructor', () => {
    test('полностью очищает конструктор', () => {
      const stateBefore = completedConstructor;
      const action = clearConstructor();
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter).toEqual(constructorState);
      expect(stateAfter.bun).toBe(null);
      expect(stateAfter.ingredients).toHaveLength(0);
    });
  });

  // ───────────────────────────────────────────
  describe('createOrder', () => {
    test('fulfilled: очищает конструктор после успешного заказа', () => {
      const stateBefore = completedConstructor;
      const action = createOrder.fulfilled(mockOrder, 'test-id', [
        'bun-test',
        'main-test',
        'sauce-test',
      ]);
      const stateAfter = constructorReducer(stateBefore, action);

      expect(stateAfter).toEqual(constructorState);
      expect(stateAfter.bun).toBeNull();
      expect(stateAfter.ingredients).toHaveLength(0);
    });
  });
});
