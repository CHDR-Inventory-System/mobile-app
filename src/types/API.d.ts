export type UserRole = 'Super' | 'Admin' | 'User';

export type JWT = {
  token: string;
};

export type User = JWT & {
  ID: number;
  created: string;
  email: string;
  fullName: string;
  role: UserRole;
  verified: boolean;
};

export type ItemImage = {
  ID: number;
  created: string;
  imagePath: string;
  imageURL: string;
  itemChild: number;
};

export type Item = {
  ID: number;
  available: boolean;
  barcode: string;
  /**
   * Note that item children won't have any children
   */
  children?: Item[];
  created: string;
  description: string | null;
  images: ItemImage[];
  /**
   * The ID of the base item this item refers to
   */
  item: number;
  location: string;
  main: boolean;
  moveable: boolean;
  name: string;
  purchaseDate: string | null;
  quantity: number;
  retiredDateTime: string | null;
  serial: string | null;
  type: string;
  vendorName: string | null;
  vendorPrice: number | null;
};

export type ReservationStatus =
  | 'Approved'
  | 'Cancelled'
  | 'Checked Out'
  | 'Denied'
  | 'Late'
  | 'Missed'
  | 'Pending'
  | 'Returned';

export type Reservation = {
  ID: number;
  admin: Omit<User, 'token'> | null;
  created: string;
  endDateTime: string;
  item: Item;
  startDateTime: string;
  status: ReservationStatus;
  user: Omit<User, 'token'>;
};

export type ImageUploadParams = {
  itemId: number;
  base64ImageData: string;
  name: string;
};

export type CreateReservationOpts = {
  email: string;
  checkoutDate: string;
  returnDate: string;
  status: ReservationStatus;
  adminId: number;
  /**
   * This refers to the ID of the item in the item table.
   */
  item: number;
};
