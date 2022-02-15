import { Item, ItemImage } from '../types/API';
import { AtLeast } from '../util/types';

export type InventoryAction =
  | {
      type: 'ADD_ITEM';
      payload: Item;
    }
  | {
      type: 'ADD_CHILD_ITEM';
      payload: {
        parentId: number;
        item: Item;
      };
    }
  | {
      type: 'SET_ITEMS';
      payload: Item[];
    }
  | {
      type: 'DELETE_ITEM';
      payload: number;
    }
  | {
      type: 'UPDATE_ITEM';
      payload: AtLeast<Item, 'ID'>;
    }
  | {
      type: 'DELETE_IMAGE';
      payload: {
        itemId: number;
        imageId: number;
      };
    }
  | {
      type: 'ADD_IMAGE';
      payload: {
        itemId: number;
        image: ItemImage;
      };
    };

/**
 * Takes a list of inventory items and an item id and searches through every
 * item and child in the list until it finds the item with id `itemId`.
 * Note that this function return a **copy** of the item, not the original item.
 */
const findItem = (items: Item[], itemId: number): Item | undefined => {
  const item = items.find(({ ID }) => itemId === ID);

  if (item) {
    return { ...item };
  }

  const child = items
    .flatMap(({ children }) => children)
    .find(childItem => childItem?.ID === itemId);

  if (child) {
    return { ...child };
  }

  return undefined;
};

const inventoryReducer = (state: Item[], action: InventoryAction): Item[] => {
  switch (action.type) {
    case 'SET_ITEMS':
      return action.payload;
    case 'ADD_ITEM': {
      const item = {
        ...action.payload,
        images: []
      };
      return state.concat(item as Item);
    }
    case 'ADD_CHILD_ITEM': {
      const { item: newItem, parentId } = action.payload;

      return state.map(item => {
        if (item.ID === parentId) {
          item.children?.push(newItem);
        }

        return item;
      });
    }
    case 'DELETE_ITEM': {
      const itemId = action.payload;

      return state
        .filter(item => item.ID !== itemId)
        .map(item => {
          if (item.children) {
            item.children = item.children.filter(child => child.ID !== itemId);
          }

          return item;
        });
    }
    case 'UPDATE_ITEM': {
      const updatedItem = action.payload;

      // Because map will go through the entire array along with every
      // child, we need to keep track of whether we've updated an item
      // (since UPDATE_ITEM should only update one single item)
      let wasUpdated = false;

      // In this case, we'll find the id of the item we want to update
      // then combine it's properties with the existing item at that index
      return state.map(item => {
        if (item.ID === updatedItem.ID && !wasUpdated) {
          item.children = item.children?.map(child => ({
            ...child,
            // Because the children share these properties with the parent,
            // if these values are updated in the parent item, they'll also
            // need to be updated in every child item
            barcode: updatedItem.barcode ?? child.barcode,
            moveable: updatedItem.moveable ?? child.moveable,
            available: updatedItem.available ?? child.available,
            location: updatedItem.location ?? child.location,
            quantity: updatedItem.quantity ?? child.quantity,
            retiredDateTime: updatedItem.retiredDateTime ?? child.retiredDateTime
          }));

          wasUpdated = true;

          return {
            ...item,
            ...updatedItem,
            children: item.children
          };
        }

        if (!item.children || wasUpdated) {
          return item;
        }

        item.children = item.children.map(child => {
          if (child.ID === updatedItem.ID) {
            wasUpdated = true;
            return {
              ...child,
              ...updatedItem
            };
          }

          return child;
        });

        return item;
      });
    }
    case 'DELETE_IMAGE': {
      const { itemId, imageId } = action.payload;
      const updatedItem = findItem(state, itemId);

      if (!updatedItem) {
        // eslint-disable-next-line no-console
        console.warn(`Couldn't find item with ID ${itemId}`);
        return state;
      }

      updatedItem.images = updatedItem.images.filter(image => image.ID !== imageId);

      let wasItemUpdated = false;

      return state.map(item => {
        if (item.ID === updatedItem.ID) {
          wasItemUpdated = true;
          return {
            ...item,
            ...updatedItem
          };
        }

        if (!wasItemUpdated && item.children) {
          item.children = item.children.map(child => {
            if (child.ID === updatedItem.ID) {
              wasItemUpdated = true;
              return {
                ...child,
                ...updatedItem
              };
            }

            return child;
          });
        }

        return item;
      });
    }
    case 'ADD_IMAGE': {
      const { itemId, image } = action.payload;
      const updatedItem = findItem(state, itemId);

      if (!updatedItem) {
        return state;
      }

      let wasItemUpdated = false;

      return state.map(item => {
        if (item.ID === updatedItem.ID) {
          item.images.push(image);
          wasItemUpdated = true;
        }

        if (!wasItemUpdated) {
          item.children?.forEach(child => {
            if (child.ID === updatedItem.ID) {
              child.images.push(image);
            }
          });
        }

        return item;
      });
    }
    default:
      throw new Error(`Invalid action ${action}`);
  }
};

export default inventoryReducer;
