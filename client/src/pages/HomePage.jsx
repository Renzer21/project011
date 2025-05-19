import React from 'react';
import { Typography, Container, Button, Grid, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const HomePage = () => {
  const { products, loading, error } = useProducts();

  // Get featured products (e.g., products with highest rating)
  const featuredProducts = products
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Hero Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 6, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #4568dc, #b06ab3)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to ShopEasy
        </Typography>
        <Typography variant="h6" paragraph sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
          Discover amazing products at unbeatable prices. Your one-stop shop for all your needs.
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large" 
          component={Link} 
          to="/products"
          sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
        >
          Shop Now
        </Button>
      </Paper>

      {/* Featured Products Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Featured Products
          </Typography>
          <Button variant="outlined" component={Link} to="/products">
            View All
          </Button>
        </Box>

        {loading ? (
          <Loader />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={4} sx={{ width: '100%' }}>
            {featuredProducts.map((product) => (
              <Grid item key={product?._id} xs={12} sm={6} md={4} lg={3} xl={2.4}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
          Shop by Category
        </Typography>
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {['Electronics', 'Clothing', 'Home & Kitchen', 'Books'].map((category) => (
            <Grid item key={category} xs={12} sm={6} md={4} lg={3} xl={2.4}>
              <Paper
                sx={{
                  height: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
                component={Link}
                to={`/products?category=${category}`}
                style={{ textDecoration: 'none' }}
              >
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  {category}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Explore {category.toLowerCase()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
