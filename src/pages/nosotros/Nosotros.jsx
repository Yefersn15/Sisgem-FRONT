import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../context/ConfiguracionContext';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const VALORES = [
  {
    icon: 'fa-boxes-stacked',
    titulo: 'Inventario real, sin sorpresas',
    texto: 'El stock que ves es el que hay: cada venta y cada domicilio descuentan del inventario al instante, para que nunca vendas algo que ya no tienes.',
  },
  {
    icon: 'fa-truck-fast',
    titulo: 'Domicilios rastreables',
    texto: 'Desde que se aprueba el pedido hasta que llega a la puerta, puedes ver en qué estado va: asignado, en camino o entregado.',
  },
  {
    icon: 'fa-tags',
    titulo: 'Precios transparentes',
    texto: 'Lo que se muestra en el catálogo es lo que se cobra. Sin letra pequeña ni cargos que aparecen al final de la compra.',
  },
  {
    icon: 'fa-headset',
    titulo: 'Soporte post-venta',
    texto: 'Si algo sale mal con un pedido o un pago, hay una persona real revisando tu caso, no un formulario que nadie lee.',
  },
];

const Nosotros = () => {
  const { nombreTienda, descripcion } = useConfiguracion();

  useAyudaPagina({
    titulo: 'Nosotros',
    contenido: <p>Quiénes están detrás de {nombreTienda}: cómo trabajamos y qué puedes esperar al comprar aquí.</p>,
  });

  return (
    <div>
      <div className="py-5" style={{ background: 'var(--accent-dim)' }}>
        <div className="container text-center" style={{ maxWidth: 720 }}>
          <div className="small text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.08em' }}>Nosotros</div>
          <h1 className="mb-3">Detrás de {nombreTienda}</h1>
          <p className="mb-0 fs-5">
            {descripcion || 'Una tienda pensada para que comprar sea rápido, claro y sin vueltas.'}
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5 align-items-start mb-5">
          <div className="col-md-6">
            <h2 className="mb-3"><i className="fas fa-lightbulb me-2" style={{ color: 'var(--accent)' }}></i>Cómo trabajamos</h2>
            <p>
              {nombreTienda} nació para resolver un problema simple: administrar el inventario, las ventas y los domicilios de
              una tienda desde un solo lugar, sin planillas sueltas ni cuadernos de pedidos.
            </p>
            <p>
              Cada producto, marca y categoría se gestiona con el mismo cuidado, para que el catálogo que ves siempre refleje
              lo que realmente hay disponible.
            </p>
          </div>
          <div className="col-md-6">
            <h2 className="mb-3"><i className="fas fa-bullseye me-2" style={{ color: 'var(--accent)' }}></i>Lo que buscamos</h2>
            <p>
              Que comprar aquí sea tan simple como debería ser siempre: buscar el producto, ver el precio real, pagar y saber
              en qué momento llega.
            </p>
            <p>
              Del lado del negocio, la idea es la misma: que administrar la tienda no se sienta como una tarea aparte, sino
              como parte natural de atender a los clientes.
            </p>
          </div>
        </div>

        <h2 className="text-center mb-4">Lo que no negociamos</h2>
        <div className="row g-4 mb-5">
          {VALORES.map((v) => (
            <div className="col-sm-6 col-lg-3" key={v.titulo}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <i className={`fas ${v.icon} fa-lg mb-3`} style={{ color: 'var(--accent)' }}></i>
                  <h5 className="card-title">{v.titulo}</h5>
                  <p className="card-text text-muted small mb-0">{v.texto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted mb-3">¿Ya tienes una cuenta o quieres ver qué hay disponible?</p>
          <Link to="/productos" className="btn btn-primary btn-lg">
            <i className="fas fa-shopping-bag me-2"></i>Explorar productos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;
