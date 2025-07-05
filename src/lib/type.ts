export type Category = {
  _id: string;
  name: string;
  slug: string;
};

export type Item = {
  _id: string;
  title: string;
  price: number;
  category: string; // category id as string
  image?: string;   // main image url (optional)
  createdAt?: string;
  updatedAt?: string;
};