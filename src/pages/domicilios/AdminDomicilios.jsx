import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getDomicilios, asignarRepartidor, editarRepartidor, saveDomicilio, updateDomicilioEstado, getVentas, editarTarifaDomicilio, exportToExcel, importDomicilios, getUsuarios } from '../../services/dataService';
import { openPrintVoucher } from '../../services/printService';
import { Link } from 'react-router-dom';

// Estados alineados con `estado_pedido` del backend
const ESTADOS_DOMICILIO = ['pendiente', 'aprobado', 'asignado', 'en_camino', 'entregado', 'cancelado'];

const TRANSICIONES_DOMICILIO = {
  'pendiente': ['aprobado', 'cancelado'],
  'aprobado': ['asignado', 'cancelado'],
  'asignado': ['en_camino', 'cancelado'],
  'en_camino': ['entregado'],
  'entregado': [],
  'cancelado': []
};

const ESTADOS_DOMICILIO_FINALES = ['entregado', 'cancelado'];

const getSiguientesEstadosDomicilio = (estadoActual) => TRANSICIONES_DOMICILIO[String(estadoActual || '').toLowerCase()] || [];

const isEstadoFinalDomicilio = (estado) => ESTADOS_DOMICILIO_FINALES.includes(String(estado || '').toLowerCase());

