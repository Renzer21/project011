import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Badge, 
  IconButton,
  Box
} from '@mui/material';
import { ShoppingCart, Person, Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary" sx={{ mb: 4 }}>
      <Toolbar sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'white',
            fontWeight: 'bold',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          ShopEasy
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/products"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Products
          </Button>
          
          {user ? (
            <>
              <IconButton 
                color="inherit" 
                component={Link} 
                to="/cart"
                sx={{ ml: { xs: 1, sm: 2 } }}
              >
                <Badge badgeContent={cartItems?.length || 0} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              
              <IconButton 
                color="inherit" 
                component={Link} 
                to="/profile"
                sx={{ ml: { xs: 1, sm: 2 } }}
              >
                <Person />
              </IconButton>
              
              {user?.isAdmin && (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/admin"
                  sx={{ 
                    ml: { xs: 1, sm: 2 },
                    display: { xs: 'none', md: 'inline-flex' }
                  }}
                >
                  Admin
                </Button>
              )}
              
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                sx={{ ml: { xs: 1, sm: 2 } }}
              >
                <Logout />
              </IconButton>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                sx={{ ml: { xs: 1, sm: 2 } }}
              >
                Login
              </Button>
              
              <Button 
                color="inherit" 
                component={Link} 
                to="/register"
                sx={{ ml: { xs: 1, sm: 2 } }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
