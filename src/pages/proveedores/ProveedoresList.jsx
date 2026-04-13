// src/pages/proveedores/ProveedoresList.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProveedores, deleteProveedor, toggleProveedorEstado, exportProveedores, importProveedores } from '../../services/dataService';
import useDebounce from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';

const ProveedoresList = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [importStatus, setImportStatus] = useState({ message: '', type: '' });
  const fileRef = useRef(null);
  const { hasPermission } = useAuth();
  const canManageProveedores = hasPermission('Proveedores');

  useEffect(() => {
    cargar();
  }, [debounced, filterTipo, filterEstado]);

  const cargar = async () => {
    let list = await getProveedores() || [];
    if (!Array.isArray(list)) list = list && list.data ? list.data : (list || []);
    
    // Validar que cada proveedor tenga un ID
    list = list.filter(p => {
      if (!p.id && p._id) p.id = p._id;
      if (!p.id) {
        console.warn('Proveedor sin ID:', p);
        return false;
      }
      return true;
    });

    if (filterTipo) list = list.filter(p => p.tipoPersona === filterTipo);
    if (filterEstado === 'Activo') list = list.filter(p => p.estado === true);
    if (filterEstado === 'Inactivo') list = list.filter(p => p.estado === false);
    if (debounced) {
      const q = debounced.toLowerCase();
      list = list.filter(p =>
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.documento || '').toLowerCase().includes(q) ||
        (p.contacto || '').toLowerCase().includes(q) ||
        (p.telefono || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.rubro || '').toLowerCase().includes(q)
      );
    }
    setProveedores(list);
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar proveedor "${nombre}"?`)) return;
    try {
      await deleteProveedor(id);
      await cargar();
      alert('Proveedor eliminado');
    } catch (err) {
      alert(err.message || 'No se pudo eliminar');
    }
  };

  const handleToggle = async (id, estado, nombre) => {
    if (!window.confirm(`${estado ? 'Desactivar' : 'Activar'} proveedor "${nombre}"?`)) return;
    await toggleProveedorEstado(id);
    await cargar();
  };

  const handleExport = async () => { try { await exportProveedores(); } catch (e) { alert('Error exportando: '+(e.message||e)); } };
   
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importProveedores(
      file,
      () => {
        setImportStatus({ message: 'Importación exitosa', type: 'success' });
        cargar();
        if (fileRef.current) fileRef.current.value = '';
        setTimeout(() => setImportStatus({ message: '', type: '' }), 3000);
      },
      (err) => {
        setImportStatus({ message: 'Error importando: ' + (err?.message || err), type: 'danger' });
        setTimeout(() => setImportStatus({ message: '', type: '' }), 5000);
      }
    );
  };

  return (
    <div className="container-fluid py-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Admin</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Proveedores</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Proveedores</h2>
          <p className="text-muted mb-0">
            {proveedores.length} registros · {proveedores.filter(p => p.estado === true).length} activos
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={cargar} title="Actualizar">
            <i className="fas fa-sync-alt"></i>
          </button>
          {canManageProveedores && (
            <>
              <button className="btn btn-outline-secondary" onClick={handleExport} title="Exportar">
                <i className="fas fa-file-export me-1"></i>Exportar
              </button>
              <input type="file" ref={fileRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
              <button className="btn btn-outline-secondary" onClick={() => fileRef.current && fileRef.current.click()} title="Importar">
                <i className="fas fa-file-import me-1"></i>Importar
              </button>
              <Link to="/admin/proveedores/nuevo" className="btn btn-primary">
                <i className="fas fa-plus me-1"></i>Nuevo Proveedor
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small text-muted fw-bold">Buscar</label>
              <input
                className="form-control"
                placeholder="Nombre, documento, contacto, email, rubro..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-bold">Tipo de persona</label>
              <select className="form-select" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="Natural">Natural</option>
                <option value="Jurídica">Jurídica</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-bold">Estado</label>
              <select className="form-select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-secondary w-100" onClick={() => { setQuery(''); setFilterTipo(''); setFilterEstado(''); }}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type}`}>{importStatus.message}</div>
      )}

      {proveedores.length === 0 ? (
        <div className="alert alert-info text-center">No hay proveedores registrados.</div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Documento</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Rubro</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.nombre}</td>
                      <td className="font-monospace">{p.tipoDocumento} {p.documento}</td>
                      <td>{p.contacto || '—'}</td>
                      <td className="font-monospace">{p.telefonoPais ? p.telefonoPais + ' ' : ''}{p.telefono || '—'}</td>
                      <td>{p.email || '—'}</td>
                      <td>{p.rubro || '—'}</td>
                      <td>
                        <span className={`badge ${p.estado ? 'bg-success' : 'bg-secondary'}`}>
                          {p.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        {canManageProveedores && (
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-info" title="Ver" onClick={() => navigate(`/admin/proveedores/${p.id}`)}>
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-primary" title="Editar" onClick={() => navigate(`/admin/proveedores/editar/${p.id}`)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className={`btn btn-sm ${p.estado ? 'btn-outline-warning' : 'btn-outline-success'}`} title={p.estado ? 'Desactivar' : 'Activar'} onClick={() => handleToggle(p.id, p.estado, p.nombre)}>
                              <i className={`fas fa-toggle-${p.estado ? 'off' : 'on'}`}></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => handleDelete(p.id, p.nombre)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        )}
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

export default ProveedoresList;