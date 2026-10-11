import type {
  TIngredient,
  TConstructorIngredient,
  TConstructorState,
  TOrder,
} from '@/utils/types';

// -- Фейковые картинки --
// булка — зелёная
const bunImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="60"%3E%3Crect width="100" height="60" fill="%234CAF50"/%3E%3C/svg%3E';

// начинка — красная
const mainImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="60"%3E%3Crect width="100" height="60" fill="%23E53935"/%3E%3C/svg%3E';

// соус — жёлтая
const sauceImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="60"%3E%3Crect width="100" height="60" fill="%23FDD835"/%3E%3C/svg%3E';

export const mockBun: TIngredient = {
  _id: 'bun-test',
  name: 'Test bun',
  type: 'bun',
  proteins: 10,
  fat: 10,
  carbohydrates: 10,
  calories: 10,
  price: 10,
  image: bunImage,
  image_large: bunImage,
  image_mobile: bunImage,
};

export const mockMain: TIngredient = {
  _id: 'main-test',
  name: 'Test main',
  type: 'main',
  proteins: 20,
  fat: 20,
  carbohydrates: 20,
  calories: 20,
  price: 20,
  image: mainImage,
  image_large: mainImage,
  image_mobile: mainImage,
};

export const mockSauce: TIngredient = {
  _id: 'sauce-test',
  name: 'Test sauce',
  type: 'sauce',
  proteins: 30,
  fat: 30,
  carbohydrates: 30,
  calories: 30,
  price: 30,
  image: sauceImage,
  image_large: sauceImage,
  image_mobile: sauceImage,
};

export const mockItems: TIngredient[] = [mockBun, mockMain, mockSauce];

export const constructorBun: TConstructorIngredient = {
  ...mockBun,
  id: 'bun-constructor-id',
};
export const constructorMain: TConstructorIngredient = {
  ...mockMain,
  id: 'main-constructor-id',
};
export const constructorSauce: TConstructorIngredient = {
  ...mockSauce,
  id: 'sauce-constructor-id',
};

export const completedConstructor: TConstructorState = {
  bun: constructorBun,
  ingredients: [constructorMain, constructorSauce],
};

export const mockOrder: TOrder = {
  _id: 'order-test-id',
  status: 'done',
  name: 'Test order',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  number: 12345,
  ingredients: ['bun-test', 'main-test', 'sauce-test'],
};
