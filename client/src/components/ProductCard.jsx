import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardActions, 
  CardContent, 
  CardMedia, 
  Button, 
  Typography,
  Rating,
  Box
} from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product || !product._id) {
      console.error('Cannot add to cart: Invalid product data');
      return;
    }

    if (user) {
      addToCart(user._id, product._id, 1);
    } else {
      // Redirect to login or show a message
      alert("Please login to add items to cart");
    }
  };

  return (
    <Card sx={{ 
      maxWidth: 345, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s',
      '&:hover': {
        transform: 'scale(1.03)',
        boxShadow: 3
      }
    }}>
      <CardMedia
        component="img"
        height="200"
        image={product?.image || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={product?.name || 'Product Image'}
        sx={{ objectFit: 'contain', p: 2 }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {product?.name || 'Product Name Unavailable'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product?.description ? (product.description.length > 100 
            ? `${product.description.substring(0, 100)}...` 
            : product.description) : 'No description available'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            name="read-only" 
            value={parseFloat(product?.rating) || 0} 
            precision={0.5} 
            readOnly 
            size="small"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({product?.numReviews || 0} reviews)
          </Typography>
        </Box>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          ${(parseFloat(product?.price) || 0).toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          component={Link} 
          to={product && product._id ? `/products/${product._id}` : '#'}
          onClick={(e) => {
            if (!product || !product._id) {
              e.preventDefault();
              alert('Product details not available');
            }
          }}
          size="small" 
          variant="outlined"
          disabled={!product || !product._id}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          View Details
        </Button>
        <Button 
          size="small" 
          color="primary" 
          variant="contained" 
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          disabled={(product?.countInStock || 0) === 0 || !product?._id}
          sx={{ 
            ml: 'auto',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            transition: 'background-color 0.3s'
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
