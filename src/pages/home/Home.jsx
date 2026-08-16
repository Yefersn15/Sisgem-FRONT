import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import CartContext from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useHomeData } from './hooks/useHomeData';
import { useInfiniteCarousel } from './hooks/useInfiniteCarousel';
import BannerCarousel from './components/BannerCarousel';
import HomeProductoModal from './components/HomeProductoModal';

const Home = () => {
  const { banners, marcas, destacados, categorias } = useHomeData();
  const [modalProducto, setModalProducto] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { hasPermission } = useAuth();
  const canManageBanners = hasPermission('Banners');

  const { trackRef, translatePx } = useInfiniteCarousel(marcas);
  const { trackRef: trackRefProductos, translatePx: translatePxProductos } = useInfiniteCarousel(destacados);

  const openProducto = (producto) => {
    const marcaObj = marcas.find(m => String(m.id) === String(producto.marcaId));
    const catObj = categorias.find(c => String(c.id) === String(producto.categoriaId));
    setModalProducto({
      ...producto,
      marcaNombre: marcaObj?.nombre || '',
      categoriaNombre: catObj?.nombre || ''
    });
  };

  const closeModal = () => setModalProducto(null);

  const handleAdd = (producto, cantidad = 1) => {
    addToCart(producto.id, Number(cantidad));
    alert('Producto agregado al carrito');
    closeModal();
  };

  return (
    <div className="container py-4">
      <BannerCarousel
        banners={banners}
        canManageBanners={canManageBanners}
      />

      <h3 className="mb-3"><Link to="/productos" className="text-decoration-none">Nuestras Marcas</Link></h3>
      {marcas.length > 0 ? (
        <div className="infinite-brands-wrapper mb-5">
          <div ref={trackRef} className="infinite-brands-track" style={{ ['--translate-x']: `${translatePx}px` }}>
            {([...(marcas || []), ...(marcas || [])]).map((m, idx) => (
              <div key={`${m.id}-${idx}`} className="infinite-brand-item">
                <Link to={`/productos/por-marca/${m.id}`} className="text-decoration-none">
                  <img src={m.logoUrl || m.logo || ''} alt={m.nombre} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-muted mb-5">No hay marcas disponibles.</div>
      )}

      <h3 className="mb-3"><Link to="/productos" className="text-decoration-none">Productos Destacados</Link></h3>
      {destacados.length > 0 ? (
        <div className="infinite-brands-wrapper productos mb-5">
          <div ref={trackRefProductos} className="infinite-brands-track" style={{ ['--translate-x']: `${translatePxProductos}px` }}>
            {([...(destacados || []), ...(destacados || [])]).map((p, idx) => (
              <div key={`${p.id}-${idx}`} className="infinite-product-item">
                <div className="card shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => openProducto(p)}>
                  <img
                    src={p.fotoUrl || p.foto || 'https://via.placeholder.com/400'}
                    className="card-img-top"
                    alt={p.nombre}
                    style={{ backgroundColor: 'var(--surface2)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-muted mb-5">No hay productos destacados.</div>
      )}

      <HomeProductoModal producto={modalProducto} onClose={closeModal} onAdd={handleAdd} />
    </div>
  );
};

export default Home;
