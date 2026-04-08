import React, { useEffect, useState, useContext, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBanners, getMarcas, getProductos, getCategorias, createBanner, updateBanner, deleteBanner, formatPrice, getTopProductos } from '../../services/dataService';
import CartContext from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
    const [banners, setBanners] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [destacados, setDestacados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [modalProducto, setModalProducto] = useState(null);
    const { addToCart } = useContext(CartContext);
    const { hasPermission } = useAuth();
    const canManageBanners = hasPermission('Banners');

    useEffect(() => {
        const init = async () => { await reloadAll(); };
        init();
    }, []);

    const [marcaGroupSize, setMarcaGroupSize] = useState(5);

    useEffect(() => {
        const updateGroupSize = () => {
            const w = window.innerWidth;
            if (w >= 1200) setMarcaGroupSize(5);
            else if (w >= 992) setMarcaGroupSize(4);
            else if (w >= 768) setMarcaGroupSize(3);
            else if (w >= 576) setMarcaGroupSize(2);
            else setMarcaGroupSize(1);
        };
        updateGroupSize();
        window.addEventListener('resize', updateGroupSize);
        return () => window.removeEventListener('resize', updateGroupSize);
    }, []);

    const navigate = useNavigate();

    const reloadAll = async () => {
        const b = await getBanners() || [];
        b.sort((a, c) => (a.displayOrder || 0) - (c.displayOrder || 0));
        setBanners(b.filter(x => x.activo !== false));

        const m = await getMarcas() || [];
        setMarcas(m.filter(x => x.activo !== false));

        // Obtener productos más vendidos (top 10 para el carrusel)
        const topVendidos = await getTopProductos(10);
        const p = await getProductos() || [];
        const activos = p.filter(x => x.activo !== false);
        
        // Si hay ventas, usar los más vendidos; si no, usar los más recientes
        if (topVendidos.length > 0) {
            const topIds = topVendidos.map(t => t.productoId);
            const topProducts = activos.filter(prod => topIds.includes(prod.id));
            // Mantener el orden de los más vendidos
            const orderedTop = topIds.map(id => topProducts.find(p => String(p.id) === String(id))).filter(Boolean);
            // Si no encuentra productos (IDs no coinciden), usar los más recientes
            if (orderedTop.length > 0) {
                setDestacados(orderedTop);
            } else {
                activos.sort((a, b2) => new Date(b2.fechaCreacion || 0) - new Date(a.fechaCreacion || 0));
                setDestacados(activos.slice(0, 12));
            }
        } else {
            activos.sort((a, b2) => new Date(b2.fechaCreacion || 0) - new Date(a.fechaCreacion || 0));
            setDestacados(activos.slice(0, 12));
        }

        const cats = await getCategorias() || [];
        setCategorias(cats.filter(x => x.activo !== false));
    };

    const trackRef = useRef(null);
    const trackRefProductos = useRef(null);
    const [translatePx, setTranslatePx] = useState(0);
    const [translatePxProductos, setTranslatePxProductos] = useState(0);

    useLayoutEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const total = el.scrollWidth || 0;
        const half = Math.floor(total / 2);
        setTranslatePx(-half);
        el.style.setProperty('--translate-x', `${-half}px`);
        const dur = Math.max(8, Math.round(half / 60));
        el.style.animationDuration = `${dur}s`;
    }, [marcas]);

    useLayoutEffect(() => {
        const el = trackRefProductos.current;
        if (!el) return;
        const total = el.scrollWidth || 0;
        const half = Math.floor(total / 2);
        setTranslatePxProductos(-half);
        el.style.setProperty('--translate-x', `${-half}px`);
        const dur = Math.max(8, Math.round(half / 60));
        el.style.animationDuration = `${dur}s`;
    }, [destacados]);

    const [successMessage, setSuccessMessage] = useState('');
    const [modalCantidad, setModalCantidad] = useState(1);

    const openProducto = (producto) => {
        const marcaObj = marcas.find(m => String(m.id) === String(producto.marcaId));
        const catObj = categorias.find(c => String(c.id) === String(producto.categoriaId));
        setModalProducto({
            ...producto,
            marcaNombre: marcaObj?.nombre || '',
            categoriaNombre: catObj?.nombre || ''
        });
        setModalCantidad(1);
    };

    const closeModal = () => {
        setModalProducto(null);
        setModalCantidad(1);
    };

    const handleAdd = (producto, cantidad = 1) => {
        addToCart(producto.id, Number(cantidad));
        alert('Producto agregado al carrito');
        closeModal();
    };

    const handleCreateBanner = () => {
        const imageUrl = window.prompt('URL de la imagen del banner:');
        if (!imageUrl) return;
        const titulo = window.prompt('Título (opcional):') || '';
        createBanner({ imageUrl, titulo, activo: true, displayOrder: (banners.length || 0) + 1 });
        reloadAll();
    };

    const handleEditBanner = (b) => {
        const imageUrl = window.prompt('Nueva URL de la imagen:', b.imageUrl || '');
        if (imageUrl === null) return;
        const titulo = window.prompt('Nuevo título (opcional):', b.titulo || '') || '';
        updateBanner(b.id, { imageUrl, titulo });
        reloadAll();
    };

    const handleDeleteBanner = (b) => {
        if (!window.confirm('Eliminar banner?')) return;
        deleteBanner(b.id);
        reloadAll();
    };

    return (
        <div className="container py-4">
            {/* Banners */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h3 className="mb-3">Banners</h3>
                {canManageBanners && (
                    <div>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={handleCreateBanner}>Agregar Banner</button>
                    </div>
                )}
            </div>
            {banners.length > 0 ? (
                <div id="bannerCarousel" className="carousel slide mb-5" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        {banners.map((ban, idx) => (
                            <div key={ban.id} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                                <div style={{ position: 'relative' }}>
                                    <img src={ban.imageUrl || ban.ImageUrl || ''} className="d-block w-100" alt={ban.titulo || ban.title || ''} />
                                    {canManageBanners && (
                                        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 20 }}>
                                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditBanner(ban)} title="Editar">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteBanner(ban)} title="Eliminar">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {banners.length > 1 && (
                        <>
                            <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Anterior</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Siguiente</span>
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="text-muted mb-5">No hay banners disponibles.</div>
            )}

            {/* Marcas */}
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

            {/* Productos Destacados - Carrusel infinito */}
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

            {/* Modal simple de producto (solo vista y agregar al carrito) */}
            {modalProducto && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">{modalProducto.nombre}</h3>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {/* Izquierda: info */}
                                    <div className="col-md-7">
                                        <div className="mb-4">
                                            <h5 className="text-muted">
                                                <Link to={`/productos/por-categoria/${modalProducto.categoriaId}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
                                                    <i className="fas fa-tag me-1"></i>{modalProducto.categoriaNombre || 'Categoría'}
                                                </Link>
                                            </h5>
                                            <div className="mb-3">
                                                <Link to={`/productos/por-marca/${modalProducto.marcaId}`} className="badge bg-secondary me-1 text-decoration-none" onClick={(e) => e.stopPropagation()}>
                                                    <i className="fas fa-industry me-1"></i>{modalProducto.marcaNombre || 'Marca'}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p><strong>Código Único:</strong> <span className="text-muted">{modalProducto.codigoUnico || modalProducto.codigo || '-'}</span></p>
                                            <p><strong>Precio:</strong> <span className="text-primary h5">{formatPrice(modalProducto.precioUnitario || modalProducto.precio || 0)}</span></p>
                                            <p>
                                                <strong>Stock:</strong>{' '}
                                                <span className={`badge ${(modalProducto.stockDisponible || modalProducto.stock) > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                    {(modalProducto.stockDisponible || modalProducto.stock) || 0} unidades
                                                </span>
                                            </p>
                                        </div>

                                        <hr />

                                        <div className="mb-4">
                                            <h5>Descripción</h5>
                                            <p className="text-justify">{modalProducto.descripcion}</p>
                                        </div>

                                        {((modalProducto.stockDisponible || modalProducto.stock) > 0) && (
                                            <div className="d-flex align-items-center justify-content-end">
                                                <input
                                                    type="number"
                                                    className="form-control me-2"
                                                    style={{ width: '60px' }}
                                                    min={1}
                                                    max={(modalProducto.stockDisponible || modalProducto.stock) || 1}
                                                    value={modalCantidad}
                                                    onChange={(e) => {
                                                        const v = parseInt(e.target.value || '1', 10);
                                                        setModalCantidad(Math.max(1, Math.min((modalProducto.stockDisponible || modalProducto.stock) || 1, isNaN(v) ? 1 : v)));
                                                    }}
                                                />
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleAdd(modalProducto, modalCantidad)}
                                                >
                                                    <i className="fas fa-cart-plus me-2"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Derecha: imagen */}
                                    <div className="col-md-5 text-center">
                                        {modalProducto.fotoUrl ? (
                                            <img
                                                src={modalProducto.fotoUrl}
                                                className="img-fluid rounded shadow mb-3"
                                                alt={modalProducto.nombre}
                                                style={{ maxHeight: '300px', width: 'auto', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div className="text-muted" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fas fa-image fa-5x"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;