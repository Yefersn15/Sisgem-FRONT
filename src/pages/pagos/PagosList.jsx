import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPedidos, getVentas, getPagos, getDomicilios, exportPagos, importPagos, formatPrice } from '../../services/dataService';

const PagosList = () => {
  const [pedidosData, setPedidosData] = useState([]);
  const [ventasData, setVentasData] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [domicilios, setDomicilios] = useState([]);
  const [search, setSearch] = useState('');
  const [filterEstadoPago, setFilterEstadoPago] = useState('Todos');
  const [importStatus, setImportStatus] = useState({});
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      const pedidos = await getPedidos();
      const ventas = await getVentas();
      const pagosData = await getPagos();
      const domiciliosData = await getDomicilios();
      setPedidosData(pedidos);
      setVentasData(ventas);
      setPagos(pagosData);
      setDomicilios(domiciliosData);
    };
    cargarDatos();
  }, []);

  const todasLasVentas = useMemo(() => {
    return [...pedidosData, ...ventasData];
  }, [pedidosData, ventasData]);

  const ventasConPagos = useMemo(() => {
    const estadosExcluidos = ['rechazado', 'cancelado', 'anulado', 'pendiente'];
    const abonos = todasLasVentas.filter(venta => {
      const estadoLower = String(venta.estadoPedido || '').toLowerCase();
      const esExcluido = estadosExcluidos.includes(estadoLower);
      if (esExcluido) return false;
      if (venta.metodoPago !== 'Abono') return false;
      return true;
    });
    return abonos.map(venta => {
      const shipping = parseFloat(venta.shipping) || 0;
      const totalVenta = (venta.subtotal || 0) + shipping;
      const pagosVenta = pagos.filter(p => String(p.ventaId) === String(venta.id));
      const totalPagado = pagosVenta
        .filter(p => {
          const estado = String(p.estado).toLowerCase();
          return estado === 'aplicado' || estado === 'pendiente';
        })
        .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
      const saldoPendiente = Math.max(0, totalVenta - totalPagado);
      const estadoPago = saldoPendiente <= 0 ? 'Pagado' : 'Pendiente';
      const primerPagoId = pagosVenta.length > 0 ? pagosVenta[0].id : null;
      return {
        ...venta,
        totalVenta,
        totalPagado,
        saldoPendiente,
        estadoPago,
        primerPagoId,
        ultimoPago: pagosVenta.length > 0 ? pagosVenta[0].fecha : venta.fecha,
        shipping
      };
    });
  }, [todasLasVentas, pagos]);

  const filtered = useMemo(() => {
    let lista = ventasConPagos;
    if (filterEstadoPago !== 'Todos') {
      lista = lista.filter(v => v.estadoPago === filterEstadoPago);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      lista = lista.filter(v =>
        String(v.id).includes(q) ||
        (v.usuarioNombre || '').toLowerCase().includes(q) ||
        (v.metodoPago || '').toLowerCase().includes(q)
      );
    }
    return lista.sort((a, b) => new Date(b.ultimoPago) - new Date(a.ultimoPago));
  }, [ventasConPagos, filterEstadoPago, search]);

  const handleExport = () => exportPagos();

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importPagos(file, () => {
      setImportStatus({ message: 'Importación exitosa', type: 'success' });
      (async () => {
        const pedidos = await getPedidos();
        const ventas = await getVentas();
        const pagosData = await getPagos();
        setPedidosData(pedidos);
        setVentasData(ventas);
        setPagos(pagosData);
      })();
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setImportStatus({}), 3000);
    }, (err) => {
      setImportStatus({ message: 'Error importando: ' + (err?.message || err), type: 'danger' });
      setTimeout(() => setImportStatus({}), 5000);
    });
  };

  const handleAbonar = (venta) => {
    navigate('/admin/pagos/nuevo', { state: { ventaId: venta.id } });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Pagos / Abonos</h2>
          <p className="text-muted mb-0">Administra los pagos y abonos de las ventas</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={handleExport}>
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <input type="file" ref={fileInputRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
          <button className="btn btn-outline-primary" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            <i className="fas fa-file-import me-1"></i>Importar
          </button>
        </div>
      </div>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type}`}>{importStatus.message}</div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <input
                className="form-control"
                placeholder="Buscar por ID, usuario o método de pago"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filterEstadoPago} onChange={(e) => setFilterEstadoPago(e.target.value)}>
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-secondary w-100" onClick={() => { setSearch(''); setFilterEstadoPago('Todos'); }}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="alert alert-info">No hay registros de pagos pendientes o pagados.</div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID Venta</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                    <th>Saldo Pendiente</th>
                    <th>Método de Pago</th>
                    <th>Estado Pago</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(venta => (
                    <tr key={venta.id}>
                      <td>#{venta.id}</td>
                      <td>{venta.usuarioNombre || 'Usuario no registrado'}</td>
                      <td>{venta.fecha ? new Date(venta.fecha).toLocaleString() : 'N/A'}</td>
                      <td className="fw-bold">{formatPrice(venta.saldoPendiente)}</td>
                      <td>{venta.metodoPago}</td>
                      <td>
                        <span className={`badge ${venta.estadoPago === 'Pagado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {venta.estadoPago}
                        </span>
                      </td>
                      <td>
                        {venta.tipo_venta === 'domicilio' ? (
                          <span className="badge bg-info">Domicilio</span>
                        ) : (
                          <span className="text-muted">Tienda</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link to={`/admin/pagos/${venta.id}`} className="btn btn-sm btn-outline-info" title="Ver detalle">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAbonar(venta)}
                            title="Abonar"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosList;