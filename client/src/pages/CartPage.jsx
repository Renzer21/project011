import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { Add, Remove, Delete, ShoppingBag } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

const CartPage = () => {
  const { user } = useAuth();
  const { cartItems, totalPrice, loading, error, fetchCart, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  // We don't need this effect anymore as the CartContext will handle fetching
  // cart data automatically when the user changes

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateCartItem(user._id, productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(user._id, productId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" paragraph>
            Please sign in to view your cart
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/login"
            size="large"
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) return <Loader />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth={false} sx={{ width: '100%', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" paragraph>
            Looks like you haven't added anything to your cart yet
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            size="large"
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer component={Paper}>
                <Table sx={{
                  minWidth: { xs: '650px', md: '100%' },
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Price</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="center">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.product}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                            <Box
                              component="img"
                              src={item.image || 'https://via.placeholder.com/150'}
                              alt={item.name}
                              sx={{ 
                                width: { xs: 60, sm: 80 }, 
                                height: { xs: 60, sm: 80 },
                                mr: 2, 
                                objectFit: 'contain',
                                mb: { xs: 1, sm: 0 }
                              }}
                            />
                            <Typography 
                              variant="body1"
                              sx={{ 
                                width: { xs: '100%', sm: 'auto' }, 
                                wordBreak: 'break-word',
                                maxWidth: { xs: '100%', sm: '180px', md: '250px' }
                              }}
                            >
                              <Link 
                                to={`/products/${item.product}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                {item.name}
                              </Link>
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          ${parseFloat(item.price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.product, item.quantity, -1)}
                              disabled={item.quantity === 1}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <TextField
                              size="small"
                              value={item.quantity}
                              InputProps={{
                                readOnly: true,
                                inputProps: { 
                                  min: 1, 
                                  style: { textAlign: 'center', width: '30px' } 
                                }
                              }}
                              variant="outlined"
                              sx={{ mx: 1 }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.product, item.quantity, 1)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          ${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(item.product)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component={Link}
                to="/products"
                startIcon={<ShoppingBag />}
              >
                Continue Shopping
              </Button>
            </Box>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: '20px' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">${(totalPrice || 0).toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping</Typography>
                <Typography variant="body1">Free</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax</Typography>
                <Typography variant="body1">${((totalPrice || 0) * 0.1).toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ${((totalPrice || 0) + (totalPrice || 0) * 0.1).toFixed(2)}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{ 
                  py: 1.5,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  transition: 'background-color 0.3s'
                }}
              >
                Proceed to Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartPage;
