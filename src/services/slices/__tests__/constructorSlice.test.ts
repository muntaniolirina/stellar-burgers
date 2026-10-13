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

// __________________________________________________________
describe('Проверка редьюсера: burgerConstructor', () => {
  test('возвращает initialState при неизвестном экшене', () => {
    // state = undefined — так Redux задаёт начальное состояние при инициализации.
    // UNKNOWN-экшен не должен менять state — редьюсер вернёт initialState.
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(constructorState);
  });

  // _______________________
  describe('addIngredient', () => {
    test('сохраняет булку в state.bun', () => {
      const stateBefore = constructorState; // до: конструктор пуст
      const action = addIngredient(mockBun);
      const stateAfter = constructorReducer(stateBefore, action);

      // id генерируется внутри редьюсера, поэтому проверяем только тип,
      // а остальные поля булки должны совпасть с mockBun.
      expect(stateAfter.bun).toEqual({
        ...mockBun,
        id: expect.any(String),
      });
    });

    test('заменяет старую булку на новую', () => {
      const stateBefore = { ...constructorState, bun: constructorBun }; // до: в конструкторе уже лежит булка
      const action = addIngredient(mockBun);
      const stateAfter = constructorReducer(stateBefore, action);

      // после: булка заменена на новую
      expect(stateAfter.bun).toEqual({
        ...mockBun,
        id: expect.any(String),
      });

      // id другой — значит создана новая запись, а не переиспользована старая.
      expect(stateAfter.bun?.id).not.toBe(constructorBun.id);
    });

    test('добавляет начинку в конец списка', () => {
      const stateBefore = constructorState;
      const action = addIngredient(mockMain);
      const stateAfter = constructorReducer(stateBefore, action);

      // после: в ingredients один элемент — начинка с новым id
      expect(stateAfter.ingredients).toHaveLength(1);
      expect(stateAfter.ingredients[0]).toEqual({
        ...mockMain,
        id: expect.any(String),
      });
      // начинка не задевает булку
      expect(stateAfter.bun).toBeNull();
    });

    test('добавляет несколько начинок в порядке добавления', () => {
      const stateBefore = constructorState;

      // действие 1: добавляем начинку; действие 2: добавляем соус
      const afterFirst = constructorReducer(stateBefore, addIngredient(mockMain));
      const afterSecond = constructorReducer(afterFirst, addIngredient(mockSauce));

      // после: два элемента, порядок — как добавляли
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
      // дважды добавляем один и тот же mockMain
      const afterFirst = constructorReducer(constructorState, addIngredient(mockMain));
      const afterSecond = constructorReducer(afterFirst, addIngredient(mockMain));

      // после: две записи с одним _id (тот же ингредиент)...
      expect(afterSecond.ingredients).toHaveLength(2);
      expect(afterSecond.ingredients[0]._id).toBe(mockMain._id);
      expect(afterSecond.ingredients[1]._id).toBe(mockMain._id);
      // ...но разными id — значит это две разные позиции в конструкторе.
      expect(afterSecond.ingredients[0].id).not.toBe(afterSecond.ingredients[1].id);
    });
  });

  // _______________________
  describe('removeIngredient', () => {
    test('удаляет начинку по id', () => {
      const stateBefore = completedConstructor; // до: булка + две начинки
      const action = removeIngredient(constructorMain.id); // удаляем начинку по её id
      const stateAfter = constructorReducer(stateBefore, action);

      // после: остаётся одна начинка — соус
      expect(stateAfter.ingredients).toHaveLength(1);
      expect(stateAfter.ingredients[0]).toEqual(constructorSauce);
      expect(stateAfter.ingredients).not.toContainEqual(constructorMain);
    });

    test('не меняет состояние при неизвестном id', () => {
      const stateBefore = completedConstructor;
      const action = removeIngredient('несуществующий-id'); // id, которого нет
      const stateAfter = constructorReducer(stateBefore, action);

      // после: состояние равно исходному, обе начинки на месте
      expect(stateAfter).toEqual(stateBefore);
      expect(stateAfter.ingredients).toHaveLength(2);
    });
  });

  // _______________________
  describe('moveIngredient', () => {
    test('меняет порядок начинок местами (0 -> 1)', () => {
      const stateBefore = completedConstructor; // до: [main, sauce]
      const action = moveIngredient({ fromIndex: 0, toIndex: 1 }); // меняем местами
      const stateAfter = constructorReducer(stateBefore, action);

      // после: [sauce, main]
      expect(stateAfter.ingredients).toHaveLength(2);
      expect(stateAfter.ingredients[0]).toEqual(constructorSauce);
      expect(stateAfter.ingredients[1]).toEqual(constructorMain);
    });

    test('меняет порядок начинок наоборот (1 -> 0)', () => {
      const stateBefore = completedConstructor; // до: [main, sauce]
      const action = moveIngredient({ fromIndex: 1, toIndex: 0 }); // обратное направление
      const stateAfter = constructorReducer(stateBefore, action);

      // после: тот же результат — [sauce, main]
      expect(stateAfter.ingredients[0]).toEqual(constructorSauce);
      expect(stateAfter.ingredients[1]).toEqual(constructorMain);
    });
  });

  // _______________________
  describe('clearConstructor', () => {
    test('полностью очищает конструктор', () => {
      const stateBefore = completedConstructor; // до: булка + две начинки
      const action = clearConstructor();
      const stateAfter = constructorReducer(stateBefore, action);

      // после: состояние равно initialState — конструктор пуст
      expect(stateAfter).toEqual(constructorState);
      expect(stateAfter.bun).toBe(null);
      expect(stateAfter.ingredients).toHaveLength(0);
    });
  });

  // _______________________
  describe('createOrder', () => {
    test('fulfilled: очищает конструктор после успешного заказа', () => {
      const stateBefore = completedConstructor; // до: бургер собран

      // fulfilled — успешное завершение асинхронного экшена createOrder.
      // Это extraReducers, но эффект проверяется здесь: заказ очищает конструктор.
      const action = createOrder.fulfilled(mockOrder, 'test-id', [
        'bun-test',
        'main-test',
        'sauce-test',
      ]);
      const stateAfter = constructorReducer(stateBefore, action);

      // после: конструктор пуст
      expect(stateAfter).toEqual(constructorState);
      expect(stateAfter.bun).toBeNull();
      expect(stateAfter.ingredients).toHaveLength(0);
    });
  });
});
