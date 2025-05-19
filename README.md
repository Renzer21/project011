# Shopping Web Application

A full-stack e-commerce web application built with React (Vite) for the frontend and Node.js/Express for the backend.

## Features

- User authentication (register, login, logout)
- Product browsing with filtering and sorting capabilities
- Product details view
- Shopping cart functionality
- Responsive design with Material UI

## Project Structure

```
/
├── client/               # Frontend (React + Vite)
│   ├── src/              
│   │   ├── assets/       # Static assets
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Application pages
│   │   ├── App.jsx       # Main app component with routing
│   │   └── main.jsx      # Entry point
│   └── ...
└── server/               # Backend (Node.js + Express)
    ├── models/           # MongoDB models
    ├── routes/           # API routes
    ├── index.js          # Express server entry point
    ├── seed.js           # Database seeder
    └── ...
```

## Prerequisites

- Node.js (v14.x or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Getting Started

### Setup Database

1. Make sure MongoDB is running locally or update the `.env` file with your MongoDB Atlas connection string.

### Install Dependencies and Run Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Seed the database with initial data
npm run seed

# Start the backend server in development mode
npm run dev
```

### Install Dependencies and Run Frontend

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Cart
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear/:userId` - Clear cart

## Default Users

The seed script creates the following users:

- Admin: 
  - Email: admin@example.com
  - Password: password123
- Regular User:
  - Email: john@example.com
  - Password: password123

*Note: In a production environment, proper password hashing would be implemented*
