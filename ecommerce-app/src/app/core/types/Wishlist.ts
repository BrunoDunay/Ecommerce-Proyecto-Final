import z from 'zod';
import { userSchema } from './User';

export const wishlistProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  imageUrl: z.string().optional().nullable(),
});

export const wishListItemSchema = z.object({
  product: wishlistProductSchema,
  addedAt: z.string().optional(),
});

export const wishListSchema = z.object({
  _id: z.string(),
  user: z.union([z.string(), userSchema]),
  products: z.array(wishListItemSchema),
});

export type WishList = z.infer<typeof wishListSchema>;
