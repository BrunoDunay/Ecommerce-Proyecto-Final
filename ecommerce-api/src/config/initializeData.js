
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/user.js";
import Category from "../models/category.js";
import Product from "../models/product.js";
import WishList from "../models/wishList.js";
import Order from "../models/order.js";
import ShippingAddress from "../models/shippingAddress.js";
import PaymentMethod from "../models/paymentMethod.js";
import { isDbConnected } from "./database.js";

const imageBaseUrl = "/images/funkos";

const categorySeedData = [
  {
    name: "Superhéroes",
    description: "Funko Pops de héroes y villanos de Marvel y DC.",
    imageURL: `${imageBaseUrl}/black-panther.avif`,
  },
  {
    name: "Gaming",
    description: "Coleccionables de videojuegos y esports.",
    imageURL: `${imageBaseUrl}/jinx.png`,
  },
  {
    name: "Fútbol",
    description: "Funko Pops inspirados en grandes estrellas del fútbol.",
    imageURL: `${imageBaseUrl}/gavi.webp`,
  },
  {
    name: "Series",
    description: "Personajes icónicos de series y fantasía.",
    imageURL: `${imageBaseUrl}/daenerys.png`,
  },
];

const productSeedData = [
  {
    name: "Black Panther",
    description: "Funko Pop del Rey de Wakanda con diseño premium y acabado brillante.",
    price: 29.99,
    offer: 10,
    stock: 24,
    imageUrl: `${imageBaseUrl}/black-panther.avif`,
    categoryName: "Superhéroes",
  },
  {
    name: "Thor",
    description: "Funko Pop del dios del trueno con su martillo y una apariencia épica.",
    price: 31.5,
    offer: 8,
    stock: 18,
    imageUrl: `${imageBaseUrl}/thor.avif`,
    categoryName: "Superhéroes",
  },
  {
    name: "Wonder Woman",
    description: "Figura coleccionable de Wonder Woman con una estética moderna y elegante.",
    price: 27.99,
    offer: 5,
    stock: 20,
    imageUrl: `${imageBaseUrl}/wonder-woman.avif`,
    categoryName: "Superhéroes",
  },
  {
    name: "Captain America",
    description: "Funko Pop del héroe de los Vengadores con su escudo icónico.",
    price: 26.5,
    offer: 0,
    stock: 16,
    imageUrl: `${imageBaseUrl}/capitan-america.webp`,
    categoryName: "Superhéroes",
  },
  {
    name: "Jinx",
    description: "Funko Pop de Jinx, una de las estrellas más reconocidas del universo de League of Legends.",
    price: 34.99,
    offer: 12,
    stock: 14,
    imageUrl: `${imageBaseUrl}/jinx.png`,
    categoryName: "Gaming",
  },
  {
    name: "Ekko",
    description: "Coleccionable de Ekko con detalles vibrantes para los fans del gaming competitivo.",
    price: 32.49,
    offer: 7,
    stock: 13,
    imageUrl: `${imageBaseUrl}/ekko-funko.png`,
    categoryName: "Gaming",
  },
  {
    name: "Gavi",
    description: "Funko Pop del talento ofensivo del FC Barcelona con diseño exclusivo.",
    price: 33.99,
    offer: 15,
    stock: 12,
    imageUrl: `${imageBaseUrl}/gavi.webp`,
    categoryName: "Fútbol",
  },
  {
    name: "Pedri",
    description: "Figura coleccionable de Pedri con un acabado premium para fanáticos del fútbol.",
    price: 35.49,
    offer: 10,
    stock: 11,
    imageUrl: `${imageBaseUrl}/pedri.webp`,
    categoryName: "Fútbol",
  },
  {
    name: "Daenerys Targaryen",
    description: "Funko Pop de Daenerys con su look épico para fanáticos de Game of Thrones.",
    price: 30.99,
    offer: 6,
    stock: 15,
    imageUrl: `${imageBaseUrl}/daenerys.png`,
    categoryName: "Series",
  },
  {
    name: "Jon Snow",
    description: "Coleccionable de Jon Snow listo para completar tu edición favorita de la serie.",
    price: 29.49,
    offer: 5,
    stock: 17,
    imageUrl: `${imageBaseUrl}/jon-snow.png`,
    categoryName: "Series",
  },
  {
    name: "Batman",
    description: "Funko Pop del Caballero Oscuro con un acabado premium para los fans del cómic.",
    price: 28.99,
    offer: 9,
    stock: 19,
    imageUrl: `${imageBaseUrl}/batman.webp`,
    categoryName: "Superhéroes",
  },
  {
    name: "Deadpool",
    description: "Funko Pop de Deadpool con su actitud irreverente y detalles cómicos.",
    price: 30.5,
    offer: 11,
    stock: 15,
    imageUrl: `${imageBaseUrl}/deadpool.png`,
    categoryName: "Superhéroes",
  },
  {
    name: "Spider-Man",
    description: "Coleccionable de Spider-Man para completar tu colección de héroes urbanos.",
    price: 27.49,
    offer: 6,
    stock: 16,
    imageUrl: `${imageBaseUrl}/spiderman-dr.png`,
    categoryName: "Superhéroes",
  },
  {
    name: "Tony Stark",
    description: "Funko Pop de Tony Stark con un diseño sofisticado inspirado en la armadura.",
    price: 32.99,
    offer: 8,
    stock: 13,
    imageUrl: `${imageBaseUrl}/tony-stark.png`,
    categoryName: "Superhéroes",
  },
  {
    name: "Caitlyn",
    description: "Funko Pop de Caitlyn con detalles de alto impacto para fans de League of Legends.",
    price: 34.5,
    offer: 10,
    stock: 12,
    imageUrl: `${imageBaseUrl}/caitlyn.png`,
    categoryName: "Gaming",
  },
  {
    name: "Vi",
    description: "Figura coleccionable de Vi con diseño exclusivo para amantes del gaming competitivo.",
    price: 33.49,
    offer: 7,
    stock: 10,
    imageUrl: `${imageBaseUrl}/vi.png`,
    categoryName: "Gaming",
  },
  {
    name: "Lamine Yamal",
    description: "Funko Pop inspirado en Lamine Yamal con estilo moderno y energía juvenil.",
    price: 31.99,
    offer: 5,
    stock: 11,
    imageUrl: `${imageBaseUrl}/lamine.webp`,
    categoryName: "Fútbol",
  },
  {
    name: "Lewandowski",
    description: "Coleccionable de Lewandowski para fanáticos del fútbol y las figuras premium.",
    price: 36.99,
    offer: 12,
    stock: 9,
    imageUrl: `${imageBaseUrl}/lewandoski.webp`,
    categoryName: "Fútbol",
  },
  {
    name: "Stegen",
    description: "Funko Pop de Stegen con un diseño dinámico para seguidores del fútbol moderno.",
    price: 35.5,
    offer: 9,
    stock: 10,
    imageUrl: `${imageBaseUrl}/stegen.webp`,
    categoryName: "Fútbol",
  },
  {
    name: "Daemon Targaryen",
    description: "Figurita de Daemon Targaryen para completar tu colección de historias épicas.",
    price: 29.99,
    offer: 4,
    stock: 14,
    imageUrl: `${imageBaseUrl}/daemon.png`,
    categoryName: "Series",
  },
  {
    name: "Rhaenyra",
    description: "Funko Pop de Rhaenyra con un diseño elegante para fanáticos de la casa Targaryen.",
    price: 30.99,
    offer: 6,
    stock: 12,
    imageUrl: `${imageBaseUrl}/rhaenyra.png`,
    categoryName: "Series",
  },
];

