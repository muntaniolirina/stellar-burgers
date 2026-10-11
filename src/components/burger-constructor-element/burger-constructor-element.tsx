import { removeIngredient, moveIngredient } from '@slices/constructorSlice';
import { BurgerConstructorElementUI } from '@ui';
import { memo } from 'react';

import { useDispatch } from '@services/store';

import type { BurgerConstructorElementProps } from './type';

export const BurgerConstructorElement = memo(function BurgerConstructorElement({
  ingredient,
  index,
  totalItems,
}: BurgerConstructorElementProps): React.JSX.Element {
  const dispatch = useDispatch();

  const handleMoveDown = (): void => {
    // защита от ухода за низ
    if (index < totalItems - 1) {
      dispatch(moveIngredient({ fromIndex: index, toIndex: index + 1 }));
    }
  };

  const handleMoveUp = (): void => {
    // защита от ухода за верх
    if (index > 0) {
      dispatch(moveIngredient({ fromIndex: index, toIndex: index - 1 }));
    }
  };

  const handleClose = (): void => {
    dispatch(removeIngredient(ingredient.id)); // по локальному id
  };

  return (
    <BurgerConstructorElementUI
      ingredient={ingredient}
      index={index}
      totalItems={totalItems}
      handleMoveUp={handleMoveUp}
      handleMoveDown={handleMoveDown}
      handleClose={handleClose}
    />
  );
});