const AdminDomicilios = () => {
  const [domicilios, setDomicilios] = useState([]);
  const [repartidoresList, setRepartidoresList] = useState([]);
  const [selectedRepartidorId, setSelectedRepartidorId] = useState('');
  const [search, setSearch] = useState('');
  const [ventas, setVentas] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [showRepartidorModal, setShowRepartidorModal] = useState(false);
  const [currentVentaId, setCurrentVentaId] = useState(null);
  const [repartidorForm, setRepartidorForm] = useState({ nombre: '', telefono: '', tipoVehiculo: '', placa: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const doms = (await getDomicilios()) || [];
    setDomicilios(doms);
    setVentas((await getVentas()) || []);
    // Cargar lista de usuarios que pueden ser repartidores (filtrar por rol)
    try {
      const users = await getUsuarios();
      const reps = Array.isArray(users) ? users.filter(u => {
        const rn = (u.rol_nombre || '').toString().toUpperCase();
        return rn.includes('REPART') || rn === 'EMPLEADO' || rn === 'DOMICILIARIO';
      }) : [];
      setRepartidoresList(reps);
    } catch (e) {
      setRepartidoresList([]);
    }
  };

  const normalizeNumber = (num, defaultCountry = '57') => {
    if (!num) return '';
    let s = String(num).replace(/\D/g, '');
    // remove leading zeros
    s = s.replace(/^0+/, '');
    // if length looks like local (<=10) prefix default country
    if (s.length <= 10) s = `${defaultCountry}${s}`;
    return s;
  };

  const openRepartidorModal = (ventaId) => {
    const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
    setCurrentVentaId(ventaId);
    const rep = dom?.repartidor;
    setRepartidorForm({
      nombre: (typeof rep === 'object' ? rep?.nombre : rep) || '',
      telefono: (typeof rep === 'object' ? rep?.telefono : dom?.telefono_repartidor) || '',
      tipoVehiculo: (typeof rep === 'object' ? rep?.tipoVehiculo : '') || '',
      placa: (typeof rep === 'object' ? rep?.placa : '') || '',
      tarifa: dom?.tarifa || dom?.tarifa_aplicada || 0
    });
    setSelectedRepartidorId('');
    setShowRepartidorModal(true);
  };

  const handleRepartidorInput = (e) => {
    const { name, value } = e.target;
    setRepartidorForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectRepartidor = (e) => {
    const id = e.target.value;
    setSelectedRepartidorId(id);
    if (!id) {
      setRepartidorForm({ nombre: '', telefono: '', tipoVehiculo: '', placa: '', tarifa: repartidorForm.tarifa });
      return;
    }
    const user = repartidoresList.find(r => String(r.id || r._id) === String(id) || String(r.id) === String(id));
    if (user) {
      setRepartidorForm({ nombre: user.nombre || '', telefono: user.telefono || '', tipoVehiculo: user.tipoVehiculo || '', placa: user.placa || '', tarifa: repartidorForm.tarifa });
    }
  };

  const handleSaveRepartidor = async () => {
    if (!currentVentaId) return;
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      return;
    }
    const { nombre, telefono, tipoVehiculo, placa, tarifa } = repartidorForm;
    if (!nombre || !telefono) return alert('Nombre y teléfono son obligatorios');
    
    const dom = domicilios.find(d => String(d.ventaId) === String(currentVentaId));
    let res = null;
    
    // Enviar en el formato que espera el backend
    const payload = {
      repartidor: {
        nombre,
        telefono,
        tipoVehiculo: tipoVehiculo || '',
        placa: placa || ''
      },
      tarifa: tarifa !== undefined ? parseFloat(tarifa) : undefined
    };
    if (selectedRepartidorId) payload.repartidorId = selectedRepartidorId;
    
    try {
      console.log('Asignando repartidor a venta:', currentVentaId, 'payload:', payload);
      if (dom?.repartidor?.nombre) {
        res = await editarRepartidor(currentVentaId, payload);
      } else {
        res = await asignarRepartidor(currentVentaId, payload);
      }
      console.log('Respuesta asignarRepartidor:', res);
    } catch (err) {
      console.error('Error asignando repartidor:', err);
      alert('No se puede asignar/editar repartidor: ' + (err?.message || err) + '\nDetalles: ' + JSON.stringify(err));
      return;
    }
    if (!res) {
      alert('No se puede asignar/editar repartidor: el pedido puede requerir aprobación previa o no existe un domicilio creado.');
      return;
    }
    try {
      const venta = ventas.find(v => String(v.id) === String(currentVentaId));
      if (venta && res) openPrintVoucher(venta, res);
    } catch (e) {}
    setShowRepartidorModal(false);
    setCurrentVentaId(null);
    cargarDatos();
  };

  const handleEditarRepartidor = (ventaId, repartidorActual = {}) => {
    const nombre = prompt('Nombre del repartidor:', repartidorActual.nombre || '');
    if (nombre === null) return;
    const telefono = prompt('Teléfono del repartidor:', repartidorActual.telefono || '');
    if (telefono === null) return;
    const tipoVehiculo = prompt('Tipo de vehículo (opcional):', repartidorActual.tipoVehiculo || '');
    if (tipoVehiculo === null) return;
    const placa = prompt('Placa (opcional):', repartidorActual.placa || '');
    if (placa === null) return;
    editarRepartidor(ventaId, { nombre, telefono, tipoVehiculo: tipoVehiculo || '', placa: placa || '' });
    cargarDatos();
  };

  const handleCambiarEstado = (ventaId, nextState) => {
    const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
    const estadoActual = dom?.estado;
    
    // Verificar si el estado es final
    if (estadoActual && isEstadoFinalDomicilio(estadoActual)) {
      alert(`No se puede cambiar el estado: El domicilio ya está en estado "${estadoActual}" que es un estado final.`);
      return;
    }
    
    // Verificar si la transición es válida
    const siguientes = getSiguientesEstadosDomicilio(estadoActual);
    if (estadoActual && !siguientes.includes(nextState)) {
      alert(`No se puede cambiar de "${estadoActual}" a "${nextState}".\n\nEstados válidos siguientes: ${siguientes.join(', ') || 'Ninguno'}`);
      return;
    }
    
    // Validar que no se pueda poner 'en_preparacion' o 'asignado' sin tener repartidor
    if ((nextState === 'en_preparacion' || nextState === 'asignado') && (!dom?.repartidor || !dom.repartidor.nombre)) {
      alert('Debe asignar un repartidor antes de cambiar el estado a En Preparación o Asignado.');
      return;
    }
    
    const res = updateDomicilioEstado(ventaId, nextState);
    if (!res) {
      alert('No se puede cambiar el estado del domicilio.');
      return;
    }
    cargarDatos();
  };

  const handleEditarTarifa = async (ventaId, tarifaActual) => {
    const nuevaTarifa = prompt('Ingrese la tarifa de envío:', tarifaActual || '0');
    if (nuevaTarifa === null) return;
    const tarifaNum = parseFloat(String(nuevaTarifa).replace(/[^0-9.\-]/g, ''));
    if (isNaN(tarifaNum) || tarifaNum < 0) {
      alert('Tarifa inválida. Ingrese un número válido.');
      return;
    }
    const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
    if (!dom) {
      alert('No se encontró el domicilio para la venta');
      return;
    }
    try {
      // Setear tarifa en el objeto y esperar a que se guarde en el backend
      dom.tarifa = tarifaNum;
      const res = await saveDomicilio(dom);
      alert('Tarifa guardada correctamente');
      // recargar datos desde la API para reflejar cambios (incluye tarifa_aplicada)
      await cargarDatos();
      return res;
    } catch (err) {
      alert('Error guardando tarifa: ' + (err?.message || err));
    }
  };

  const handleNotas = (ventaId, notasActuales) => {
    const nuevasNotas = prompt('Notas para el domicilio (se guardará como nota de admin):', notasActuales || '');
    if (nuevasNotas !== null) {
      const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
      if (dom) {
        dom.notas = nuevasNotas;
        dom.notasAutor = 'admin';
        saveDomicilio(dom);
        cargarDatos();
      }
    }
  };

  const fileInputRef = useRef(null);

  const handleExportar = () => {
    const data = domicilios.map(d => ({
      Venta: d.ventaId,
      Dirección: `${d.direccion} ${d.direccion2 || ''}, ${d.barrio || ''}`,
      Teléfono: normalizeNumber(d.telefono) || d.telefono,
      Estado: d.estado,
      Tarifa: d.tarifa,
      Repartidor: d.repartidor?.nombre || '',
      TelRepartidor: normalizeNumber(d.repartidor?.telefono) || d.repartidor?.telefono || '',
      TipoVehiculo: d.repartidor?.tipoVehiculo || '',
      Placa: d.repartidor?.placa || '',
      Notas: d.notas,
      FechaAsignación: d.updatedAt ? new Date(d.updatedAt).toLocaleString() : ''
    }));
    exportToExcel(data, 'domicilios.xlsx');
  };
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importDomicilios(file, () => {
      alert('Importación de domicilios completada');
      cargarDatos();
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, (err) => {
      alert('Error al importar domicilios: ' + (err?.message || err));
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return domicilios.filter(d => {
      if (filter !== 'Todos' && d.estado !== filter) return false;
      if (!q) return true;
      const venta = ventas.find(v => String(v.id) === String(d.ventaId));
      const fields = [d.ventaId, d.direccion, d.telefono, d.estado, venta?.metodoPago, venta?.id, venta?.usuarioNombre]
        .filter(Boolean).join(' ').toLowerCase();
      return fields.includes(q);
    });
  }, [domicilios, ventas, filter, search]);

  const mapDomicilio = dom => {
    const pedidoId = dom.pedido?.id || dom.ventaId || dom.pedidoId;
    return { ...dom, pedidoId, venta: ventas.find(v => String(v.id) === String(pedidoId)) };
  };
  const domiciliosConVenta = filtered.map(mapDomicilio);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Administración de Domicilios</h2>
        <div>
          <input type="file" ref={fileInputRef} accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleImport} />
          <Link to="/admin/ventas" className="btn btn-outline-secondary me-2">Volver a Ventas</Link>
          <button className="btn btn-outline-secondary me-2" onClick={handleExportar}>Exportar</button>
          <button className="btn btn-outline-secondary me-2" onClick={() => fileInputRef.current && fileInputRef.current.click()}>Importar</button>
        </div>
      </div>

      <div className="row mb-3 align-items-center">
        <div className="col-md-5 mb-2">
          <input className="form-control" placeholder="Buscar por ID, dirección, teléfono, estado o repartidor" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-3 mb-2">
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="asignado">Asignado</option>
            <option value="en_camino">En Camino</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="col-md-4 mb-2 text-end">
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilter('Todos'); }}>Limpiar</button>
        </div>
      </div>

      <div className="row">
          {domiciliosConVenta.map(dom => {
          const key = String(dom.id || dom.pedidoId);
          const estadoNorm = String(dom.estado || 'pendiente').toLowerCase();
          // Clase visual según estado
          const estadoClass = estadoNorm === 'entregado' ? 'entregado'
            : estadoNorm === 'en_camino' ? 'en_camino'
            : estadoNorm === 'asignado' ? 'asignado'
            : estadoNorm === 'en_preparacion' ? 'en_preparacion'
            : estadoNorm === 'aprobado' ? 'aprobado'
            : estadoNorm === 'cancelado' ? 'cancelado' : 'pendiente';
          const badgeColor = estadoNorm === 'entregado' ? 'success'
            : estadoNorm === 'en_camino' || estadoNorm === 'asignado' || estadoNorm === 'en_preparacion' || estadoNorm === 'aprobado' ? 'warning'
            : estadoNorm === 'cancelado' ? 'danger' : 'secondary';
          return (
            <div className="col-md-6 col-lg-4 mb-3" key={key}>
              <div className={`card domicilioCard ${estadoClass}`}>
                <div className="card-body">
                  <h5 className="card-title">Venta #{dom.pedidoId || dom.venta?.id || 'N/A'}</h5>
                  {/* Nombre del usuario - mostrado primero para el domiciliario */}
                  {dom.venta?.usuarioNombre && (
                    <p className="mb-1"><i className="fas fa-user me-2"></i>{dom.venta.usuarioNombre}</p>
                  )}
                  <p className="mb-1"><i className="fas fa-map-marker-alt me-2"></i>{dom.direccion}{dom.direccion2 ? `, ${dom.direccion2}` : ''}{dom.barrio ? ` (${dom.barrio})` : ''}</p>
                  <p className="mb-1"><i className="fas fa-phone me-2"></i>{dom.venta?.telefono || dom.venta?.telefonoContacto || dom.telefono || 'Sin teléfono'}</p>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className={`badge bg-${badgeColor}`}>{dom.estado}</span>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-outline-primary py-0 px-1" onClick={() => handleEditarTarifa(dom.pedidoId, dom.tarifa)} title="Editar tarifa">
                        <i className="fas fa-dollar-sign"></i>
                      </button>
                      <span className="fw-bold">${((dom.tarifa_aplicada !== undefined && dom.tarifa_aplicada !== null) ? dom.tarifa_aplicada : (dom.tarifa || 0))}</span>
                    </div>
                  </div>
                  {dom.repartidor ? (
                    <div className={`mt-2 p-2 repartidorInfo`}>
                      <div>
                        <i className="fas fa-motorcycle me-1"></i>
                        <strong>{typeof dom.repartidor === 'object' ? (dom.repartidor.nombre ? String(dom.repartidor.nombre).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '') : String(dom.repartidor)}</strong>
                      </div>
                      {typeof dom.repartidor === 'object' && dom.repartidor.tipoVehiculo && (
                        <div><span className="badge bg-secondary me-1">{dom.repartidor.tipoVehiculo}</span></div>
                      )}
                      {typeof dom.repartidor === 'object' && dom.repartidor.placa && (
                        <div><span className="badge bg-primary me-1">Placa: {dom.repartidor.placa}</span></div>
                      )}
                      {typeof dom.repartidor === 'object' && dom.repartidor.telefono && (
                        <div><span className="text-muted">📞 {dom.repartidor.telefono}</span></div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-muted">
                      <small>Sin repartidor asignado</small>
                    </div>
                  )}
                  <div className="mt-3">
                    {/* Selector de estado del domicilio */}
                    {isEstadoFinalDomicilio(dom.estado) ? (
                      <span className={`badge ${dom.estado === 'entregado' ? 'bg-success' : 'bg-danger'} mb-2`}>
                        Domicilio: {String(dom.estado || '').charAt(0).toUpperCase() + String(dom.estado || '').slice(1)}
                      </span>
                    ) : (
                      <select 
                        className="form-select form-select-sm mb-2" 
                        value={dom.estado} 
                        onChange={(e) => handleCambiarEstado(dom.pedidoId, e.target.value)}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="asignado">Asignado</option>
                        <option value="en_camino">En camino</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    )}
                  </div>
                  {/* Estado del pedido */}
                  <div className="mt-1 mb-2">
                    <small className="text-muted">Estado Pedido: </small>
                    <span className={`badge ${dom.venta?.estadoPedido === 'Entregado' ? 'bg-success' : dom.venta?.estadoPedido === 'Cancelado' ? 'bg-danger' : 'bg-secondary'}`}>
                      {dom.venta?.estadoPedido || 'Pendiente'}
                    </span>
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => openRepartidorModal(dom.pedidoId)}>{dom.repartidor ? 'Editar' : 'Asignar'} Repartidor</button>
                    <button className="btn btn-sm btn-outline-dark" onClick={() => dom.venta && openPrintVoucher(dom.venta, dom)}><i className="fas fa-print"></i></button>
                    <button className="btn btn-sm btn-success" onClick={() => { const target = dom.repartidor?.telefono ? normalizeNumber(dom.repartidor.telefono) : normalizeNumber(dom.telefono); if (target) window.open(`https://wa.me/${target}`, '_blank'); else alert('Teléfono inválido para WhatsApp'); }}><i className="fab fa-whatsapp"></i></button>
                    <button className="btn btn-sm btn-info" onClick={() => handleNotas(dom.pedidoId, dom.notas)}><i className="fas fa-sticky-note"></i></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showRepartidorModal && (
        <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card p-3" style={{ width: 520 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Asignar / editar repartidor</h5>
              <button className="btn-close" onClick={() => setShowRepartidorModal(false)}></button>
            </div>
            <div className="mb-2">
              <label className="form-label">Seleccionar repartidor existente (opcional)</label>
              <select className="form-select" value={selectedRepartidorId} onChange={handleSelectRepartidor}>
                <option value="">-- Seleccionar repartidor --</option>
                {repartidoresList.map(r => (
                  <option key={r.id || r._id} value={r.id || r._id}>{r.nombre} {r.telefono ? `(${r.telefono})` : ''} - {r.rol_nombre || ''}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Nombre</label>
              <input className="form-control" name="nombre" value={repartidorForm.nombre} onChange={handleRepartidorInput} />
            </div>
            <div className="mb-2">
              <label className="form-label">Teléfono</label>
              <input className="form-control" name="telefono" value={repartidorForm.telefono} onChange={handleRepartidorInput} />
            </div>
            <div className="mb-2">
              <label className="form-label">Tipo de vehículo</label>
              <input className="form-control" name="tipoVehiculo" value={repartidorForm.tipoVehiculo} onChange={handleRepartidorInput} />
            </div>
            <div className="mb-3">
              <label className="form-label">Placa</label>
              <input className="form-control" name="placa" value={repartidorForm.placa} onChange={handleRepartidorInput} />
            </div>
            <div className="mb-3">
              <label className="form-label">Tarifa (opcional)</label>
              <input className="form-control" name="tarifa" value={repartidorForm.tarifa} onChange={handleRepartidorInput} type="number" step="0.01" />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowRepartidorModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveRepartidor}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDomicilios;