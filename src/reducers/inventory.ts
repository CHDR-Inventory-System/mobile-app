import { Item, ItemImage } from '../types/API';
import { AtLeast } from '../util/types';

type InventoryState = Item[];

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
    .find(child => child?.ID === itemId);

  if (child) {
    return { ...child };
  }

  return undefined;
};

const inventoryReducer = (
  state: InventoryState,
  action: InventoryAction
): InventoryState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return action.payload;
    case 'ADD_ITEM':
    case 'ADD_CHILD_ITEM':
      // TODO: This needs to be implemented
      throw new Error('Not implemented');
    case 'DELETE_ITEM':
      const itemId = action.payload;

      return state
        .filter(item => item.ID !== itemId)
        .map(item => {
          if (item.children) {
            item.children = item.children.filter(child => child.ID !== itemId);
          }

          return item;
        });
    case 'UPDATE_ITEM': {
      const updatedItem = action.payload;

      // Because map will go through the entire array along with every
      // child, we need to keep track of whether we've updated an item
      // (since UPDATE_ITEM should only update one single item)
      let wasUpdated = false;

      // In this case, we'll find the id of the item we want to update
      // then combine it's properties with the existing item at that index
      return state.map(item => {
        if (item.ID === updatedItem.ID) {
          wasUpdated = true;
          return { ...item, ...updatedItem };
        }

        // Don't search the children if we've already updated the item
        if (!wasUpdated && item.children) {
          item.children = item.children.map(child => {
            if (child.ID === updatedItem.ID) {
              return { ...child, ...updatedItem };
            }

            return child;
          });
        }

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
