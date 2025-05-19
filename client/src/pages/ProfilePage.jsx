import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Divider,
  Avatar,
  Alert,
  Snackbar
} from '@mui/material';
import { PersonOutline, Save } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Loader from '../components/Loader';

const ProfilePage = () => {
  const { user, updateUserInfo } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirmPassword: ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Only include password in the update if it's provided
      const updateData = {
        name: formData.name,
        email: formData.email
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await axios.put(
        `http://localhost:5000/api/users/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update auth context with new user info
      if (updateUserInfo) {
        updateUserInfo(response.data);
      }
      
      setSuccess(true);
      
      // Clear password fields
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  if (!user) return null; // This prevents flash of content before redirect
  if (loading) return <Loader />;

  return (
    <Container maxWidth={false} sx={{ width: '100%', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'primary.main'
              }}
            >
              <PersonOutline sx={{ fontSize: 64 }} />
            </Avatar>

            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left', mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Account Status
              </Typography>
              <Typography variant="body1">
                Active
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'left', mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Account Type
              </Typography>
              <Typography variant="body1">
                {user.isAdmin ? 'Administrator' : 'Customer'}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'left', mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Member Since
              </Typography>
              <Typography variant="body1">
                {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Edit Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Edit Profile
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Update Password (leave blank to keep current password)
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    size="large"
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