const userSeedData = [
  {
    displayName: "Admin Funko",
    email: "admin@funko.com",
    password: "admin123",
    role: "admin",
    phone: "5550001111",
    avatar: `${imageBaseUrl}/capitan-america.webp`,
  },
  {
    displayName: "María López",
    email: "maria@funko.com",
    password: "maria123",
    role: "customer",
    phone: "5550002222",
    avatar: `${imageBaseUrl}/wonder-woman.avif`,
  },
  {
    displayName: "Leo Torres",
    email: "leo@funko.com",
    password: "leo123",
    role: "customer",
    phone: "5550003333",
    avatar: `${imageBaseUrl}/batman.webp`,
  },
];

async function clearDatabase() {
  if (!isDbConnected()) {
    return;
  }

  try {
    await mongoose.connection.db.dropDatabase();
    console.log("Existing database data removed");
  } catch (error) {
    console.error("Error cleaning database:", error);
    throw error;
  }
}

async function generateCategories() {
  const createdCategories = await Category.insertMany(categorySeedData);
  console.log("Categories created");
  return createdCategories;
}

async function generateProducts(categories) {
  const productsToInsert = productSeedData.map((product) => ({
    ...product,
    category: categories.find((category) => category.name === product.categoryName)._id,
  }));

  const createdProducts = await Product.insertMany(productsToInsert);
  console.log("Products created");
  return createdProducts;
}

