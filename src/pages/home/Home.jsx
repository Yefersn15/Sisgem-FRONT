import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import CartContext from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useHomeData } from './hooks/useHomeData';
import { useInfiniteCarousel } from './hooks/useInfiniteCarousel';
import BannerCarousel from './components/BannerCarousel';
import HomeProductoModal from './components/HomeProductoModal';
import HomeSearchBar from './components/HomeSearchBar';
import CategoriaCarousel from './components/CategoriaCarousel';
import InfiniteCarousel from '../../components/InfiniteCarousel';
import { useToast } from '../../context/ToastContext';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const Home = ({ vistaLlamativa }) => {
  useAyudaPagina({
    titulo: 'Bienvenido',
    contenido: (
      <>
        <p>Usa el buscador para encontrar un producto, o navega por marca y categoría más abajo. Puedes ver el catálogo completo sin necesidad de iniciar sesión; solo se pide cuenta al momento de pagar.</p>
        <p>El menú de apariencia del encabezado incluye "Vista de inicio": cambia entre el diseño habitual y uno alternativo con productos y marcas desplazándose en los bordes de la pantalla (solo visible en pantallas grandes); la elección se recuerda para la próxima vez.</p>
      </>
    ),
  });
  const { banners, marcas, destacados, categorias, productos } = useHomeData();
  const [modalProducto, setModalProducto] = useState(null);
  const toast = useToast();
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
    toast.success('Producto agregado al carrito');
    closeModal();
  };

  return (
    <div className={vistaLlamativa ? 'vista-llamativa-activa' : ''}>
      {vistaLlamativa && destacados.length > 0 && (
        <div className="home-borde-carrusel izquierda d-none d-lg-block">
          <InfiniteCarousel
            items={destacados}
            direction="vertical"
            itemHeight={150}
            renderItem={(p) => (
              <div className="card shadow-sm" style={{ cursor: 'pointer' }} onClick={() => openProducto(p)}>
                <img
                  src={p.fotoUrl || p.foto || 'https://via.placeholder.com/400'}
                  className="card-img-top"
                  alt={p.nombre}
                  style={{ height: 110, objectFit: 'contain', backgroundColor: 'var(--surface2)' }}
                />
              </div>
            )}
          />
        </div>
      )}

      {vistaLlamativa && marcas.length > 0 && (
        <div className="home-borde-carrusel derecha d-none d-lg-block">
          <InfiniteCarousel
            items={marcas}
            direction="vertical"
            itemHeight={130}
            renderItem={(m) => (
              <Link to={`/productos/por-marca/${m.id}`} className="d-flex align-items-center justify-content-center bg-white rounded shadow-sm" style={{ height: 110 }}>
                <img src={m.logoUrl || m.logo || ''} alt={m.nombre} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
              </Link>
            )}
          />
        </div>
      )}

      <div className={`container py-4 ${vistaLlamativa ? 'home-borde-margen' : ''}`}>
        <BannerCarousel
          banners={banners}
          canManageBanners={canManageBanners}
        />

        <HomeSearchBar />

        <div className="oculta-en-llamativa">
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
        </div>

        {categorias.length > 0 && (
          <>
            <h2 className="mb-3">Explora por Categoría</h2>
            {categorias.map((cat) => (
              <CategoriaCarousel
                key={cat.id}
                categoria={cat}
                productos={productos.filter((p) => String(p.categoriaId) === String(cat.id))}
                onOpenProducto={openProducto}
              />
            ))}
          </>
        )}

        <HomeProductoModal producto={modalProducto} onClose={closeModal} onAdd={handleAdd} />
      </div>
    </div>
  );
};

export default Home;
