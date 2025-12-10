import z from 'zod';
import { cartProductSchema } from './Products';
import { PaymentMethodSchema } from './PaymentMethod';
import { userSchema } from './User';
import { shippingAddressSchema } from './ShippingAddress';

export const orderProductSchema = z.object({
  productId: cartProductSchema,  
  quantity: z.number(),
  price: z.number(),             
  _id: z.string().optional(),    
});

export const orderSchema = z.object({
  _id: z.string().optional(),

  user: z.union([z.string(), userSchema]),

  products: z.array(orderProductSchema),

  shippingAddress: z
    .union([
      z.string(),              
      shippingAddressSchema,
      z.null(),
    ])
    .optional(),

  paymentMethod: z.union([z.string(), PaymentMethodSchema]),

  shippingCost: z.number(),
  totalPrice: z.number(),

  status: z.enum([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]),

  paymentStatus: z
    .enum(['pending', 'paid', 'failed', 'refunded'])
    .optional(),
});

export const orderArraySchema = z.array(orderSchema);

export type Order = z.infer<typeof orderSchema>;
