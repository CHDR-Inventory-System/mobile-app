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
  readonly items: Readonly<Item[]>;
  /**
   * This should only need to be called once at the start of the application.
   * This makes an API call to fetch all inventory items and updates the state
   * with those items. For convenience, this method returns the response from
   * {@link API.getAllItems}
   */
  init: () => Promise<Item[]>;
  setItems: (items: Item[]) => void;
  updateItem: (item: AtLeast<Item, 'ID'>) => Promise<void>;
  getItem: (id: number) => Item | undefined;
  deleteImage: (itemId: number, imageId: number) => Promise<void>;
  getImages: (itemId: number) => ItemImage[];
  uploadImage: (params: ImageUploadParams) => Promise<void>;
  deleteItem: (itemId: number) => Promise<void>;
  addItem: (item: Partial<Item>) => Promise<void>;
  /**
   * @param parentId The ID of the parent item this child item belongs to
   * @param itemId Refers to the ID of the item in the `item` table, NOT
   * the ID of the item to be inserted.
   * @param item The item to be inserted
   */
  addChildItem: (
    parentId: number,
    itemId: number,
    item: AtLeast<Item, 'name' | 'type'>
  ) => Promise<void>;
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

  const setItems = (items: Item[]) => {
    dispatch({
      type: 'SET_ITEMS',
      payload: items
    });
  };

  const init = async (): Promise<Item[]> => {
    const items = await API.getAllItems();
    setItems(items);
    return items;
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
    const { imageID } = await API.uploadImage(itemId, {
      base64ImageData,
      name
    });

    dispatch({
      type: 'ADD_IMAGE',
      payload: {
        itemId,
        image: {
          ...image,
          ID: imageID
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

  const addItem = async (item: Partial<Item>) => {
    const response = await API.addItem(item);

    dispatch({
      type: 'ADD_ITEM',
      payload: response
    });
  };

  const addChildItem = async (
    parentId: number,
    itemId: number,
    item: AtLeast<Item, 'name' | 'type'>
  ): Promise<void> => {
    const response = await API.addChildItem(itemId, item);

    dispatch({
      type: 'ADD_CHILD_ITEM',
      payload: {
        parentId,
        item: response
      }
    });
  };

  return {
    items: state,
    init,
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
