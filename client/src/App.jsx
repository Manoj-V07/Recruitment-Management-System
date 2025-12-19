import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import HR from './pages/HR';
import Jobs from './pages/Jobs';

const isAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!token && !!user;
};

const getRole = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.role : null;
  } catch {
    return null;
  }
};

const Protected = ({ children, allowed }) => {
  if (!isAuth()) return <Navigate to="/login" />;
  const userRole = getRole();
  if (allowed && (!userRole || !allowed.includes(userRole))) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={
          <Protected allowed={['admin']}>
            <Admin />
          </Protected>
        } />

        <Route path="/hr" element={
          <Protected allowed={['hr']}>
            <HR />
          </Protected>
        } />

        <Route path="/jobs" element={<Jobs />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
