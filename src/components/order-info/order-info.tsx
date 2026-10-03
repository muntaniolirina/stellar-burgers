import { selectFeedOrders, selectProfileOrders } from '@slices/feedSlice';
import { selectIngredients } from '@slices/ingredientsSlice';
import {
  getOrderByNumber,
  selectCurrentOrder,
  clearCurrentOrder,
} from '@slices/orderSlice';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = Number(number); // из строки в число

  // Справочник ингредиентов — нужен для состава и подсчёта суммы
  const ingredients = useSelector(selectIngredients);

  // Заказы, которые уже лежат в сторе (лента / история профиля)
  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);

  // Заказ, который подтянули с сервера по номеру (прямой заход / F5)
  const requestedOrder = useSelector(selectCurrentOrder);

  // Ищем заказ по приоритету источников:
  // 1) он уже в ленте  2) он уже в истории  3) остался только запрос по номеру
  const orderData =
    feedOrders.find((item) => item.number === orderNumber) ??
    profileOrders.find((item) => item.number === orderNumber) ??
    (requestedOrder?.number === orderNumber ? requestedOrder : null);

  // Запрос к серверу отправляем ТОЛЬКО если заказа нигде нет
  useEffect(() => {
    if (!orderData && Number.isFinite(orderNumber)) {
      void dispatch(getOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  // Чистим заказ из стора при уходе с модалки/страницы
  useEffect(() => {
    return (): void => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch]);

  // вычисляем данные для отображения (состав, дата, сумма)
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
