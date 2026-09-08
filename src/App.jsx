import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import RutasPublicas from './components/Rutas';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ConfiguracionProvider } from './context/ConfiguracionContext';
import { AyudaProvider } from './context/AyudaContext';
import LoadingState from './components/LoadingState';
import ConnectionWatcher from './components/ConnectionWatcher';
import './App.css';

// Componente para redirigir según el rol después del login
const AuthRouter = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <LoadingState />;

  // Si es admin, va directamente a /admin
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  // Para usuarios normales, va al home
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <ConfiguracionProvider>
            <AyudaProvider>
              <AuthProvider>
                <CartProvider>
                  <ConnectionWatcher />
                  <Routes>
                    {/* Ruta para redirigir según el rol */}
                    <Route path="/auth-router" element={<AuthRouter />} />

                    {/* Rutas del admin con su propio layout (AdminLayout renderiza sus rutas internas) */}
                    <Route path="/admin/*" element={<AdminLayout />} />

                    {/* Rutas públicas con layout normal */}
                    <Route path="/*" element={
                      <Layout>
                        <RutasPublicas />
                      </Layout>
                    } />
                  </Routes>
                </CartProvider>
              </AuthProvider>
            </AyudaProvider>
          </ConfiguracionProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;