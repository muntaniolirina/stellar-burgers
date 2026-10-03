import { logoutUser } from '@slices/userSlice';
import { ProfileMenuUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    void dispatch(logoutUser()) // запускаем асинхр экшн
      .unwrap()
      .then(() => {
        void navigate('/login', { replace: true }); // редирект на /login
      })
      .catch(() => undefined);
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
