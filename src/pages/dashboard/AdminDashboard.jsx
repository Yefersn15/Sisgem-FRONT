import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getVentas, 
  getProductos, 
  getProveedores, 
  getUsuarios,
  getOrdenesCompra,
  getDomicilios,
  getTopProductos,
  getTopByBrand,
  getTopByCategory,
  formatPrice 
} from '../../services/dataService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    ventasSemana: 0,
    productos: 0,
    proveedores: 0,
    usuarios: 0,
    ordenes: 0,
    domiciliosPendientes: 0
  });
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  // Analytics state (fusionado desde AdminAnalytics)
  const [topProductos, setTopProductos] = useState([]);
  const [topMarcas, setTopMarcas] = useState([]);
  const [topCategorias, setTopCategorias] = useState([]);
  const [chartDataSemana, setChartDataSemana] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const ventas = (await getVentas()) || [];
      const productos = await getProductos() || [];
      const proveedores = await getProveedores() || [];
      const usuarios = await getUsuarios() || [];
      const ordenes = (await getOrdenesCompra()) || [];
      const domicilios = await getDomicilios() || [];

      // Calcular ventas de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const ventasHoy = ventas.filter(v => {
        const fecha = new Date(v.fecha || v.fechaVenta);
        return fecha >= hoy;
      });

      // Calcular ventas del mes
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ventasMes = ventas.filter(v => {
        const fecha = new Date(v.fecha || v.fechaVenta);
        return fecha >= inicioMes;
      });

      // Calcular ventas de la semana
      const hace7Dias = new Date(hoy);
      hace7Dias.setDate(hoy.getDate() - 7);
      const ventasSemana = ventas.filter(v => {
        const fecha = new Date(v.fecha || v.fechaVenta);
        return fecha >= hace7Dias && fecha <= hoy;
      });

      // Domicilios pendientes (usar estados unificados en lowercase)
      const domPendientes = domicilios.filter(d => {
        const e = String(d.estado || '').toLowerCase();
        return e === 'pendiente' || e === 'aprobado' || e === 'enviado';
      });

      // Ventas recientes (últimas 5)
      const recientes = [...ventas]
        .sort((a, b) => new Date(b.fecha || b.fechaVenta) - new Date(a.fecha || a.fechaVenta))
        .slice(0, 5);

      setStats({
        ventasHoy: ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0),
        ventasMes: ventasMes.reduce((sum, v) => sum + (v.total || 0), 0),
        ventasSemana: ventasSemana.reduce((sum, v) => sum + (v.total || 0), 0),
        productos: productos.length,
        proveedores: proveedores.length,
        usuarios: usuarios.length,
        ordenes: ordenes.length,
        domiciliosPendientes: domPendientes.length
      });

      setVentasRecientes(recientes);
      setTopProductos(await getTopProductos(15));
      setTopMarcas(await getTopByBrand(15));
      setTopCategorias(await getTopByCategory(15));

      // Datos para gráfico de últimos 7 días
      const dias = [];
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];
        const ventasDiaData = ventas.filter(v => (v.fecha || v.fechaVenta || '').toString().split('T')[0] === fechaStr);
        dias.push({
          dia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
          ventas: ventasDiaData.reduce((s, v) => s + (v.total || 0), 0)
        });
      }
      setChartDataSemana(dias);
      setLoading(false);
    };

    cargarDatos();
  }, []);

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const e = String(estado || '').toLowerCase();
    const estados = {
      'pendiente': 'bg-warning',
      'porvalidar': 'bg-info',
      'completada': 'bg-success',
      'anulada': 'bg-danger',
      'rechazada': 'bg-danger',
      'cancelado': 'bg-secondary',
      'entregado': 'bg-success'
    };
    return estados[e] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Ventas Hoy</p>
                  <h4 className="mb-0">{formatPrice(stats.ventasHoy)}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="fas fa-dollar-sign text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Ventas Semana</p>
                  <h4 className="mb-0">{formatPrice(stats.ventasSemana)}</h4>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="fas fa-calendar-week text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Ventas Mes</p>
                  <h4 className="mb-0">{formatPrice(stats.ventasMes)}</h4>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="fas fa-chart-line text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Productos</p>
                  <h4 className="mb-0">{stats.productos}</h4>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="fas fa-box text-warning fs-4"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link to="/productos" className="small">Ver productos <i className="fas fa-arrow-right ms-1"></i></Link>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Usuarios</p>
                  <h4 className="mb-0">{stats.usuarios}</h4>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="fas fa-users text-info fs-4"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link to="/admin/usuarios" className="small">Ver usuarios <i className="fas fa-arrow-right ms-1"></i></Link>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Proveedores</p>
                  <h4 className="mb-0">{stats.proveedores}</h4>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <i className="fas fa-truck text-secondary fs-4"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link to="/proveedores" className="small">Ver proveedores <i className="fas fa-arrow-right ms-1"></i></Link>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Órdenes Compra</p>
                  <h4 className="mb-0">{stats.ordenes}</h4>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="fas fa-clipboard-list text-danger fs-4"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link to="/ordenes" className="small">Ver órdenes <i className="fas fa-arrow-right ms-1"></i></Link>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Domicilios Pendientes</p>
                  <h4 className="mb-0">{stats.domiciliosPendientes}</h4>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="fas fa-shipping-fast text-warning fs-4"></i>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link to="/admin/domicilios" className="small">Ver domicilios <i className="fas fa-arrow-right ms-1"></i></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Removed as per user request */}

      {/* Recent Sales */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Ventas Recientes</h5>
          <Link to="/admin/ventas" className="btn btn-sm btn-outline-primary">
            Ver todas
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th className="text-end">Total</th>
                  <th>Estado</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                {ventasRecientes.length > 0 ? (
                  ventasRecientes.map((venta) => (
                    <tr key={venta.id}>
                      <td>#{venta.id}</td>
                      <td>{formatFecha(venta.fechaVenta || venta.fecha)}</td>
                      <td>{venta.usuarioNombre || 'Usuario no registrado'}</td>
                      <td className="text-end fw-medium">{formatPrice(venta.total)}</td>
                      <td>
                        <span className={`badge ${getEstadoBadge(venta.estado)}`}>
                          {venta.estado}
                        </span>
                      </td>
                      <td>{venta.metodoPago}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No hay ventas recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    {/* Analytics (fusionado) */}
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Estadísticas y Reportes</h2>
        <button className="btn btn-outline-primary" onClick={() => window.print()}>
          <i className="fas fa-print me-2"></i>Imprimir
        </button>
      </div>

      

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">Ventas últimos 7 días</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataSemana}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPrice(value)} />
                  <Bar dataKey="ventas" name="Ventas" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">Top Marcas</div>
            <div className="card-body">
              {topMarcas.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={topMarcas.map(m => ({ name: m.nombre, value: m.cantidad }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {topMarcas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">Productos Más Vendidos</div>
            <div className="card-body p-0">
              {topProductos.length > 0 ? (
                <table className="table table-sm mb-0">
                  <thead>
                    <tr><th>Producto</th><th>Cant</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {topProductos.map((p, i) => (
                      <tr key={i}>
                        <td>{p.nombre}</td>
                        <td>{p.cantidad}</td>
                        <td>{formatPrice(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted text-center p-3">Sin datos</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">Top Marcas</div>
            <div className="card-body p-0">
              {topMarcas.length > 0 ? (
                <table className="table table-sm mb-0">
                  <thead>
                    <tr><th>Marca</th><th>Cant</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {topMarcas.map((m, i) => (
                      <tr key={i}>
                        <td>{m.nombre}</td>
                        <td>{m.cantidad}</td>
                        <td>{formatPrice(m.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted text-center p-3">Sin datos</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">Top Categorías</div>
            <div className="card-body p-0">
              {topCategorias.length > 0 ? (
                <table className="table table-sm mb-0">
                  <thead>
                    <tr><th>Categoría</th><th>Cant</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {topCategorias.map((c, i) => (
                      <tr key={i}>
                        <td>{c.nombre}</td>
                        <td>{c.cantidad}</td>
                        <td>{formatPrice(c.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted text-center p-3">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;