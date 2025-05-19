import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ProductManagement from '../components/admin/ProductManagement';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2 }}
        >
          <Tab label="Product Management" />
          <Tab label="User Management" />
          <Tab label="Orders" />
        </Tabs>
        <Divider />

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <ProductManagement />}
          {activeTab === 1 && <UserManagement />}
          {activeTab === 2 && (
            <Box sx={{ py: 3 }}>
              <Typography variant="h6">Orders Management</Typography>
              <Typography variant="body1" color="text.secondary">
                Order management functionality to be implemented.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;
