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
  const { isDark } = useModoOscuro();

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

  return (
    <ConfiguracionContext.Provider value={{ ...config, loading, refetch, temaResuelto }}>
      {children}
    </ConfiguracionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook co-ubicado a propósito con su Provider
export const useConfiguracion = () => useContext(ConfiguracionContext);
