import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCatalogoItemById, updateCatalogoItem, getProveedores, createMarcaAndLinkProveedor, createCategoria } from '../../services/dataService';

const CatalogoEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    (async () => {
      setProveedores(await getProveedores() || []);
      const it = await getCatalogoItemById(id);
      if (!it) { alert('Item no encontrado'); navigate('/proveedores'); return; }
      setForm(it);
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      updateCatalogoItem(id, form);
      alert('Item actualizado');
      navigate(`/proveedores/${form.proveedorId}/catalogo`);
    } catch (err) { alert(err.message || 'Error'); }
  };

  const handleCrearMarca = () => {
    if (!form.marcaNombre || String(form.marcaNombre).trim() === '') return alert('Ingrese nombre de marca antes de crear');
    try {
      (async () => {
        const nm = await createMarcaAndLinkProveedor({ nombre: form.marcaNombre }, form.proveedorId);
        alert(`Marca creada y vinculada: ${nm.nombre}`);
        setProveedores(await getProveedores() || []);
      })();
    } catch (err) { alert(err.message || 'Error creando marca'); }
  };

  const handleCrearCategoria = () => {
    if (!form.categoriaNombre || String(form.categoriaNombre).trim() === '') return alert('Ingrese nombre de categoría antes de crear');
    try {
      (async () => {
        const nc = await createCategoria({ nombre: form.categoriaNombre });
        alert(`Categoría creada: ${nc.nombre}`);
      })();
    } catch (err) { alert(err.message || 'Error creando categoría'); }
  };

  if (!form) return null;

  return (
    <div className="container my-4">
      <h3>Editar Item del Catálogo</h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Proveedor</label>
            <select className="form-select" name="proveedorId" value={form.proveedorId} onChange={handleChange}>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" name="descripcion" value={form.descripcion} onChange={handleChange}></textarea>
          </div>
          <div className="col-md-3">
            <label className="form-label">Precio sugerido</label>
            <input className="form-control" name="precioSugerido" value={form.precioSugerido} onChange={handleChange} />
          </div>
          {/* Campo SKU proveedor eliminado: solo referencia en proveedor si se requiere externamente */}
          <div className="col-md-3">
            <label className="form-label">Categoría</label>
            <div className="input-group">
              <input className="form-control" name="categoriaNombre" value={form.categoriaNombre} onChange={handleChange} />
              <button type="button" className="btn btn-outline-secondary" onClick={handleCrearCategoria}>Crear</button>
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label">Marca</label>
            <div className="input-group">
              <input className="form-control" name="marcaNombre" value={form.marcaNombre} onChange={handleChange} />
              <button type="button" className="btn btn-outline-secondary" onClick={handleCrearMarca}>Crear</button>
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label">Estado stock</label>
            <select className="form-select" name="estadoStock" value={form.estadoStock || 'Disponible'} onChange={handleChange}>
              <option value="Disponible">Disponible</option>
              <option value="No Disponible">No Disponible</option>
              <option value="De temporada">De temporada</option>
              <option value="Fuera de Temporada">Fuera de Temporada</option>
              <option value="Consultar">Consultar</option>
            </select>
          </div>
          <div className="col-12 d-flex justify-content-end">
            <button className="btn btn-primary">Guardar</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CatalogoEdit;