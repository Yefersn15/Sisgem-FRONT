import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getCatalogo, 
  getCatalogoItemById, 
  createCatalogoItem, 
  updateCatalogoItem, 
  deleteCatalogoItem,
  getProveedorById,
  formatPrice,
  getMarcas,
  getCategorias
} from '../../services/dataService';

const normalizeText = (text) => {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
};

const CatalogoManage = () => {
  const { id: proveedorId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(proveedorId);

  const [items, setItems] = useState([]);
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precioSugerido: 0,
    imagen: '',
    categoriaNombre: '',
    marcaNombre: '',
    estadoStock: 'Disponible'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [catalogItems, proveedorData, marcasData, categoriasData] = await Promise.all([
        getCatalogo(proveedorId),
        isEditing ? getProveedorById(proveedorId) : Promise.resolve(null),
        getMarcas(),
        getCategorias()
      ]);
      
      setItems(catalogItems || []);
      setProveedor(proveedorData);
      setMarcas(marcasData || []);
      setCategorias(categoriasData || []);
    } catch (err) {
      console.error('Error cargando catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [proveedorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['nombre', 'descripcion', 'categoriaNombre', 'marcaNombre'].includes(name)) {
      setForm({ ...form, [name]: normalizeText(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      nombre: '',
      descripcion: '',
      precioSugerido: 0,
      imagen: '',
      categoriaNombre: '',
      marcaNombre: '',
      estadoStock: 'Disponible'
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      precioSugerido: item.precioSugerido || 0,
      imagen: item.imagen || '',
      categoriaNombre: item.categoriaNombre || '',
      marcaNombre: item.marcaNombre || '',
      estadoStock: item.estadoStock || 'Disponible'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    try {
      const itemData = {
        ...form,
        precioSugerido: parseFloat(form.precioSugerido) || 0
      };

      if (editingItem) {
        await updateCatalogoItem(editingItem.id, itemData);
      } else {
        await createCatalogoItem({ ...itemData, proveedorId });
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      alert('Error: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.nombre}" del catálogo?`)) return;
    
    try {
      await deleteCatalogoItem(item.id);
      loadData();
    } catch (err) {
      alert('Error: ' + (err.message || 'Error desconocido'));
    }
  };

  if (loading) {
    return <div className="container mt-4">Cargando...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4>Catálogo {proveedor ? `- ${proveedor.nombre}` : ''}</h4>
          <p className="text-muted mb-0">{items.length} productos en catálogo</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-1"></i>Volver
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <i className="fas fa-plus me-1"></i>Nuevo Ítem
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio Sugerido</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="fw-bold">{item.nombre}</td>
                  <td>{item.categoriaNombre || '—'}</td>
                  <td>{item.marcaNombre || '—'}</td>
                  <td>{formatPrice(item.precioSugerido)}</td>
                  <td>
                    <span className={`badge ${item.estadoStock === 'Disponible' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {item.estadoStock}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={() => openEditModal(item)}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => handleDelete(item)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {items.length === 0 && (
        <div className="alert alert-info text-center mt-3">
          No hay productos en el catálogo. Agrega uno nuevo.
        </div>
      )}

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem ? 'Editar Ítem' : 'Nuevo Ítem'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      value={form.descripcion}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Precio Sugerido</label>
                      <input
                        type="number"
                        name="precioSugerido"
                        className="form-control"
                        value={form.precioSugerido}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Estado Stock</label>
                      <select
                        name="estadoStock"
                        className="form-select"
                        value={form.estadoStock}
                        onChange={handleChange}
                      >
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
                      <input
                        type="text"
                        name="categoriaNombre"
                        className="form-control"
                        value={form.categoriaNombre}
                        onChange={handleChange}
                        list="categorias-list"
                      />
                      <datalist id="categorias-list">
                        {categorias.map(c => (
                          <option key={c.id} value={c.nombre} />
                        ))}
                      </datalist>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Marca</label>
                      <input
                        type="text"
                        name="marcaNombre"
                        className="form-control"
                        value={form.marcaNombre}
                        onChange={handleChange}
                        list="marcas-list"
                      />
                      <datalist id="marcas-list">
                        {marcas.map(m => (
                          <option key={m.id} value={m.nombre} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">URL Imagen</label>
                    <input
                      type="text"
                      name="imagen"
                      className="form-control"
                      value={form.imagen}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save me-1"></i>
                      {editingItem ? 'Guardar Cambios' : 'Crear'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoManage;