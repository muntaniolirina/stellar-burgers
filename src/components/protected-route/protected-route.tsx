import { selectUser, selectIsAuthChecked } from '@slices/userSlice';
import { Preloader } from '@ui';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { ProtectedRouteProps } from './type';

// Тип состояния, которое передаём в Navigate (state={{ from: location }})
type TLocationState = {
  from?: { pathname?: string };
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children,
}: ProtectedRouteProps): React.JSX.Element => {
  const location = useLocation();

  // приводим state к нашему типу — TS не будет ругаться на from?.pathname
  const state = location.state as TLocationState | null;
  // если пользователь пришёл напрямую (без from) — вернём на главную
  const from = state?.from?.pathname ?? '/';

  const isAuthChecked = useSelector(selectIsAuthChecked);
  const user = useSelector(selectUser);

  // 1. проверка ещё идёт
  if (!isAuthChecked) {
    return <Preloader />;
  }

  // 2. неавторизован на защищённом роуте — запоминаем, откуда пришёл
  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. авторизован на роуте «для гостей» — возвращаем туда, откуда пришёл
  if (onlyUnAuth && user) {
    return <Navigate to={from} replace />;
  }

  // 4. доступ разрешён
  return children ?? <Outlet />;
};
