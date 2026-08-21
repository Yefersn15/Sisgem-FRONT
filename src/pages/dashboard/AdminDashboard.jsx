import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/api/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { useDashboardStats } from './hooks/useDashboardStats';
import StatCard from './components/StatCard';
import TopRankingTable from './components/TopRankingTable';

const FILTRO_LABELS = { dia: '1 día', semana: '7 días', mes: '30 días', trimestre: '90 días', semestre: '180 días', año: '365 días' };

const formatFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ESTADO_BADGES = {
  pendiente: 'bg-warning',
  porvalidar: 'bg-info',
  completada: 'bg-success',
  anulada: 'bg-danger',
  rechazada: 'bg-danger',
  cancelado: 'bg-secondary',
  entregado: 'bg-success'
};
const getEstadoBadge = (estado) => ESTADO_BADGES[String(estado || '').toLowerCase()] || 'bg-secondary';

const AdminDashboard = () => {
  const {
    stats,
    ventasRecientes,
    loading,
    topProductos,
    topMarcas,
    topCategorias,
    chartDataSemana,
    filtroVentas,
    setFiltroVentas,
  } = useDashboardStats();

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
      <div className="row g-3 mb-4">
        <StatCard label="Ventas de hoy" value={formatPrice(stats.ventasHoy)} icon="fa-dollar-sign" colorClass="primary" />
        <StatCard label="Ventas de la semana" value={formatPrice(stats.ventasSemana)} icon="fa-calendar-week" colorClass="info" />
        <StatCard label="Ventas del mes" value={formatPrice(stats.ventasMes)} icon="fa-chart-line" colorClass="success" />
        <StatCard label="Productos" value={stats.productos} icon="fa-box" colorClass="warning" footerTo="/productos" footerLabel="Ver productos" />
        <StatCard label="Usuarios" value={stats.usuarios} icon="fa-users" colorClass="info" footerTo="/admin/usuarios" footerLabel="Ver usuarios" />
        <StatCard label="Domicilios Pendientes" value={stats.domiciliosPendientes} icon="fa-shipping-fast" colorClass="warning" footerTo="/admin/domicilios" footerLabel="Ver domicilios" />
      </div>

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
                    <td colSpan="5" className="text-center text-muted py-4">
                      No hay ventas recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Ventas últimos {FILTRO_LABELS[filtroVentas]}</span>
                <select className="form-select form-select-sm w-auto" value={filtroVentas} onChange={(e) => setFiltroVentas(e.target.value)}>
                  <option value="dia">Hoy</option>
                  <option value="semana">7 días</option>
                  <option value="mes">30 días</option>
                  <option value="trimestre">90 días</option>
                  <option value="semestre">180 días</option>
                  <option value="año">1 año</option>
                </select>
              </div>
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
              <div className="card-header">Top Categorías</div>
              <div className="card-body">
                {topCategorias.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={topCategorias.map(c => ({ name: c.nombre, value: c.cantidad }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                        {topCategorias.map((entry, index) => (
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
            <TopRankingTable title="Productos Más Vendidos" columnLabel="Producto" items={topProductos} />
          </div>
          <div className="col-md-4">
            <TopRankingTable title="Top Marcas" columnLabel="Marca" items={topMarcas} />
          </div>
          <div className="col-md-4">
            <TopRankingTable title="Top Categorías" columnLabel="Categoría" items={topCategorias} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
