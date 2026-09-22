import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/navbar/Navbar.jsx';
import ProtectedRoute from './components/protectedroute/ProtectedRoute.jsx';
import Home from './pages/home/Home.jsx';
import Equipment from './pages/equipment/Equipment.jsx';
import CheckOut from './pages/checkout/CheckOut.jsx';
import CheckIn from './pages/checkin/CheckIn.jsx';
import History from './pages/history/History.jsx';
import Login from './pages/login/Login.jsx';
import Register from './pages/register/Register.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/equipment" element={
            <ProtectedRoute>
              <Equipment />
            </ProtectedRoute>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <CheckOut />
            </ProtectedRoute>
          } />

          <Route path="/checkin" element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <CheckIn />
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;