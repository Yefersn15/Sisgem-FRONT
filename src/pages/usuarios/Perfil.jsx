// src/pages/usuarios/Perfil.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUsuario } from '../../services/dataService';

const Perfil = () => {
  const { user, refreshUser } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    documento: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPerfil = async () => {
      if (user && user.documento) {
        setPerfil(user);
        setForm({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          telefono: user.telefono || '',
          email: user.email || '',
          documento: user.documento || ''
        });
      }
      setLoading(false);
    };
    fetchPerfil();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Actualizar usuario en la API
      // Se permite actualizar: nombre, apellido, telefono, email
      const updated = await updateUsuario(user.documento, {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email
      });

      // Refrescar el contexto para que refleje los cambios
      await refreshUser();

      setSuccess('Información actualizada correctamente');
      setEditMode(false);
    } catch (err) {
      setError('Error al actualizar la información: ' + err.message);
    }
  };

  if (loading) {
    return <div className="container mt-4"><p>Cargando...</p></div>;
  }

  if (!perfil) {
    return <div className="container mt-4"><p>No se encontró el perfil</p></div>;
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0"><i className="fas fa-user-circle me-2"></i>Mi Perfil</h4>
          {!editMode && (
            <button className="btn btn-primary btn-sm" onClick={() => setEditMode(true)}>
              <i className="fas fa-edit me-1"></i>Editar
            </button>
          )}
        </div>
        <div className="card-body">
          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Columna 1: Información Personal */}
              <div className="col-md-6">
                <h6 className="text-primary mb-3 border-bottom pb-2">Información Personal</h6>
                
                <div className="mb-3">
                  <label className="form-label">Número de Documento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.documento}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={form.nombre}
                    onChange={handleChange}
                    disabled={!editMode}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    className="form-control"
                    value={form.apellido}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    className="form-control"
                    value={form.telefono}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="Número de teléfono"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
              </div>

              {/* Columna 2: Información de la Cuenta */}
              <div className="col-md-6">
                <h6 className="text-primary mb-3 border-bottom pb-2">Información de la Cuenta</h6>
                
                <div className="mb-3">
                  <label className="form-label">Rol</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.rol || 'Sin rol'}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Estado</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.estado ? 'Activo' : 'Inactivo'}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Fecha de Registro</label>
                  <input
                    type="text"
                    className="form-control"
                    value={perfil.createdAt ? new Date(perfil.createdAt).toLocaleDateString('es-CO') : (perfil.fecha_creacion ? new Date(perfil.fecha_creacion).toLocaleDateString('es-CO') : 'N/A')}
                    disabled
                  />
                </div>
              </div>
            </div>

            {editMode && (
              <div className="row mt-4">
                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-1"></i>Guardar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setForm({
                        nombre: perfil.nombre || '',
                        apellido: perfil.apellido || '',
                        telefono: perfil.telefono || '',
                        email: perfil.email || '',
                        documento: perfil.documento || ''
                      });
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;