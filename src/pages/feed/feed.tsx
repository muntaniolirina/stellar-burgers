import { getFeeds, selectFeedOrders, selectFeedLoading } from '@slices/feedSlice';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { useSelector, useDispatch } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const isLoading = useSelector(selectFeedLoading);

  useEffect(() => {
    void dispatch(getFeeds()); // грузим ленту при входе на страницу
  }, [dispatch]);

  const handleGetFeeds = (): void => {
    void dispatch(getFeeds()); // кнопка "Обновить" — повторный запрос
  };

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
