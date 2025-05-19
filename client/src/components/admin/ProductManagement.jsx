import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Close 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';

const API_URL = 'http://localhost:5000/api';

const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Toys', 'Beauty'];

const initialProductState = {
  name: '',
  description: '',
  price: '',
  image: '',
  category: '',
  countInStock: '',
  rating: 0,
  numReviews: 0
};

const ProductManagement = () => {
  const { user } = useAuth();
  const { 
    products, 
    loading, 
    error, 
    success, 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    resetSuccess 
  } = useProducts();
  const [openDialog, setOpenDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productData, setProductData] = useState(initialProductState);
  const [successMessage, setSuccessMessage] = useState('');

  // Effect to update the success message when a product operation is successful
  useEffect(() => {
    if (success) {
      if (editProduct) {
        setSuccessMessage('Product updated successfully!');
      } else {
        setSuccessMessage('Product operation completed successfully!');
      }
      
      // Clear success message after 3 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
        resetSuccess();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, editProduct, resetSuccess]);

  // Products are already loaded via ProductContext

  const handleDialogOpen = (product = null) => {
    if (product) {
      setEditProduct(product);
      setProductData({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        countInStock: product.countInStock,
        rating: product.rating,
        numReviews: product.numReviews
      });
    } else {
      setEditProduct(null);
      setProductData(initialProductState);
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditProduct(null);
    setProductData(initialProductState);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'countInStock' ? 
        (value === '' ? '' : Number(value)) : value
    }));
  };

  const validateForm = () => {
    const { name, description, price, image, category, countInStock } = productData;
    if (!name || !description || !price || !image || !category || !countInStock) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editProduct) {
        // Update existing product
        await updateProduct(editProduct._id, productData);
      } else {
        // Create new product
        await createProduct(productData);
      }
      
      handleDialogClose();
    } catch (err) {
      // Error is already handled by the context
      console.error('Error in product operation:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setSuccessMessage('Product deleted successfully!');
      } catch (err) {
        // Error is already handled by the context
        console.error('Error deleting product:', err);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Product Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleDialogOpen()}
        >
          Add New Product
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {loading && !openDialog ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1">No products found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={product.image}
                        alt={product.name}
                        sx={{ width: 50, height: 50, objectFit: 'contain' }}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" />
                    </TableCell>
                    <TableCell>{product.countInStock}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={product.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({product.numReviews})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleDialogOpen(product)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {editProduct ? 'Edit Product' : 'Add New Product'}
          <IconButton
            onClick={handleDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Product Name"
                  value={productData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="price"
                  label="Price"
                  type="number"
                  value={productData.price}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={productData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="countInStock"
                  label="Count In Stock"
                  type="number"
                  value={productData.countInStock}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="image"
                  label="Image URL"
                  value={productData.image}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                  helperText="Enter a URL for the product image"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={productData.description}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                  multiline
                  rows={4}
                />
              </Grid>
              
              {editProduct && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Rating
                      </Typography>
                      <Rating
                        name="rating"
                        value={Number(productData.rating)}
                        onChange={(e, newValue) => {
                          setProductData({
                            ...productData,
                            rating: newValue
                          });
                        }}
                        precision={0.5}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="numReviews"
                      label="Number of Reviews"
                      type="number"
                      value={productData.numReviews}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : (editProduct ? 'Update Product' : 'Add Product')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
