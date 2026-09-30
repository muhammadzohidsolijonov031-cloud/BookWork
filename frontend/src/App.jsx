import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;