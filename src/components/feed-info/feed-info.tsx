import {
  selectFeedOrders,
  selectFeedTotal,
  selectFeedTotalToday,
  selectFeedLoading,
  selectFeedError,
} from '@slices/feedSlice';
import { FeedInfoUI } from '@ui';

import { useSelector } from '@services/store';

import type { TFeedState, TOrder } from '@utils-types';

// Утилита: фильтрует заказы по статусу и берёт номера первых 20
const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status) // оставляем только нужный статус
    .map((item) => item.number) // берём номера заказов
    .slice(0, 20);

export const FeedInfo = (): React.JSX.Element => {
  // ── Берём данные из стора через селекторы  ──
  const orders = useSelector(selectFeedOrders);
  const total = useSelector(selectFeedTotal);
  const totalToday = useSelector(selectFeedTotalToday);
  const isLoading = useSelector(selectFeedLoading);
  const error = useSelector(selectFeedError);

  // ── Собираем объект feed для FeedInfoUI ──
  const feed: TFeedState = {
    orders,
    total,
    totalToday,
    isLoading,
    error,
  };

  const readyOrders = getOrders(orders, 'done');

  const pendingOrders = getOrders(orders, 'pending');

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
