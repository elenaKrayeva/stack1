import { useState } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/store';
import { logoutApi } from '@/features/auth/api';


export const Logout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearUser();
      localStorage.removeItem('auth'); 
      setLoading(false);
      navigate('/', { replace: true });
    }
  };

  return (
    <Button
      color="inherit"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Logout"
    >
      Logout
    </Button>
  );
};
