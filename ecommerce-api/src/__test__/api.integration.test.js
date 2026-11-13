// Pruebas de integración: la API completa contra una MongoDB en memoria (no toca la base real).
// Cada prueba de "acceso" intenta lo que haría un cliente malintencionado con su propia sesión.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

let mongo, app, User, Product, Category, Order, PaymentMethod;

const people = {
  admin: { displayName: 'Admin', email: 'admin@funko.test', password: 'admin123', role: 'admin', phone: '4490000001' },
  ana: { displayName: 'Ana', email: 'ana@funko.test', password: 'ana12345', role: 'customer', phone: '4490000002' },
  beto: { displayName: 'Beto', email: 'beto@funko.test', password: 'beto1234', role: 'customer', phone: '4490000003' },
};

const ids = {};
const tokens = {};
let funko;
const auth = (who) => ({ Authorization: `Bearer ${tokens[who]}` });
const fakeId = () => new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = (await import('../../app.js')).default;
  User = (await import('../models/user.js')).default;
  Product = (await import('../models/product.js')).default;
  Category = (await import('../models/category.js')).default;
  Order = (await import('../models/order.js')).default;
  PaymentMethod = (await import('../models/paymentMethod.js')).default;
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  for (const [key, p] of Object.entries(people)) {
    const u = await User.create({
      displayName: p.displayName,
      email: p.email,
      phone: p.phone,
      role: p.role,
      hashPassword: await bcrypt.hash(p.password, 10),
    });
    ids[key] = u._id.toString();
    const res = await request(app).post('/api/auth/login').send({ email: p.email, password: p.password });
    tokens[key] = res.body.token;
  }
  const cat = await Category.create({ name: 'Anime', description: 'Figuras de anime' });
  funko = await Product.create({ name: 'Funko Goku', description: 'Figura', price: 500, offer: 10, stock: 3, category: cat._id });
});

describe('Usuarios', () => {
  it('la búsqueda de usuarios ya no es pública', async () => {
    const res = await request(app).get('/api/users/search?q=a');
    expect(res.status).toBe(401);
  });

  it('un cliente no puede buscar usuarios y el admin no recibe hashes de contraseña', async () => {
    expect((await request(app).get('/api/users/search?q=a').set(auth('ana'))).status).toBe(403);
    const res = await request(app).get('/api/users/search?q=a').set(auth('admin'));
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toMatch(/hashPassword|\$2[aby]\$/);
  });

  it('la búsqueda trata el texto como texto, no como expresión regular', async () => {
    const res = await request(app).get('/api/users/search?q=(a%2B)%2B%24').set(auth('admin'));
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(0);
  });

  it('registrarse con role=admin crea un cliente normal', async () => {
    await request(app).post('/api/auth/register').send({
      displayName: 'Intruso', email: 'intruso@funko.test', password: 'intruso1', phone: '4490000009', role: 'admin',
    });
    const u = await User.findOne({ email: 'intruso@funko.test' });
    expect(u.role).toBe('customer');
  });

  it('el login no revela si un correo está registrado', async () => {
    const wrongPass = await request(app).post('/api/auth/login').send({ email: people.ana.email, password: 'mala1234' });
    const noUser = await request(app).post('/api/auth/login').send({ email: 'nadie@funko.test', password: 'mala1234' });
    expect(wrongPass.status).toBe(noUser.status);
    expect(wrongPass.body.message).toBe(noUser.body.message);
  });
});

