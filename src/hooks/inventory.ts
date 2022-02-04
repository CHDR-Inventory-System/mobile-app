import { useContext } from 'react';
import InventoryContext, { InventoryContextType } from '../contexts/InventoryContext';
import { Item, ItemImage } from '../types/API';
import { AtLeast } from '../util/types';

type UseInventoryHook = InventoryContextType & {
  setItems: (item: Item[]) => void;
  updateItem: (item: AtLeast<Item, 'ID'>) => Promise<void>;
  getItem: (id: number) => Item | undefined;
  deleteImage: (itemId: number, imageId: number) => Promise<void>;
  getImages: (itemId: number) => ItemImage[];
  uploadImage: (itemId: number, image: ItemImage) => Promise<void>;
  deleteItem: (itemId: number) => Promise<void>;
  addItem: (item: Item) => Promise<void>;
  addChildItem: (parentId: number, item: Item) => Promise<void>;
};

const useInventory = (): UseInventoryHook => {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error(
      `Invalid hook call for useInventory(). Hooks can only be called
      inside of the body of a function component.`
    );
  }

  const setItems = (item: Item[]) => {
    context.dispatch({
      type: 'SET_ITEMS',
      payload: item
    });
  };

  const updateItem = async (item: AtLeast<Item, 'ID'>) => {
    // TODO: Make API call here
    context.dispatch({
      type: 'UPDATE_ITEM',
      payload: item
    });
  };

  const getItem = (itemId: number): Item | undefined => {
    const item = context.state.find(item => item.ID === itemId);

    if (item) {
      return item;
    }

    // If the item couldn't be found, try to look through all the children.
    return context.state
      .flatMap(item => item.children)
      .find(child => child?.ID === itemId);
  };

  const deleteImage = async (itemId: number, imageId: number) => {
    // TODO: Make API call here
    context.dispatch({
      type: 'DELETE_IMAGE',
      payload: {
        itemId,
        imageId
      }
    });
  };

  const getImages = (itemId: number): ItemImage[] => {
    const item = getItem(itemId);

    return item?.images || [];
  };

  const uploadImage = async (itemId: number, image: ItemImage): Promise<void> => {
    // TODO: Make API call here
    context.dispatch({
      type: 'ADD_IMAGE',
      payload: {
        itemId,
        image
      }
    });
  };

  const deleteItem = async (itemId: number) => {
    // TODO: Make API call here
    context.dispatch({
      type: 'DELETE_ITEM',
      payload: itemId
    });
  };

  const addItem = async (item: Item) => {
    // TODO: Make API call here
    context.dispatch({
      type: 'ADD_ITEM',
      payload: item
    });
  };

  const addChildItem = async (parentId: number, item: Item): Promise<void> => {
    // TODO: Make API call here
    context.dispatch({
      type: 'ADD_CHILD_ITEM',
      payload: {
        parentId,
        item
      }
    });
  };

  return {
    ...context,
    setItems,
    updateItem,
    getItem,
    deleteImage,
    getImages,
    uploadImage,
    deleteItem,
    addItem,
    addChildItem
  };
};

export default useInventory;
