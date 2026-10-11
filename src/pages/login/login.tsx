import { loginUser, selectLoginUserError, clearUserError } from '@slices/userSlice';
import { LoginUI } from '@ui-pages';
import { useEffect, type SyntheticEvent, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const loginError = useSelector(selectLoginUserError); // своя ошибка из стора

  // очистка ошибки при монтировании формы
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    void dispatch(loginUser({ email, password }))
      .unwrap()
      .catch(() => undefined);
  };

  return (
    <LoginUI
      errorText={loginError?.message ?? ''} // если ошибка есть показываем
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
