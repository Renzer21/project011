import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  success: false
};

function productReducer(state, action) {
  switch (action.type) {
    case 'PRODUCT_LIST_REQUEST':
      return { ...state, loading: true };
    case 'PRODUCT_LIST_SUCCESS':
      return { ...state, loading: false, products: action.payload };
    case 'PRODUCT_LIST_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PRODUCT_DETAILS_REQUEST':
      return { ...state, loading: true, product: null };
    case 'PRODUCT_DETAILS_SUCCESS':
      return { ...state, loading: false, product: action.payload };
    case 'PRODUCT_DETAILS_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PRODUCT_CREATE_REQUEST':
      return { ...state, loading: true };
    case 'PRODUCT_CREATE_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        products: [...state.products, action.payload],
        success: true
      };
    case 'PRODUCT_CREATE_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PRODUCT_UPDATE_REQUEST':
      return { ...state, loading: true };
    case 'PRODUCT_UPDATE_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        products: state.products.map(p => 
          p._id === action.payload._id ? action.payload : p
        ),
        success: true
      };
    case 'PRODUCT_UPDATE_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PRODUCT_DELETE_REQUEST':
      return { ...state, loading: true };
    case 'PRODUCT_DELETE_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        products: state.products.filter(p => p._id !== action.payload),
        success: true
      };
    case 'PRODUCT_DELETE_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PRODUCT_RESET_SUCCESS':
      return { ...state, success: false, error: null };
    default:
      return state;
  }
}

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const { user } = useAuth();
  const API_URL = 'http://localhost:5000/api';

  // Fetch all products
  const getProducts = async () => {
    try {
      dispatch({ type: 'PRODUCT_LIST_REQUEST' });
      const { data } = await axios.get(`${API_URL}/products`);
      dispatch({ type: 'PRODUCT_LIST_SUCCESS', payload: data });
    } catch (error) {
      dispatch({
        type: 'PRODUCT_LIST_FAIL',
        payload: error.response?.data?.message || 'Failed to fetch products'
      });
    }
  };

  // Fetch single product by ID
  const getProductById = async (id) => {
    if (!id) {
      dispatch({
        type: 'PRODUCT_DETAILS_FAIL',
        payload: 'Invalid product ID'
      });
      return;
    }

    try {
      dispatch({ type: 'PRODUCT_DETAILS_REQUEST' });
      
      // Add timeout to prevent indefinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const { data } = await axios.get(`${API_URL}/products/${id}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      dispatch({ type: 'PRODUCT_DETAILS_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error fetching product:', error);
      
      // Handle different error types
      if (error.name === 'AbortError') {
        dispatch({
          type: 'PRODUCT_DETAILS_FAIL',
          payload: 'Request timed out. Please try again.'
        });
      } else if (error.code === 'ERR_NETWORK') {
        dispatch({
          type: 'PRODUCT_DETAILS_FAIL',
          payload: 'Network error. Please check your connection.'
        });
      } else {
        dispatch({
          type: 'PRODUCT_DETAILS_FAIL',
          payload: error.response?.data?.message || 'Failed to fetch product'
        });
      }
    }
  };

  // Create a new product (Admin only)
  const createProduct = async (productData) => {
    try {
      dispatch({ type: 'PRODUCT_CREATE_REQUEST' });
      const { data } = await axios.post(`${API_URL}/products`, productData);
      dispatch({ type: 'PRODUCT_CREATE_SUCCESS', payload: data });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create product';
      dispatch({ type: 'PRODUCT_CREATE_FAIL', payload: message });
      throw new Error(message);
    }
  };

  // Update a product (Admin only)
  const updateProduct = async (id, productData) => {
    try {
      dispatch({ type: 'PRODUCT_UPDATE_REQUEST' });
      const { data } = await axios.put(`${API_URL}/products/${id}`, productData);
      dispatch({ type: 'PRODUCT_UPDATE_SUCCESS', payload: data });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update product';
      dispatch({ type: 'PRODUCT_UPDATE_FAIL', payload: message });
      throw new Error(message);
    }
  };

  // Delete a product (Admin only)
  const deleteProduct = async (id) => {
    try {
      dispatch({ type: 'PRODUCT_DELETE_REQUEST' });
      await axios.delete(`${API_URL}/products/${id}`);
      dispatch({ type: 'PRODUCT_DELETE_SUCCESS', payload: id });
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete product';
      dispatch({ type: 'PRODUCT_DELETE_FAIL', payload: message });
      throw new Error(message);
    }
  };

  // Reset success state
  const resetSuccess = () => {
    dispatch({ type: 'PRODUCT_RESET_SUCCESS' });
  };

  // Load products when component mounts
  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProductContext.Provider value={{
      products: state.products,
      product: state.product,
      loading: state.loading,
      error: state.error,
      success: state.success,
      getProducts,
      getProductById,
      createProduct,
      updateProduct,
      deleteProduct,
      resetSuccess
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
