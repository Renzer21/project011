import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'USA',
    paymentMethod: 'creditCard',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in or cart is empty
  if (!user) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  const steps = ['Shipping Information', 'Payment Method', 'Review Order'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Step 1 validation
    if (activeStep === 0) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    }
    
    // Step 2 validation
    if (activeStep === 1) {
      if (formData.paymentMethod === 'creditCard') {
        if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
        else if (formData.cardNumber.replace(/\s/g, '').length !== 16) 
          newErrors.cardNumber = 'Card number must be 16 digits';
          
        if (!formData.expDate) newErrors.expDate = 'Expiration date is required';
        if (!formData.cvv) newErrors.cvv = 'CVV is required';
        else if (formData.cvv.length < 3) newErrors.cvv = 'CVV must be at least 3 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        totalPrice: totalPrice + (totalPrice * 0.1) // Including tax
      };

      const { data } = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (data) {
        clearCart(user._id);
        setOrderPlaced(true);
        setActiveStep(3); // Success step
      }
    } catch (error) {
      console.error('Order placement error:', error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderShippingForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={!!errors.city}
          helperText={errors.city}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="ZIP Code"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          error={!!errors.zipCode}
          helperText={errors.zipCode}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Country</InputLabel>
          <Select
            name="country"
            value={formData.country}
            onChange={handleChange}
            label="Country"
          >
            <MenuItem value="USA">United States</MenuItem>
            <MenuItem value="Canada">Canada</MenuItem>
            <MenuItem value="UK">United Kingdom</MenuItem>
            <MenuItem value="Australia">Australia</MenuItem>
            <MenuItem value="India">India</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderPaymentForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Payment Method</InputLabel>
          <Select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            label="Payment Method"
          >
            <MenuItem value="creditCard">Credit Card</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
            <MenuItem value="bankTransfer">Bank Transfer</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      {formData.paymentMethod === 'creditCard' && (
        <>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Card Number"
              name="cardNumber"
              placeholder="XXXX XXXX XXXX XXXX"
              value={formData.cardNumber}
              onChange={handleChange}
              error={!!errors.cardNumber}
              helperText={errors.cardNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Expiration Date"
              name="expDate"
              placeholder="MM/YY"
              value={formData.expDate}
              onChange={handleChange}
              error={!!errors.expDate}
              helperText={errors.expDate}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="CVV"
              name="cvv"
              type="password"
              value={formData.cvv}
              onChange={handleChange}
              error={!!errors.cvv}
              helperText={errors.cvv}
            />
          </Grid>
        </>
      )}
      
      {formData.paymentMethod === 'paypal' && (
        <Grid item xs={12}>
          <Alert severity="info">
            You will be redirected to PayPal to complete the payment after reviewing your order.
          </Alert>
        </Grid>
      )}
      
      {formData.paymentMethod === 'bankTransfer' && (
        <Grid item xs={12}>
          <Alert severity="info">
            Bank transfer details will be provided after you place the order.
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  const renderOrderSummary = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Box sx={{ mt: 2 }}>
          {cartItems.map(item => (
            <Box key={item.product} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  component="img" 
                  src={item.image || 'https://via.placeholder.com/50'} 
                  alt={item.name}
                  sx={{ width: 50, height: 50, objectFit: 'contain', mr: 2 }}
                />
                <Box>
                  <Typography variant="body1">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: {item.quantity}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1">${(item.price * item.quantity).toFixed(2)}</Typography>
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Subtotal</Typography>
          <Typography variant="body1">${(totalPrice || 0).toFixed(2)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Tax (10%)</Typography>
          <Typography variant="body1">${((totalPrice || 0) * 0.1).toFixed(2)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Shipping</Typography>
          <Typography variant="body1">Free</Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ${((totalPrice || 0) + (totalPrice || 0) * 0.1).toFixed(2)}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Shipping Details
          </Typography>
          <Typography>
            {formData.firstName} {formData.lastName}
          </Typography>
          <Typography>
            {formData.address}
          </Typography>
          <Typography>
            {formData.city}, {formData.zipCode}
          </Typography>
          <Typography>
            {formData.country}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Payment Method
          </Typography>
          <Typography>
            {formData.paymentMethod === 'creditCard' && 'Credit Card'}
            {formData.paymentMethod === 'paypal' && 'PayPal'}
            {formData.paymentMethod === 'bankTransfer' && 'Bank Transfer'}
          </Typography>
          {formData.paymentMethod === 'creditCard' && (
            <Typography>
              Card ending in {formData.cardNumber.slice(-4)}
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );

  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Thank you for your order!
      </Typography>
      <Typography variant="body1" paragraph>
        Your order has been placed successfully. We'll send you a confirmation email shortly.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/products')}
        sx={{ mt: 2 }}
      >
        Continue Shopping
      </Button>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderShippingForm();
      case 1:
        return renderPaymentForm();
      case 2:
        return renderOrderSummary();
      case 3:
        return renderSuccess();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth={false} sx={{ width: '100%', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Checkout
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4, display: activeStep < 3 ? 'flex' : 'none' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        {activeStep < 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            {activeStep > 0 && (
              <Button 
                variant="outlined" 
                onClick={handleBack} 
                sx={{ mr: 1 }}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CheckoutPage;
