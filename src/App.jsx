import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import React from 'react';
import './index.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Operator from './pages/Operator';
import Supervisor from './pages/Supervisor';
import { verifyToken, clearAuth } from './utils/auth';

const PrivateRoute = React.memo(({ element, allowedRoles }) => {
  const auth = verifyToken();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (!auth) {
      clearAuth();
      navigate('/', { replace: true });
    } else if (allowedRoles && !allowedRoles.includes(auth.role)) {
      clearAuth();
      navigate('/', { replace: true });
    }
  }, [auth, navigate, allowedRoles]);

  return auth ? element : null;
});

PrivateRoute.displayName = 'PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/:operatorName/operator"
          element={
            <PrivateRoute 
              element={<Operator />} 
              allowedRoles={['operator']}
            />
          }
        />
        <Route
          path="/supervisor"
          element={
            <PrivateRoute 
              element={<Supervisor />} 
              allowedRoles={['supervisor']}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;