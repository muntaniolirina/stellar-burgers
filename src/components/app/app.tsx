import { AppHeader } from '@components';
import { useEffect } from 'react';

import {
  fetchIngredients,
  selectError,
  selectIngredients,
  selectIsLoading,
} from '@services/slices/ingredientsSlice';
import { checkUserAuth } from '@services/slices/userSlice';
import { useDispatch, useSelector } from '@services/store';

import { AppContent } from './app-content';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIsLoading);
  const ingredientsError = useSelector(selectError);

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError}
      />
    </div>
  );
};

export default App;
