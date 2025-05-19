import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  cartItems: [],
  totalPrice: 0,
  loading: false,
  error: null
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'CART_REQUEST':
      return { ...state, loading: true };
    case 'CART_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        cartItems: action.payload.items, 
        totalPrice: action.payload.totalPrice 
      };
    case 'CART_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_TO_CART':
      return {
        ...state,
        cartItems: [...state.cartItems, action.payload],
        totalPrice: state.totalPrice + (action.payload.price * action.payload.quantity)
      };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.map(item => 
          item.product === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        totalPrice: state.cartItems.reduce(
          (total, item) => total + item.price * (
            item.product === action.payload.productId
              ? action.payload.quantity
              : item.quantity
          ),
          0
        )
      };
    case 'REMOVE_FROM_CART':
      const removedItem = state.cartItems.find(item => item.product === action.payload);
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.product !== action.payload),
        totalPrice: state.totalPrice - (removedItem ? removedItem.price * removedItem.quantity : 0)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
        totalPrice: 0
      };
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();
  const API_URL = 'http://localhost:5000/api';
  
  // Initialize cart when user changes
  useEffect(() => {
    if (user && user._id) {
      fetchCart(user._id);
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Fetch cart from API (using userId)
  const fetchCart = async (userId) => {
    try {
      dispatch({ type: 'CART_REQUEST' });
      const response = await axios.get(`${API_URL}/cart/${userId}`);
      dispatch({ type: 'CART_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ 
        type: 'CART_FAIL', 
        payload: error.response?.data?.message || 'Failed to fetch cart'
      });
    }
  };

  // Add item to cart
  const addToCart = async (userId, productId, quantity) => {
    try {
      // First get the product details
      const productResponse = await axios.get(`${API_URL}/products/${productId}`);
      const product = productResponse.data;
      
      dispatch({ type: 'CART_REQUEST' });
      
      try {
        // Try to add to server
        const response = await axios.post(`${API_URL}/cart/add`, {
          userId,
          productId,
          quantity
        });
        dispatch({ type: 'CART_SUCCESS', payload: response.data });
      } catch (serverError) {
        console.warn('Server cart update failed, updating locally', serverError);
        // If server fails, still update locally
        dispatch({ 
          type: 'ADD_TO_CART', 
          payload: {
            product: productId,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity
          }
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'CART_FAIL', 
        payload: error.response?.data?.message || 'Failed to add to cart'
      });
    }
  };

  // Update cart item quantity
  const updateCartItem = async (userId, productId, quantity) => {
    try {
      dispatch({ type: 'CART_REQUEST' });
      const response = await axios.put(`${API_URL}/cart/update`, {
        userId,
        productId,
        quantity
      });
      dispatch({ type: 'CART_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ 
        type: 'CART_FAIL', 
        payload: error.response?.data?.message || 'Failed to update cart'
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (userId, productId) => {
    try {
      dispatch({ type: 'CART_REQUEST' });
      const response = await axios.delete(`${API_URL}/cart/remove`, {
        data: { userId, productId }
      });
      dispatch({ type: 'CART_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ 
        type: 'CART_FAIL', 
        payload: error.response?.data?.message || 'Failed to remove from cart'
      });
    }
  };

  // Clear cart
  const clearCart = async (userId) => {
    try {
      dispatch({ type: 'CART_REQUEST' });
      await axios.delete(`${API_URL}/cart/clear/${userId}`);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ 
        type: 'CART_FAIL', 
        payload: error.response?.data?.message || 'Failed to clear cart'
      });
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems: state.cartItems,
      totalPrice: state.totalPrice,
      loading: state.loading,
      error: state.error,
      fetchCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
