export type ProtectedRouteProps = {
  onlyUnAuth?: boolean; // true → только для НЕавторизованных
  children?: React.ReactElement; // одиночный элемент
};
