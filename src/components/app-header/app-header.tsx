import { selectUser } from '@slices/userSlice';
import { AppHeaderUI } from '@ui';

import { useSelector } from '@services/store';

export const AppHeader = (): React.JSX.Element => {
  // имя пользователя из хранилища
  const user = useSelector(selectUser);
  const userName = user?.name;

  return <AppHeaderUI userName={userName} />;
};
