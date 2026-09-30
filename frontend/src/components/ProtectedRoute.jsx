import { useAuth } from '@clerk/react';
import { Navigate } from 'react-router';

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-ikkilamchi">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;