async function generateUsers() {
  const usersToInsert = await Promise.all(
    userSeedData.map(async (user) => ({
      ...user,
      hashPassword: await bcrypt.hash(user.password, 10),
    }))
  );

  const createdUsers = await User.insertMany(usersToInsert);
  console.log("Users created");
  return createdUsers;
}

async function generateAddresses(users) {
  const addresses = users.map((user) => ({
    user: user._id,
    name: user.displayName,
    address: user.displayName === "Admin Funko" ? "Av. Reforma 100" : "Calle Futura 45",
    city: user.displayName === "Admin Funko" ? "Ciudad de México" : "Guadalajara",
    state: user.displayName === "Admin Funko" ? "CDMX" : "Jalisco",
    postalCode: user.displayName === "Admin Funko" ? "06000" : "44100",
    country: "México",
    phone: user.phone,
    isDefault: true,
    addressType: "home",
  }));

  return ShippingAddress.insertMany(addresses);
}

async function generatePaymentMethods(users) {
  const methods = users.map((user) => ({
    user: user._id,
    type: user.role === "admin" ? "credit_card" : "paypal",
    cardNumber: user.role === "admin" ? "**** **** **** 1111" : undefined,
    cardHolderName: user.role === "admin" ? user.displayName : undefined,
    expiryDate: user.role === "admin" ? "12/28" : undefined,
    paypalEmail: user.role !== "admin" ? `${user.email}` : undefined,
    isDefault: true,
    isActive: true,
  }));

  return PaymentMethod.insertMany(methods);
}

async function generateWishLists(users, products) {
  const wishLists = users.map((user, index) => ({
    user: user._id,
    products: [
      { product: products[index % products.length]._id },
      { product: products[(index + 1) % products.length]._id },
    ],
  }));

  return WishList.insertMany(wishLists);
}

async function generateOrders(users, products, addresses, paymentMethods) {
  const addressMap = new Map(addresses.map((address) => [String(address.user), address]));
  const paymentMap = new Map(paymentMethods.map((payment) => [String(payment.user), payment]));

  const orders = users.map((user, index) => {
    const firstProduct = products[index % products.length];
    const secondProduct = products[(index + 2) % products.length];
    const total = firstProduct.price + secondProduct.price + 25;

    return {
      user: user._id,
      products: [
        { productId: firstProduct._id, quantity: 1, price: firstProduct.price },
        { productId: secondProduct._id, quantity: 1, price: secondProduct.price },
      ],
      shippingAddress: addressMap.get(String(user._id))._id,
      paymentMethod: paymentMap.get(String(user._id))._id,
      shippingCost: 25,
      totalPrice: Number(total.toFixed(2)),
      status: index === 0 ? "delivered" : "processing",
      paymentStatus: "paid",
    };
  });

  return Order.insertMany(orders);
}

async function initializeData() {
  try {
    if (!isDbConnected()) {
      console.warn("Skipping data initialization because MongoDB is not connected.");
      return;
    }

    await clearDatabase();
    const categories = await generateCategories();
    const products = await generateProducts(categories);
    const users = await generateUsers();
    const addresses = await generateAddresses(users);
    const paymentMethods = await generatePaymentMethods(users);
    await generateWishLists(users, products);
    await generateOrders(users, products, addresses, paymentMethods);
    console.log("Data initialized successfully");
  } catch (error) {
    console.error("Error on initialize data:", error);
  }
}

export default initializeData;
