import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getConfiguracion } from '../services/api/configuracion.api';
import { resolverTema, aplicarTemaCss } from '../utils/tema';
import { useModoOscuro } from '../hooks/useModoOscuro';

const DEFECTO = {
  nombreTienda: 'SISGEM',
  logoUrl: '',
  descripcion: '',
  direccion: '',
  telefono: '',
  email: '',
  horario: [],
  tema: { modo: 'NINGUNO', paletaId: null, colores: null },
  mapaEmbedUrl: '',
};

const ConfiguracionContext = createContext({ ...DEFECTO, loading: true, refetch: () => {} });

// A diferencia de una preferencia personal (tema claro/oscuro, guardado por
// navegador en localStorage — ver hooks/useModoOscuro.js), esta configuración
// vive en la base de datos y es la MISMA para todos los visitantes del
// sitio: se carga una vez al montar la app desde GET /api/configuracion.
export const ConfiguracionProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFECTO);
  const [loading, setLoading] = useState(true);
  const { isDark, setThemeMode } = useModoOscuro();

  const refetch = useCallback(async () => {
    try {
      const data = await getConfiguracion();
      setConfig({ ...DEFECTO, ...data });
    } catch (err) {
      console.error('No se pudo cargar la configuración del sitio:', err);
    }
  }, []);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  const temaResuelto = useMemo(() => resolverTema(config.tema, isDark), [config.tema, isDark]);

  useEffect(() => {
    aplicarTemaCss(temaResuelto);
  }, [temaResuelto]);

  // Única llamada a useModoOscuro() de toda la app: `isDark`/`setThemeMode` se
  // reexponen aquí para que Header y AdminLayout compartan el mismo estado en
  // vez de tener cada uno su propia copia desincronizada.
  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', isDark);
  }, [isDark]);

  // El <title> estático de index.html es solo el valor por defecto antes de
  // que cargue la configuración; una vez cargada, la pestaña del navegador
  // refleja el nombre real de la tienda.
  useEffect(() => {
    if (config.nombreTienda) document.title = config.nombreTienda;
  }, [config.nombreTienda]);

  return (
    <ConfiguracionContext.Provider value={{ ...config, loading, refetch, temaResuelto, isDark, setThemeMode }}>
      {children}
    </ConfiguracionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook co-ubicado a propósito con su Provider
export const useConfiguracion = () => useContext(ConfiguracionContext);
