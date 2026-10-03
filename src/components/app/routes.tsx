import { IngredientDetails, Modal, ProtectedRoute } from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { useLocation, useNavigate, Route, Routes } from 'react-router-dom';

import { IngredientDetailsPage, OrderDetailsPage, OrderModal } from './wrappers';

import type { TLocationState } from './type';

export const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as TLocationState | null;
  const background = locationState?.background;

  const onClose = (): void => {
    void navigate(-1);
  };

  return (
    <>
      {/* Routes №1: "фон" — страницы + страничные версии модалок (для F5) */}
      <Routes location={background ?? location}>
        {/*---- публичные ---- */}
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />

        {/* ---- страничные версии модалок (при прямом заходе) ---- */}
        <Route path="/feed/:number" element={<OrderDetailsPage />} />
        <Route path="/ingredients/:id" element={<IngredientDetailsPage />} />

        {/* ---- /profile — группировка под одним ProtectedRoute ---- */}
        <Route path="/profile" element={<ProtectedRoute />}>
          <Route index element={<Profile />} /> {/* /profile */}
          <Route path="orders" element={<ProfileOrders />} /> {/* /profile/orders */}
          <Route path="orders/:number" element={<OrderDetailsPage />} />
        </Route>

        {/* ---- только для НЕавторизованных ---- */}
        <Route element={<ProtectedRoute onlyUnAuth />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* ---- 404 ---- */}
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {/* Routes №2: модалки — рендерятся ТОЛЬКО если есть background */}
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={onClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route path="/feed/:number" element={<OrderModal onClose={onClose} />} />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderModal onClose={onClose} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
