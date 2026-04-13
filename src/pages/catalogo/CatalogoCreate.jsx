import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProveedores, createMarcaAndLinkProveedor, createCategoria, getMarcas, getCategorias, getMarcasByProveedor } from '../../services/dataService';

const CatalogoCreate = () => {
  const { id: proveedorIdParam } = useParams();
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ proveedorId: proveedorIdParam || '', nombre: '', descripcion: '', precioSugerido: '', categoriaNombre: '', marcaNombre: '', fotoUrl: '', estadoStock: 'Disponible', activo: true });

  useEffect(() => {
    const init = async () => {
      setProveedores(await getProveedores() || []);
      setCategorias(await getCategorias() || []);
      // Si estamos creando desde la vista de proveedor, mostrar solo sus marcas
      if (proveedorIdParam) {
        setMarcas(await getMarcasByProveedor(proveedorIdParam) || []);
        setForm(prev => ({ ...prev, proveedorId: proveedorIdParam }));
      } else {
        setMarcas(await getMarcas() || []);
      }
    };
    init();
  }, [proveedorIdParam]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('La entidad Catálogo ya no existe. Por favor, cree productos directamente desde la gestión de productos.');
    navigate(`/admin/productos/nuevo?proveedorId=${form.proveedorId}`);
  };

  const handleCrearMarca = () => {
    if (!form.marcaNombre || String(form.marcaNombre).trim() === '') return alert('Ingrese nombre de marca antes de crear');
    try {
      let nm;
      (async () => {
        if (proveedorIdParam) {
          nm = await createMarcaAndLinkProveedor({ nombre: form.marcaNombre }, proveedorIdParam);
          // refrescar marcas disponibles del proveedor
          setMarcas(await getMarcasByProveedor(proveedorIdParam) || []);
        } else {
          nm = await createMarcaAndLinkProveedor({ nombre: form.marcaNombre });
          setMarcas(await getMarcas() || []);
        }
        setForm(prev => ({ ...prev, marcaNombre: nm.nombre }));
        alert(`Marca creada: ${nm.nombre}`);
      })();
    } catch (err) { alert(err.message || 'Error creando marca'); }
  };

  const handleCrearCategoria = () => {
    if (!form.categoriaNombre || String(form.categoriaNombre).trim() === '') return alert('Ingrese nombre de categoría antes de crear');
    try {
      (async () => {
        const nc = await createCategoria({ nombre: form.categoriaNombre });
        alert(`Categoría creada: ${nc.nombre}`);
        setCategorias(await getCategorias() || []);
      })();
    } catch (err) { alert(err.message || 'Error creando categoría'); }
  };

  return (
    <div className="container my-4">
      <div className="alert alert-warning">
        <h4>Catálogo de proveedor descontinuado</h4>
        <p>La entidad Catálogo ya no existe. Ahora los productos de los proveedores se gestionan directamente desde la sección de Productos.</p>
        <p className="mb-0">Por favor, cree los productos desde: <strong>Admin → Productos → Nuevo Producto</strong></p>
      </div>
      <h3>Agregar Item al Catálogo (Descontinuado)</h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Proveedor</label>
            <select className="form-select" name="proveedorId" value={form.proveedorId} onChange={handleChange} disabled={!!proveedorIdParam}>
              <option value="">-- Seleccione --</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} disabled />
          </div>
          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" name="descripcion" value={form.descripcion} onChange={handleChange} disabled></textarea>
          </div>
          <div className="col-md-3">
            <label className="form-label">Precio sugerido</label>
            <input className="form-control" name="precioSugerido" value={form.precioSugerido} onChange={handleChange} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label">Categoría</label>
            <div className="input-group">
              <select className="form-select" onChange={(e) => setForm(prev => ({ ...prev, categoriaNombre: e.target.value }))} value={form.categoriaNombre} disabled>
                <option value="">-- Seleccione existente --</option>
                {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
              <input className="form-control" name="categoriaNombre" value={form.categoriaNombre} onChange={handleChange} placeholder="o escriba nueva" disabled />
              <button type="button" className="btn btn-primary" onClick={handleCrearCategoria} disabled>Crear</button>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label">Marca</label>
            <div className="input-group">
              <select className="form-select" onChange={(e) => setForm(prev => ({ ...prev, marcaNombre: e.target.value }))} value={form.marcaNombre} disabled>
                <option value="">-- Seleccione existente --</option>
                {marcas.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
              </select>
              <input className="form-control" name="marcaNombre" value={form.marcaNombre} onChange={handleChange} placeholder="o escriba nueva" disabled />
              <button type="button" className="btn btn-primary" onClick={handleCrearMarca} disabled>Crear</button>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Foto URL</label>
            <input className="form-control" name="fotoUrl" value={form.fotoUrl} onChange={handleChange} disabled />
          </div>
          <div className="col-md-3">
            <label className="form-label">Estado stock</label>
            <select className="form-select" name="estadoStock" value={form.estadoStock} onChange={handleChange} disabled>
              <option value="Disponible">Disponible</option>
              <option value="No Disponible">No Disponible</option>
              <option value="De temporada">De temporada</option>
              <option value="Fuera de Temporada">Fuera de Temporada</option>
              <option value="Consultar">Consultar</option>
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-center">
            <div className="form-check mt-2">
              <input className="form-check-input" type="checkbox" name="activo" checked={form.activo} onChange={handleChange} disabled />
              <label className="form-check-label">Activo</label>
            </div>
          </div>
          <div className="col-12 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Volver</button>
            <button type="submit" className="btn btn-primary">Ir a Productos</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CatalogoCreate;