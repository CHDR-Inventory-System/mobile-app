export type UserRole = 'Super' | 'Admin' | 'User';

export type JWT = {
  token: string;
};

export type User = JWT & {
  ID: number;
  created: string;
  email: string;
  fullName: string;
  nid: string;
  role: UserRole;
  verified: boolean;
};

export type ItemImage = {
  ID: number;
  created: string;
  imagePath: string;
  imageURL: string;
};

export type Item = {
  ID: number;
  available: boolean;
  barcode: string;
  children?: Omit<Item, 'images'>[];
  created: string;
  description: string | null;
  images: ItemImage[];
  location: string;
  main: boolean;
  moveable: boolean;
  name: string;
  purchaseDate: string | null;
  quantity: number;
  serial: string | null;
  type: string;
  vendorName: string | null;
  vendorPrice: number | null;
};

export type ReservationStatus =
  | 'Approved'
  | 'Checked Out'
  | 'Denied'
  | 'Late'
  | 'Missed'
  | 'Pending'
  | 'Returned';

export type Reservation = {
  ID: number;
  admin: User | null;
  created: string;
  endDateTime: string;
  item: Item;
  startDateTime: string;
  status: ReservationStatus;
  user: User;
};