describe('Órdenes', () => {
  const orderBody = (extra = {}) => ({
    products: [{ productId: funko._id.toString(), quantity: 2, price: 0.01 }],
    shippingAddress: fakeId(),
    paymentMethod: fakeId(),
    shippingCost: 0,
    ...extra,
  });

  it('el total se calcula con el precio y la oferta de la base de datos, no con el que manda el cliente', async () => {
    const res = await request(app).post('/api/orders').set(auth('ana')).send(orderBody());
    expect(res.status).toBe(201);
    expect(res.body.products[0].price).toBe(450); // 500 con 10 % de oferta
    expect(res.body.totalPrice).toBe(900);
  });

  it('un costo de envío negativo no funciona como descuento', async () => {
    const res = await request(app).post('/api/orders').set(auth('ana')).send(orderBody({ shippingCost: -800 }));
    expect(res.status).toBe(201);
    expect(res.body.totalPrice).toBe(900);
  });

  it('no se puede crear una orden a nombre de otro usuario', async () => {
    const res = await request(app).post('/api/orders').set(auth('ana')).send(orderBody({ user: ids.beto }));
    expect(res.status).toBe(201);
    expect(String(res.body.user._id)).toBe(ids.ana);
  });

  it('la orden no incluye el hash de la contraseña del usuario', async () => {
    const res = await request(app).post('/api/orders').set(auth('ana')).send(orderBody());
    expect(JSON.stringify(res.body)).not.toMatch(/hashPassword/);
  });

  it('un cliente no puede ver las órdenes de otro, ni por usuario ni por ID', async () => {
    const created = await request(app).post('/api/orders').set(auth('beto')).send(orderBody());
    expect((await request(app).get(`/api/orders/user/${ids.beto}`).set(auth('ana'))).status).toBe(403);
    expect((await request(app).get(`/api/orders/${created.body._id}`).set(auth('ana'))).status).toBe(403);
    expect((await request(app).get(`/api/orders/${created.body._id}`).set(auth('beto'))).status).toBe(200);
    expect((await request(app).get(`/api/orders/${created.body._id}`).set(auth('admin'))).status).toBe(200);
  });

  it('rechaza cantidades decimales y productos sin stock suficiente', async () => {
    const decimal = await request(app).post('/api/orders').set(auth('ana'))
      .send(orderBody({ products: [{ productId: funko._id.toString(), quantity: 1.5 }] }));
    expect(decimal.status).toBe(400);
    const tooMany = await request(app).post('/api/orders').set(auth('ana'))
      .send(orderBody({ products: [{ productId: funko._id.toString(), quantity: 99 }] }));
    expect(tooMany.status).toBe(400);
  });
});

describe('Métodos de pago', () => {
  const card = { type: 'credit_card', cardNumber: '4111 1111 1111 1234', cardHolderName: 'Ana', expiryDate: '12/30' };

  it('no se guarda el número completo de la tarjeta', async () => {
    const res = await request(app).post('/api/payment-methods').set(auth('ana')).send(card);
    expect(res.status).toBe(201);
    const saved = await PaymentMethod.findOne({ user: ids.ana });
    expect(saved.cardNumber).toBe('**** **** **** 1234');
    expect(JSON.stringify(res.body)).not.toContain('4111');
  });

  it('un cliente no puede ver, modificar ni borrar los métodos de pago de otro', async () => {
    const created = await request(app).post('/api/payment-methods').set(auth('beto')).send(card);
    const id = created.body._id;
    expect((await request(app).get(`/api/payment-methods/user/${ids.beto}`).set(auth('ana'))).status).toBe(403);
    expect((await request(app).get(`/api/payment-methods/${id}`).set(auth('ana'))).status).toBe(403);
    expect((await request(app).put(`/api/payment-methods/${id}`).set(auth('ana')).send({ cardHolderName: 'X' })).status).toBe(403);
    expect((await request(app).delete(`/api/payment-methods/${id}`).set(auth('ana'))).status).toBe(403);
    expect(await PaymentMethod.countDocuments({ user: ids.beto })).toBe(1);
  });

  it('el dueño sí puede ver sus métodos de pago', async () => {
    await request(app).post('/api/payment-methods').set(auth('ana')).send(card);
    const res = await request(app).get(`/api/payment-methods/user/${ids.ana}`).set(auth('ana'));
    expect(res.status).toBe(200);
  });
});

describe('Carrito y notificaciones', () => {
  it('un cliente no puede ver el carrito de otro', async () => {
    expect((await request(app).get(`/api/cart/user/${ids.beto}`).set(auth('ana'))).status).toBe(403);
  });

  it('agregar al carrito siempre usa el carrito de quien inició sesión', async () => {
    await request(app).post('/api/cart/add-product').set(auth('ana'))
      .send({ userId: ids.beto, productId: funko._id.toString(), quantity: 1 });
    const Cart = (await import('../models/cart.js')).default;
    expect(await Cart.findOne({ user: ids.beto })).toBeNull();
  });

  it('un cliente no puede leer las notificaciones de otro ni crear notificaciones', async () => {
    expect((await request(app).get(`/api/notifications/user/${ids.beto}`).set(auth('ana'))).status).toBe(403);
    expect((await request(app).post('/api/notifications').set(auth('ana')).send({ user: ids.beto, message: 'x' })).status).toBe(403);
  });
});

describe('Encabezados', () => {
  it('no anuncia Express', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
