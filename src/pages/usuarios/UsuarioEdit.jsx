// src/pages/usuarios/UsuarioEdit.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUsuarioById, getRoles, createUsuario, updateUsuario, getUsuarios } from '../../services/dataService';

const normalizeText = (text) => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const UsuarioEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser && (currentUser.rol_id === 5 || currentUser.rol === 'ADMIN');

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [error, setError] = useState('');
  const [documentoExists, setDocumentoExists] = useState(false);
  
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC',
    documento: '',
    genero: 'Otro',
    telefono: '',
    direccion: '',
    barrio: '',
    email: '',
    password: '',
    confirmPassword: '',
    rolId: '',
    estado: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);

        if (isEditing) {
          const usuario = await getUsuarioById(id);
          if (usuario) {
            setForm({
              nombre: usuario.nombre || '',
              apellido: usuario.apellido || '',
              tipoDocumento: usuario.tipoDocumento || usuario.tipo_documento || 'CC',
              documento: usuario.documento || '',
              genero: usuario.genero || 'Otro',
              telefono: usuario.telefono || '',
              direccion: usuario.direccion || '',
              barrio: usuario.barrio || '',
              email: usuario.email || '',
              password: '',
              confirmPassword: '',
              rolId: usuario.rol?.id || usuario.rol_id || '',
              estado: usuario.estado !== false
            });
          }
        } else {
          const defaultRole = rolesData.find(r => r.esDefault);
          if (defaultRole) {
            setForm(prev => ({ ...prev, rolId: defaultRole.id }));
          }
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setLoadError(err.message || 'Error desconocido');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [id, isEditing]);

  const checkDocumentoExists = async (doc) => {
    if (!doc || isEditing) return;
    const usuarios = await getUsuarios();
    const exists = usuarios.some(u => u.documento === doc);
    setDocumentoExists(exists);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (['nombre', 'apellido', 'direccion', 'barrio'].includes(name)) {
      processedValue = normalizeText(value);
    } else if (name === 'documento') {
      processedValue = value.toUpperCase();
    }
    
    setForm({ ...form, [name]: processedValue });
    
    if (name === 'documento') {
      checkDocumentoExists(processedValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError('El nombre y apellido son requeridos');
      return;
    }

    if (!isEditing) {
      if (!form.documento.trim()) {
        setError('El documento es requerido');
        return;
      }
      if (documentoExists) {
        setError('El número de documento ya está registrado');
        return;
      }
      if (form.password.length < 6) {
        setError('La contraseña debe tener mínimo 6 caracteres');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    } else {
      if (form.password && form.password.length < 6) {
        setError('La contraseña debe tener mínimo 6 caracteres');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    if (!form.rolId) {
      setError('Debe seleccionar un rol');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        nombre: normalizeText(form.nombre),
        apellido: normalizeText(form.apellido),
        tipoDocumento: form.tipoDocumento,
        documento: form.documento.toUpperCase(),
        genero: form.genero,
        telefono: form.telefono,
        direccion: form.direccion ? normalizeText(form.direccion) : '',
        barrio: form.barrio ? normalizeText(form.barrio) : '',
        email: form.email.toLowerCase().trim(),
        rolId: form.rolId,
        estado: form.estado
      };

      if (!isEditing) {
        userData.password = form.password;
      } else if (form.password) {
        userData.password = form.password;
      }

      if (isEditing) {
        await updateUsuario(id, userData);
      } else {
        await createUsuario(userData);
      }

      navigate('/admin/usuarios');
    } catch (err) {
      setError(err.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="container mt-4">Cargando...</div>;
  }

  if (loadError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h5>Error al cargar datos</h5>
          <p className="mb-0">{loadError}</p>
          <button className="btn btn-secondary mt-2" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <div className="card">
        <div className="card-header">
          <h4 className="mb-0">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4">
                <h6 className="text-primary mb-3 border-bottom pb-2">Información Personal</h6>
                
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
                  <label className="form-label">Apellido *</label>
                  <input 
                    type="text" 
                    name="apellido" 
                    className="form-control" 
                    value={form.apellido} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo Documento</label>
                  <select name="tipoDocumento" className="form-select" value={form.tipoDocumento} onChange={handleChange}>
                    <option value="CC">CC - Cédula de Ciudadanía</option>
                    <option value="CE">CE - Cédula de Extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Número de Documento {!isEditing && '*'}</label>
                  <input 
                    type="text" 
                    name="documento" 
                    className={`form-control ${documentoExists ? 'is-invalid' : ''}`} 
                    value={form.documento} 
                    onChange={handleChange} 
                    required={!isEditing}
                    disabled={isEditing}
                  />
                  {documentoExists && <div className="invalid-feedback">El documento ya existe</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Género</label>
                  <select name="genero" className="form-select" value={form.genero} onChange={handleChange}>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefono" 
                    className="form-control" 
                    value={form.telefono} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="col-md-4">
                <h6 className="text-primary mb-3 border-bottom pb-2">Información de Contacto</h6>
                
                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <input 
                    type="text" 
                    name="direccion" 
                    className="form-control" 
                    value={form.direccion} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Barrio</label>
                  <input 
                    type="text" 
                    name="barrio" 
                    className="form-control" 
                    value={form.barrio} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="col-md-4">
                <h6 className="text-primary mb-3 border-bottom pb-2">Credenciales y Acceso</h6>
                
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Contraseña {isEditing ? '(dejar vacío para mantener)' : '*'}
                  </label>
                  <input 
                    type="password" 
                    name="password" 
                    className="form-control" 
                    value={form.password} 
                    onChange={handleChange} 
                    required={!isEditing}
                    minLength={6}
                  />
                  <small className="text-muted">Mínimo 6 caracteres</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar Contraseña *</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    className="form-control" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    required={!isEditing || !!form.password}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rol *</label>
                  <select 
                    name="rolId" 
                    className="form-select" 
                    value={form.rolId} 
                    onChange={handleChange}
                    required
                    disabled={!isAdmin && isEditing}
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {isEditing && (
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="estado"
                        checked={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="estado">
                        Usuario Activo
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary ms-2" 
                  onClick={() => navigate('/admin/usuarios')}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsuarioEdit;