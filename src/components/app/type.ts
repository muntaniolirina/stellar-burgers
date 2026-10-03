import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';
import type { Location } from 'react-router-dom';

export type AppContentProps = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

/** Данные, которые передаются через navigate(..., { state }) */
export type TLocationState = {
  background?: Location;
};
