import { Modal, OrderInfo, IngredientDetails } from '@components';
import { useParams } from 'react-router-dom';

import styles from './app.module.css';

// Страница для F5 на /ingredients/:id — оборачивает IngredientDetails в <main>+<h1>
export const IngredientDetailsPage = (): React.JSX.Element => (
  <main className={styles.detailPageWrap}>
    <h1 className={`${styles.detailHeader} text text_type_main-large`}>
      Детали ингредиента
    </h1>
    <IngredientDetails />
  </main>
);

// Страница для F5 на /feed/:number и /profile/orders/:number — оборачивает OrderInfo
export const OrderDetailsPage = (): React.JSX.Element => {
  const { number } = useParams();

  return (
    <main className={styles.detailPageWrap}>
      <h1 className={`${styles.detailHeader} text text_type_digits-default`}>
        #{String(number ?? '').padStart(6, '0')}
      </h1>
      <OrderInfo />
    </main>
  );
};

// Модалка для заказов — читает number из URL, собирает title, переиспользуется в 2 местах
export const OrderModal = ({ onClose }: { onClose: () => void }): React.JSX.Element => {
  const { number } = useParams();

  return (
    <Modal title={`#${String(number ?? '').padStart(6, '0')}`} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};
