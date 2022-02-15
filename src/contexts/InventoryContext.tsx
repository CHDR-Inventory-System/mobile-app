import React from 'react';
import { createContext, useReducer } from 'react';
import inventoryReducer, { InventoryAction } from '../reducers/inventory';
import { Item } from '../types/API';

export type InventoryContextType = {
  state: Item[];
  dispatch: React.Dispatch<InventoryAction>;
};

type InventoryProviderProps = {
  children: React.ReactNode;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const InventoryProvider = ({ children }: InventoryProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(inventoryReducer, []);

  return (
    <InventoryContext.Provider value={{ state, dispatch }}>
      {children}
    </InventoryContext.Provider>
  );
};

export { InventoryContext as default, InventoryProvider };
