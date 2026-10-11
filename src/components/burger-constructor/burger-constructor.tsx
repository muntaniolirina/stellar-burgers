import { selectConstructorItems } from '@slices/constructorSlice';
import {
  createOrder,
  selectOrderRequest,
  selectOrderModalData,
  clearOrderModal,
} from '@slices/orderSlice';
import { selectUser } from '@slices/userSlice';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);
  const user = useSelector(selectUser);

  const onOrderClick = (): void => {
    // 1. Сначала проверяем авторизацию
    if (!user) {
      void navigate('/login', { state: { from: location } });
      return;
    }
    // 2. Потом — есть ли булка / не идёт ли запрос
    if (!constructorItems.bun || orderRequest) return;

    // Собираем массив _id: булка (дважды!) + начинки
    const ingredientIds = [
      constructorItems.bun._id, // верх
      ...constructorItems.ingredients.map((ingredient) => ingredient._id),
      constructorItems.bun._id, // низ
    ];

    void dispatch(createOrder(ingredientIds));
  };

  const closeOrderModal = (): void => {
    dispatch(clearOrderModal());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
