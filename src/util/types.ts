// This file contains a collection of utility types

/**
 * A utility that makes all properties of a type optional except
 * for the properties passed as the second generic item
 *
 * @example
 *
 * ```
 * // All properties on this object will be marked as optional
 * // while 'ID' and 'barcode' will be marked as required
 * const item: AtLeast<Item, 'ID' | 'barcode'>
 * ```
 */
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
