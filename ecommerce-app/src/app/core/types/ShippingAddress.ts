import z from 'zod';

export const shippingAddressSchema = z.object({
  _id: z.string().min(1),
  user: z.string().optional(),

  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string(),

  isDefault: z.boolean().default(false),
  addressType: z.enum(['home', 'work', 'other']),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const shippingAddressArraySchema = z.array(shippingAddressSchema);

export const createShippingAddressSchema = shippingAddressSchema.omit({
  _id: true,
});

export type CreateShippingAddress = z.infer<typeof createShippingAddressSchema>;

export const updateShippingAddressSchema = shippingAddressSchema
  .partial()
  .required({
    _id: true,
  });

export type UpdateShippingAddress = z.infer<typeof updateShippingAddressSchema>;
