const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

// Sample Products Data
const products = [
  {
    name: 'iPhone 13 Pro',
    description: 'Apple iPhone 13 Pro with A15 Bionic chip, Pro camera system, and Super Retina XDR display with ProMotion.',
    price: 999.99,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80',
    category: 'Electronics',
    countInStock: 15,
    rating: 4.5,
    numReviews: 89
  },
  {
    name: 'Samsung Galaxy S22',
    description: 'Samsung Galaxy S22 with Snapdragon 8 Gen 1, Dynamic AMOLED display, and pro-grade camera.',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80',
    category: 'Electronics',
    countInStock: 8,
    rating: 4.2,
    numReviews: 62
  },
  {
    name: 'Sony WH-1000XM4 Headphones',
    description: 'Wireless premium noise cancelling headphones with exceptional sound quality and long battery life.',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80',
    category: 'Electronics',
    countInStock: 12,
    rating: 4.8,
    numReviews: 134
  },
  {
    name: 'Nike Air Max 270',
    description: 'Stylish and comfortable athletic shoes with Air Max cushioning for all-day comfort.',
    price: 150.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80',
    category: 'Clothing',
    countInStock: 25,
    rating: 4.3,
    numReviews: 56
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'Classic straight leg jeans with button fly and five-pocket styling.',
    price: 69.50,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80',
    category: 'Clothing',
    countInStock: 30,
    rating: 4.0,
    numReviews: 41
  },
  {
    name: 'Instant Pot Duo Plus',
    description: '9-in-1 electric pressure cooker that works as a slow cooker, rice cooker, steamer, and more.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?auto=format&fit=crop&q=80',
    category: 'Home & Kitchen',
    countInStock: 18,
    rating: 4.7,
    numReviews: 215
  },
  {
    name: 'The Alchemist by Paulo Coelho',
    description: 'A fable about following your dream and listening to your heart.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80',
    category: 'Books',
    countInStock: 45,
    rating: 4.8,
    numReviews: 320
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'An easy and proven way to build good habits and break bad ones.',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80',
    category: 'Books',
    countInStock: 32,
    rating: 4.9,
    numReviews: 256
  }
];

// Create hashed passwords
const createHashedPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

// Sample Admin User
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password123', // Will be hashed before saving
  isAdmin: true
};

// Sample Regular User
const regularUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123', // Will be hashed before saving
  isAdmin: false
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-app')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing data
      await User.deleteMany({});
      await Product.deleteMany({});
      
      console.log('Data cleared');

      // Hash passwords for sample users
      adminUser.password = await createHashedPassword(adminUser.password);
      regularUser.password = await createHashedPassword(regularUser.password);

      // Seed users
      const admin = await User.create(adminUser);
      const user = await User.create(regularUser);
      
      console.log('Users seeded');
      
      // Seed products
      await Product.insertMany(products);
      
      console.log('Products seeded');
      console.log('Database seeded successfully');
      
      process.exit(0);
    } catch (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });
