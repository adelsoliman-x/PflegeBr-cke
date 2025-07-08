import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false, subscriptionOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // أو سبينر لو حبيت

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/jobs" replace />;
  }

  // التحقق من الاشتراك
 if (subscriptionOnly) {
  const expiryRaw = user.subscription?.expiryDate || user.subscription_end;

  if (!expiryRaw) {
    return <Navigate to="/subscription-expired" replace />;
  }

  const expiryDate = new Date(expiryRaw);
  const now = new Date();

  if (expiryDate < now) {
    return <Navigate to="/subscription-expired" replace />;
  }
}


  return children;
};

export default ProtectedRoute;
