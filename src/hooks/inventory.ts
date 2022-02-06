import { useContext } from 'react';
import InventoryContext from '../contexts/InventoryContext';
import { ImageFormData, Item, ItemImage } from '../types/API';
import API from '../util/API';
import { AtLeast } from '../util/types';

type ImageUploadParams = ImageFormData & {
  /**
   * The image ID is omitted here because we won't know the image
   * ID util we get a response from the server
   */
  image: Omit<ItemImage, 'ID'>;
  itemId: number;
};

type UseInventoryHook = {
  items: Item[];
  setItems: (item: Item[]) => void;
  updateItem: (item: AtLeast<Item, 'ID'>) => Promise<void>;
  getItem: (id: number) => Item | undefined;
  deleteImage: (itemId: number, imageId: number) => Promise<void>;
  getImages: (itemId: number) => ItemImage[];
  uploadImage: (params: ImageUploadParams) => Promise<void>;
  deleteItem: (itemId: number) => Promise<void>;
  addItem: (item: Item) => Promise<void>;
  addChildItem: (parentId: number, item: Item) => Promise<void>;
};

/**
 * This hook servers as a utility and a wrapper around the inventory API.
 * This helps components make requests to the API and keeps track of a
 * global inventory state.
 *
 * @example
 *
 *```
 * const inventory = useInventory();
 *
 * const getImagesForItem = (itemId: number) => {
 *   const images = inventory.getImages(itemId);
 *   // Do something with the images...
 * }
 *```
 */
const useInventory = (): UseInventoryHook => {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error(
      `Invalid hook call for useInventory(). Hooks can only be called
      inside of the body of a function component.`
    );
  }

  const { state, dispatch } = context;

  const setItems = (item: Item[]) => {
    dispatch({
      type: 'SET_ITEMS',
      payload: item
    });
  };

  const updateItem = async (item: AtLeast<Item, 'ID'>) => {
    await API.updateItem(item);

    dispatch({
      type: 'UPDATE_ITEM',
      payload: item
    });
  };

  const getItem = (itemId: number): Item | undefined => {
    const item = state.find(item => item.ID === itemId);

    if (item) {
      return item;
    }

    // If the item couldn't be found, try to look through all the children.
    return state.flatMap(item => item.children).find(child => child?.ID === itemId);
  };

  const deleteImage = async (itemId: number, imageId: number) => {
    await API.deleteImage(imageId);

    dispatch({
      type: 'DELETE_IMAGE',
      payload: {
        itemId,
        imageId
      }
    });
  };

  const getImages = (itemId: number): ItemImage[] => getItem(itemId)?.images || [];

  const uploadImage = async ({
    itemId,
    image,
    name,
    base64ImageData
  }: ImageUploadParams): Promise<void> => {
    const response = await API.uploadImage(itemId, {
      base64ImageData,
      name
    });

    dispatch({
      type: 'ADD_IMAGE',
      payload: {
        itemId,
        image: {
          ...image,
          ID: response.imageID
        }
      }
    });
  };

  const deleteItem = async (itemId: number) => {
    await API.deleteItem(itemId);

    dispatch({
      type: 'DELETE_ITEM',
      payload: itemId
    });
  };

  const addItem = async (item: Item) => {
    // TODO: Make API call here
    dispatch({
      type: 'ADD_ITEM',
      payload: item
    });
  };

  const addChildItem = async (parentId: number, item: Item): Promise<void> => {
    // TODO: Make API call here
    dispatch({
      type: 'ADD_CHILD_ITEM',
      payload: {
        parentId,
        item
      }
    });
  };

  return {
    items: state,
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
