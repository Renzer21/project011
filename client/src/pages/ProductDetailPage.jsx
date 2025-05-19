import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Button, 
  Divider,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { AddShoppingCart, ArrowBack } from '@mui/icons-material';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, getProductById } = useProducts();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      getProductById(id);
    }
  }, [id]);

  const handleQuantityChange = (event) => {
    setQuantity(Number(event.target.value));
  };

  const handleAddToCart = () => {
    if (!product || !product._id) {
      console.error('Product data is incomplete');
      return;
    }
    
    if (user) {
      addToCart(user._id, product._id, quantity);
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  if (loading) return <Loader />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <Box 
              component="img"
              alt={product?.name || 'Product Image'}
              src={product?.image || 'https://via.placeholder.com/500?text=No+Image+Available'}
              sx={{ 
                width: '100%', 
                maxHeight: '500px', 
                objectFit: 'contain',
                borderRadius: 1
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500?text=Image+Error';
              }}
            />
          </Grid>
          
          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {product?.name || 'Product Name Unavailable'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating 
                value={parseFloat(product?.rating) || 0} 
                precision={0.5} 
                readOnly 
              />
              <Typography variant="body1" sx={{ ml: 1 }}>
                ({product?.numReviews || 0} reviews)
              </Typography>
            </Box>
            
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', my: 2 }}>
              ${parseFloat(product?.price || 0).toFixed(2)}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {product?.description || 'No description available for this product.'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Status:
              </Typography>
              <Typography 
                variant="body1" 
                color={(product?.countInStock || 0) > 0 ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {(product?.countInStock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
              </Typography>
            </Box>
            
            {(product?.countInStock || 0) > 0 && (
              <Box sx={{ mb: 3 }}>
                <FormControl sx={{ width: 120 }}>
                  <InputLabel>Quantity</InputLabel>
                  <Select
                    value={quantity}
                    onChange={handleQuantityChange}
                    label="Quantity"
                  >
                    {[...Array(Math.min(product?.countInStock || 0, 10)).keys()].map(x => (
                      <MenuItem key={x + 1} value={x + 1}>
                        {x + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<AddShoppingCart />}
              disabled={(product?.countInStock || 0) === 0}
              onClick={handleAddToCart}
              fullWidth
              sx={{ 
                py: 1.5,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                transition: 'background-color 0.3s'
              }}
            >
              Add to Cart
            </Button>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Category: <b>{product?.category || 'Uncategorized'}</b>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetailPage;
