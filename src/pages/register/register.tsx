import {
  clearUserError,
  registerUser,
  selectRegisterUserError,
} from '@slices/userSlice';
import { RegisterUI } from '@ui-pages';
import { useEffect, type SyntheticEvent, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const registerError = useSelector(selectRegisterUserError);

  // очистка ошибки при монтировании формы
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    void dispatch(registerUser({ name: userName, email, password }))
      .unwrap()
      .catch(() => undefined);
  };

  return (
    <RegisterUI
      errorText={registerError?.message ?? ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
