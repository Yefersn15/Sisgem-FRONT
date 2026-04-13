import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCatalogoItem, getMarcas, getCategorias } from '../../services/dataService';

const normalizeText = (text) => {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
};

const CatalogoCreate = () => {
  const { id: proveedorId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precioSugerido: 0,
    imagen: '',
    categoriaNombre: '',
    marcaNombre: '',
    estadoStock: 'Disponible'
  });
  const [loading, setLoading] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const loadData = async () => {
    const [marcasData, categoriasData] = await Promise.all([getMarcas(), getCategorias()]);
    setMarcas(marcasData || []);
    setCategorias(categoriasData || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['nombre', 'descripcion', 'categoriaNombre', 'marcaNombre'].includes(name)) {
      setForm(prev => ({ ...prev, [name]: normalizeText(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    setLoading(true);
    try {
      await createCatalogoItem({ ...form, proveedorId });
      navigate(`/proveedores/${proveedorId}/catalogo`);
    } catch (err) {
      alert('Error: ' + (err.message || 'No se pudo crear el ítem'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left me-1"></i> Volver
        </button>
        <h2>Nuevo Ítem en Catálogo</h2>
      </div>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre *</label>
              <input type="text" name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea name="descripcion" className="form-control" rows="3" value={form.descripcion} onChange={handleChange} />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Precio sugerido</label>
                <input type="number" name="precioSugerido" className="form-control" value={form.precioSugerido} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Estado stock</label>
                <select name="estadoStock" className="form-select" value={form.estadoStock} onChange={handleChange}>
                  <option value="Disponible">Disponible</option>
                  <option value="Agotado">Agotado</option>
                  <option value="Bajo stock">Bajo stock</option>
                  <option value="Descontinuado">Descontinuado</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Categoría</label>
                <input type="text" name="categoriaNombre" className="form-control" value={form.categoriaNombre} onChange={handleChange} list="categorias-list" />
                <datalist id="categorias-list">
                  {categorias.map(c => (
                    <option key={c.id} value={c.nombre} />
                  ))}
                </datalist>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Marca</label>
                <input type="text" name="marcaNombre" className="form-control" value={form.marcaNombre} onChange={handleChange} list="marcas-list" />
                <datalist id="marcas-list">
                  {marcas.map(m => (
                    <option key={m.id} value={m.nombre} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">URL de imagen</label>
              <input type="text" name="imagen" className="form-control" value={form.imagen} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span> Guardando...</> : <><i className="fas fa-save me-1"></i> Crear</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CatalogoCreate;