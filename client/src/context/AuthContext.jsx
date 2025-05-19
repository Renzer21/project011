import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AuthContext = createContext();

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  loading: false,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null };
    case 'AUTH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Setup request interceptor for adding token to requests
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (state.user?.token) {
          config.headers.Authorization = `Bearer ${state.user.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup response interceptor for handling token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // If token is expired, log out the user
          dispatch({ type: 'LOGOUT' });
        }
        return Promise.reject(error);
      }
    );

    // Store user in localStorage when it changes
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.user]);

  // Register user
  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      const response = await axios.post(`${API_URL}/users/register`, {
        name,
        email,
        password
      });
      
      // Store user data with token
      dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Registration failed. Please try again.';
      
      dispatch({ type: 'AUTH_FAIL', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });
      
      // Store user data with token
      dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Invalid email or password';
      
      dispatch({ type: 'AUTH_FAIL', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Update user profile
  const updateUserInfo = async (userData) => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      
      // The API call is handled in the ProfilePage component
      // This function only updates the context state
      dispatch({ type: 'AUTH_SUCCESS', payload: {
        ...state.user,
        ...userData
      }});
      
      return userData;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Profile update failed. Please try again.';
      
      dispatch({ type: 'AUTH_FAIL', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: state.user,
      loading: state.loading,
      error: state.error,
      register,
      login,
      logout,
      updateUserInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
