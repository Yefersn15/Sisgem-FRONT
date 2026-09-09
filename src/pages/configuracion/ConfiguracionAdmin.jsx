import ImageUploadField from '../../components/upload/ImageUploadField';
import HorarioBuilder from './components/HorarioBuilder';
import SelectorTema from './components/SelectorTema';
import { useConfiguracionForm, TOTAL_PASOS } from './hooks/useConfiguracionForm';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

// Si el admin pega el <iframe> completo que da "Insertar un mapa" en Google
// Maps, se queda solo con la URL del src — así no tiene que editar HTML a mano.
const extraerSrcDeIframe = (valor) => {
  const match = valor.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : valor.trim();
};

const PASOS = [
  { numero: 1, label: 'Identidad' },
  { numero: 2, label: 'Contacto' },
  { numero: 3, label: 'Horario' },
];

const ConfiguracionAdmin = () => {
  useAyudaPagina({
    titulo: 'Configuración',
    contenido: (
      <>
        <p>Datos de la tienda (nombre, logo, contacto, horario de atención, ubicación) y el tema de colores del sitio, visibles para todos los visitantes: encabezado, pie de página, inicio y panel de administración.</p>
        <p>Se guarda en la base de datos de esta tienda (no depende de servicios externos), excepto el mapa, que usa la URL de "Insertar un mapa" de Google Maps si la defines.</p>
      </>
    ),
  });
  const {
    form, setForm, guardando, handleSubmit, logoRef,
    paso, mostrarErrores, siguientePaso, pasoAnterior,
  } = useConfiguracionForm();

  if (!form) {
    return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
  }

  const mapaPareceValido = !form.mapaEmbedUrl || form.mapaEmbedUrl.includes('google.com/maps/embed');
  const nombreInvalido = mostrarErrores && form.nombreTienda.trim().length < 2;

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-2">Configuración de la tienda</h2>
      <p className="text-muted mb-4">
        Personaliza el nombre, logo y datos de contacto que se muestran en todo el sitio para todos los visitantes.
      </p>
      <div className="card mx-auto" style={{ maxWidth: 720 }}>
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-4">
            {PASOS.map(({ numero, label }, i) => (
              <div key={numero} className="d-flex align-items-center flex-grow-1">
                <div className="d-flex flex-column align-items-center text-center" style={{ minWidth: 70 }}>
                  <span
                    className={`d-flex align-items-center justify-content-center rounded-circle fw-bold ${paso >= numero ? 'tema-acento-bg' : 'bg-secondary-subtle text-muted'}`}
                    style={{ width: 32, height: 32 }}
                  >
                    {paso > numero ? <i className="fas fa-check"></i> : numero}
                  </span>
                  <small className={paso === numero ? 'fw-semibold' : 'text-muted'}>{label}</small>
                </div>
                {i < PASOS.length - 1 && (
                  <div className={`flex-grow-1 ${paso > numero ? 'tema-acento-bg' : 'bg-secondary-subtle'}`} style={{ height: 2, marginBottom: 18 }} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {paso === 1 && (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nombre de la tienda *</label>
                  <input
                    type="text"
                    className={`form-control ${nombreInvalido ? 'is-invalid' : ''}`}
                    maxLength={150}
                    value={form.nombreTienda}
                    onChange={(e) => setForm({ ...form, nombreTienda: e.target.value })}
                  />
                  {nombreInvalido && <div className="invalid-feedback">El nombre debe tener al menos 2 caracteres</div>}
                </div>

                <div className="col-12">
                  <label className="form-label d-block">Tema de colores del sitio</label>
                  <SelectorTema value={form.tema} onChange={(tema) => setForm({ ...form, tema })} />
                </div>

                <div className="col-12">
                  <ImageUploadField
                    ref={logoRef}
                    label="Logo"
                    folder="logo"
                    value={form.logoUrl}
                    onValueChange={(url) => setForm({ ...form, logoUrl: url })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Frase de bienvenida (se muestra en el inicio)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    maxLength={2000}
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  />
                </div>
              </div>
            )}

            {paso === 2 && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Calle 52 #43-31, Medellín"
                    maxLength={200}
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                  <small className="text-muted">Si no defines una URL de mapa abajo, el mapa del inicio se arma con esta dirección.</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input type="text" className="form-control" maxLength={30} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Correo de contacto</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>

                <div className="col-12">
                  <label className="form-label">URL de Google Maps (opcional, para un mapa más preciso)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pega aquí el código de Google Maps > Compartir > Insertar un mapa"
                    value={form.mapaEmbedUrl}
                    onChange={(e) => setForm({ ...form, mapaEmbedUrl: extraerSrcDeIframe(e.target.value) })}
                  />
                  <small className="text-muted d-block">
                    En Google Maps: busca tu ubicación → <strong>Compartir</strong> → pestaña <strong>Insertar un mapa</strong> → <strong>Copiar HTML</strong>, y pégalo aquí (se toma el enlace automáticamente). El enlace normal de "Compartir ubicación" no funciona para insertar, por eso tiene que ser ese.
                  </small>
                  {!mapaPareceValido && (
                    <div className="alert alert-warning py-2 mt-2 mb-0 small">
                      Esta URL no parece ser de "Insertar un mapa" — puede que no se muestre. Si falla, deja este campo vacío y se usará la dirección de arriba.
                    </div>
                  )}
                  {form.mapaEmbedUrl && (
                    <div className="mt-2 border rounded overflow-hidden">
                      <iframe title="Vista previa del mapa" src={form.mapaEmbedUrl} width="100%" height="200" style={{ border: 0, display: 'block' }} loading="lazy" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {paso === 3 && (
              <div>
                <label className="form-label d-block">Horario de atención</label>
                <HorarioBuilder reglas={form.horario} onChange={(horario) => setForm({ ...form, horario })} />
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              {paso > 1 ? (
                <button type="button" className="btn btn-outline-secondary" onClick={pasoAnterior} disabled={guardando}>
                  <i className="fas fa-arrow-left me-2"></i>Atrás
                </button>
              ) : <span />}

              {paso < TOTAL_PASOS ? (
                <button type="button" className="btn btn-primary" onClick={siguientePaso}>
                  Siguiente<i className="fas fa-arrow-right ms-2"></i>
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : (<><i className="fas fa-save me-2"></i>Guardar cambios</>)}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionAdmin;
